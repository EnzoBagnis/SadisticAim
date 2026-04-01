import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableWithoutFeedback, Dimensions, Alert } from 'react-native';
import { useGyroscope } from './src/hooks/useGyroscope';
import ClickBar from './src/components/ClickBar';
import BoostBar from './src/components/BoostBar';

const { width: SCREEN_W } = Dimensions.get('window');
const ZONE_W = SCREEN_W - 40;
const ZONE_H = ZONE_W / 4;
const TARGET_W = 50;
const TARGET_H = ZONE_H;
const SWEET_W = 14;
const SWEET_H = 14;
const TARGET_SPEED = 1.5;
const BOOST_MAX = 100;
const BOOST_HIT = 10;
const BOOST_SWEET = 25;
const BOOST_MISS = -15;
const BOOST_DRAIN = 0.15;
const DIRECTION_CHANGE_MS = 1200;

export default function App() {
  const gyro = useGyroscope();
  const [boost, setBoost] = useState(0);
  const [won, setWon] = useState(false);

  const [targetX, setTargetX] = useState(ZONE_W / 2 - TARGET_W / 2);
  const targetXRef = useRef(ZONE_W / 2 - TARGET_W / 2);
  const dirRef = useRef(1);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => {
      setBoost((b) => Math.max(0, b - BOOST_DRAIN));
    }, 100);
    return () => clearInterval(id);
  }, [won]);

  const cursorX = Math.max(0, Math.min(ZONE_W / 2 + gyro.x, ZONE_W));
  const cursorY = Math.max(0, Math.min(ZONE_H / 2 + gyro.y, ZONE_H));

  useEffect(() => {
    if (won) return;
    let lastDirChange = Date.now();
    let frameId;

    const animate = () => {
      const now = Date.now();
      if (now - lastDirChange > DIRECTION_CHANGE_MS) {
        dirRef.current = Math.random() > 0.5 ? 1 : -1;
        lastDirChange = now;
      }

      let nx = targetXRef.current + dirRef.current * TARGET_SPEED;

      if (nx < 0 || nx > ZONE_W - TARGET_W) dirRef.current *= -1;
      nx = Math.max(0, Math.min(nx, ZONE_W - TARGET_W));

      targetXRef.current = nx;
      setTargetX(nx);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [won]);

  const handleTap = useCallback(() => {
    if (won) return;

    const onTargetX = cursorX >= targetX && cursorX <= targetX + TARGET_W;
    const onTargetY = cursorY >= 0 && cursorY <= ZONE_H;

    if (!onTargetX || !onTargetY) {
      setBoost((b) => Math.max(0, b + BOOST_MISS));
      return;
    }
    const sweetX = targetX + (TARGET_W - SWEET_W) / 2;
    const sweetY = (ZONE_H - SWEET_H) / 2;
    const onSweet = cursorX >= sweetX && cursorX <= sweetX + SWEET_W
      && cursorY >= sweetY && cursorY <= sweetY + SWEET_H;

    const gain = onSweet ? BOOST_SWEET : BOOST_HIT;
    const newBoost = Math.min(BOOST_MAX, boost + gain);
    setBoost(newBoost);

    if (newBoost >= BOOST_MAX) {
      setWon(true);
      Alert.alert('Victoire !', 'Boost au maximum !', [
        { text: 'Rejouer', onPress: () => { setBoost(0); setWon(false); } },
      ]);
    }
  }, [cursorX, cursorY, targetX, boost, won]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 24, marginBottom: 30 }}>SadisticAim</Text>
        <View style={{ width: ZONE_W, height: ZONE_H, borderWidth: 1, borderColor: '#444', overflow: 'visible' }}>
          <View
            style={{
              position: 'absolute',
              left: targetX,
              top: 0,
              width: TARGET_W,
              height: ZONE_H,
              backgroundColor: '#FF4444',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: (TARGET_W - SWEET_W) / 2,
                top: (ZONE_H - SWEET_H) / 2,
                width: SWEET_W,
                height: SWEET_H,
                backgroundColor: '#FFD700',
              }}
            />
          </View>
          <ClickBar cursorX={cursorX} cursorY={cursorY} zoneW={ZONE_W} zoneH={ZONE_H} />
        </View>

        <BoostBar value={boost} max={BOOST_MAX} />
      </View>
    </TouchableWithoutFeedback>
  );
}
