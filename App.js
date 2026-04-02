import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  Alert,
} from "react-native";
import { useGyroscope } from "./src/hooks/useGyroscope";
import ClickBar from "./src/components/ClickBar";
import BoostBar from "./src/components/BoostBar";
import Shop from "./src/components/Shop";
import {
  ZONE_W,
  ZONE_H,
  TARGET_W,
  SWEET_W,
  SWEET_H,
  TARGET_SPEED,
  BOOST_MAX,
  BOOST_HIT,
  BOOST_SWEET,
  BOOST_MISS,
  BOOST_DRAIN,
  DIRECTION_CHANGE_MS,
} from "./src/BaseVar";

export default function App() {
  const gyro = useGyroscope();
  const [boost, setBoost] = useState(0);
  const [won, setWon] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [points, setPoints] = useState(600);
  const [shopLevels, setShopLevels] = useState({});

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
    const onSweet =
      cursorX >= sweetX &&
      cursorX <= sweetX + SWEET_W &&
      cursorY >= sweetY &&
      cursorY <= sweetY + SWEET_H;

    const gain = onSweet ? BOOST_SWEET : BOOST_HIT;
    const newBoost = Math.min(BOOST_MAX, boost + gain);
    setBoost(newBoost);

    if (newBoost >= BOOST_MAX) {
      setWon(true);

      setBoost(0);
      setWon(false);
    }
    setPoints((currentPoints) => currentPoints + gain);
  }, [cursorX, cursorY, targetX, boost, won]);

  const handleBuyUpgrade = useCallback((upgradeId, price) => {
    setPoints((currentPoints) => {
      if (currentPoints < price) return currentPoints;
      setShopLevels((currentLevels) => ({
        ...currentLevels,
        [upgradeId]: (currentLevels[upgradeId] ?? 0) + 1,
      }));
      return currentPoints - price;
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 24, marginBottom: 16 }}>
        SadisticAim
      </Text>

      <TouchableWithoutFeedback onPress={handleTap}>
        <View
          style={{
            width: ZONE_W,
            height: ZONE_H,
            borderWidth: 1,
            borderColor: "#444",
            overflow: "visible",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: targetX,
              top: 0,
              width: TARGET_W,
              height: ZONE_H,
              backgroundColor: "#FF4444",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: (TARGET_W - SWEET_W) / 2,
                top: (ZONE_H - SWEET_H) / 2,
                width: SWEET_W,
                height: SWEET_H,
                backgroundColor: "#FFD700",
              }}
            />
          </View>
          <ClickBar
            cursorX={cursorX}
            cursorY={cursorY}
            zoneW={ZONE_W}
            zoneH={ZONE_H}
          />
        </View>
      </TouchableWithoutFeedback>

      <BoostBar value={boost} max={BOOST_MAX} />

      <Pressable
        onPress={() => setShowShop((value) => !value)}
        style={{
          marginTop: 16,
          backgroundColor: "#2563eb",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {showShop ? "Fermer le Shop" : "Accéder au Shop"}
        </Text>
      </Pressable>

      {showShop ? (
        <Shop points={points} levels={shopLevels} onBuy={handleBuyUpgrade} />
      ) : null}
    </View>
  );
}
