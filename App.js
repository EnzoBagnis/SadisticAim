import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableWithoutFeedback, Pressable, StyleSheet } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import ClickBar from './src/components/ClickBar';
import BoostBar from './src/components/BoostBar';
import SettingsModal from './src/components/SettingsModal';
import CampaignScreen from './src/screens/CampaignScreen';
import Shop from "./src/components/Shop";
import { useGyroscope } from './src/hooks/useGyroscope';
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
  STARTING_POINTS,
  getPointsPerHit,
  getPointsSweetBonus,
  getTargetSpeed,
  getBoostMissLoss,
  getSweetZoneSize,
  getPassivePoints,
  getZoneWidth,
  getZoneHeight,
  getTargetMovementZone,
} from "./src/BaseVar";

function GameScreen({ onGoToCampaign }) {
  const gyro = useGyroscope();
  const [boost, setBoost] = useState(0);
  const [won, setWon] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [points, setPoints] = useState(STARTING_POINTS);
  const [shopLevels, setShopLevels] = useState({});

  const [targetX, setTargetX] = useState(ZONE_W / 2 - TARGET_W / 2);
  const targetXRef = useRef(ZONE_W / 2 - TARGET_W / 2);
  const dirRef = useRef(1);

  // Gain passif de points
  useEffect(() => {
    const passiveLevel = shopLevels.passivePoints ?? 0;
    if (passiveLevel <= 0) return;

    const pointsPerSecond = getPassivePoints(passiveLevel);
    const id = setInterval(() => {
      setPoints((p) => p + pointsPerSecond);
    }, 1000);
    return () => clearInterval(id);
  }, [shopLevels.passivePoints]);

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

       const adjustedSpeed = getTargetSpeed(TARGET_SPEED, shopLevels.slowTarget ?? 0);
       const adjustedZoneWidth = getZoneWidth(ZONE_W, shopLevels.biggerZone ?? 0);
       const targetMovementZone = getTargetMovementZone(adjustedZoneWidth, shopLevels.smallerTargetZone ?? 0);

       let nx = targetXRef.current + dirRef.current * adjustedSpeed;

       if (nx < 0 || nx > targetMovementZone - TARGET_W) dirRef.current *= -1;
       nx = Math.max(0, Math.min(nx, targetMovementZone - TARGET_W));

       targetXRef.current = nx;
       setTargetX(nx);
       frameId = requestAnimationFrame(animate);
     };

     frameId = requestAnimationFrame(animate);
     return () => cancelAnimationFrame(frameId);
   }, [won, shopLevels]);

   const handleTap = useCallback(() => {
     if (won) return;

     const adjustedZoneHeight = getZoneHeight(ZONE_H, shopLevels.biggerZone ?? 0);
     // Appliquer améliorations pour la taille de la zone douce
     const adjustedSweetW = getSweetZoneSize(SWEET_W, shopLevels.sweetZoneSize ?? 0);
     const adjustedSweetH = getSweetZoneSize(SWEET_H, shopLevels.sweetZoneSize ?? 0);

     const onTargetX = cursorX >= targetX && cursorX <= targetX + TARGET_W;
     const onTargetY = cursorY >= 0 && cursorY <= adjustedZoneHeight;

     if (!onTargetX || !onTargetY) {
       const missLoss = getBoostMissLoss(BOOST_MISS, shopLevels.lessLoss ?? 0);
       setBoost((b) => Math.max(0, b + missLoss));
       return;
     }
     const sweetX = targetX + (TARGET_W - adjustedSweetW) / 2;
     const sweetY = (adjustedZoneHeight - adjustedSweetH) / 2;
     const onSweet =
       cursorX >= sweetX &&
       cursorX <= sweetX + adjustedSweetW &&
       cursorY >= sweetY &&
       cursorY <= sweetY + adjustedSweetH;

     // Appliquer améliorations pour les points
     const hitGain = getPointsPerHit(BOOST_HIT, shopLevels.plusPoints ?? 0);
     const sweetGain = getPointsSweetBonus(BOOST_SWEET, shopLevels.betterBonus ?? 0);
     const gain = onSweet ? sweetGain : hitGain;
     const newBoost = Math.min(BOOST_MAX, boost + gain);
     setBoost(newBoost);

     if (newBoost >= BOOST_MAX) {
       setWon(true);

       setBoost(0);
       setWon(false);
     }
     setPoints((currentPoints) => currentPoints + gain);
   }, [cursorX, cursorY, targetX, boost, won, shopLevels]);

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

   const adjustedSweetW = getSweetZoneSize(SWEET_W, shopLevels.sweetZoneSize ?? 0);
   const adjustedSweetH = getSweetZoneSize(SWEET_H, shopLevels.sweetZoneSize ?? 0);
   const adjustedZoneWidth = getZoneWidth(ZONE_W, shopLevels.biggerZone ?? 0);
   const adjustedZoneHeight = getZoneHeight(ZONE_H, shopLevels.biggerZone ?? 0);
   const passivePointsPerSec = shopLevels.passivePoints && shopLevels.passivePoints > 0
     ? getPassivePoints(shopLevels.passivePoints)
     : 0;
   const { openSettings } = useGame();

   return (
    <TouchableWithoutFeedback onPress={handleTap} disabled={showShop}>
     <View style={styles.container}>
       <View style={styles.headerRow}>
         <Text style={styles.title}>
           SadisticAim
         </Text>
         <Text style={styles.pointsText}>
           Points: {Math.floor(points)}
         </Text>
         {passivePointsPerSec > 0 && (
           <Text style={styles.passiveText}>
             +{passivePointsPerSec.toFixed(1)}/sec
           </Text>
         )}
       </View>

       <Pressable style={styles.settingsBtn} onPress={openSettings}>
         <Text style={styles.settingsIcon}>⚙</Text>
       </Pressable>

         <View
           style={[styles.gameArea, {
             width: adjustedZoneWidth,
             height: adjustedZoneHeight,
           }]}
         >
           <View
             pointerEvents="none"
             style={{
               position: "absolute",
               left: targetX,
               top: 0,
               width: TARGET_W,
               height: adjustedZoneHeight,
               backgroundColor: "#FF2A2A",
               shadowColor: "#FF2A2A",
               shadowOffset: { width:0, height:0 },
               shadowOpacity: 0.8,
               shadowRadius: 10,
             }}
           >
             <View
               style={{
                 position: "absolute",
                 left: (TARGET_W - adjustedSweetW) / 2,
                 top: (adjustedZoneHeight - adjustedSweetH) / 2,
                 width: adjustedSweetW,
                 height: adjustedSweetH,
                 backgroundColor: "#FFFFFF",
                 shadowColor: "#FFFFFF",
                 shadowOffset: { width:0, height:0 },
                 shadowOpacity: 1,
                 shadowRadius: 5,
               }}
             />
           </View>
          <ClickBar
            cursorX={cursorX}
            cursorY={cursorY}
            zoneW={adjustedZoneWidth}
            zoneH={adjustedZoneHeight}
          />
        </View>

      <View style={styles.boostContainer}>
        <BoostBar value={boost} max={BOOST_MAX} />
      </View>
        <View style={styles.actionContainer}>
          <Pressable style={styles.campaignBtn} onPress={onGoToCampaign}>
            <Text style={styles.campaignBtnText}>ALLER À LA CAMPAGNE</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowShop((value) => !value)}
            style={styles.shopBtn}
          >
            <Text style={styles.shopBtnText}>
              {showShop ? "FERMER LE QG" : "ACCÉDER AU QG (SHOP)"}
            </Text>
          </Pressable>
        </View>

      {showShop ? (
        <Shop points={points} levels={shopLevels} onBuy={handleBuyUpgrade} />
      ) : null}
         <SettingsModal />
     </View>
    </TouchableWithoutFeedback>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');

  return (
    <GameProvider>
      {currentScreen === 'campaign' ? (
        <CampaignScreen onGoBack={() => setCurrentScreen('main')} />
      ) : (
        <GameScreen onGoToCampaign={() => setCurrentScreen('campaign')} />
      )}
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a16",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 24,
    backgroundColor: "rgba(20,20,35,0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  title: {
    color: "#00ffff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    textShadowColor: "#00ffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowOpacity: 0.8,
    textShadowRadius: 8,
  },
  pointsText: {
    color: "#d0d0e0",
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "bold",
  },
  passiveText: {
    color: "#00ff66",
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  settingsBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
    color: '#fff',
  },
  gameArea: {
    borderWidth: 2,
    borderColor: "#00ffff",
    backgroundColor: "rgba(0,0,0,0.5)",
    overflow: "visible",
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  boostContainer: {
    width: '100%',
    marginTop: 30,
    alignItems: 'center',
  },
  actionContainer: {
    marginTop: 30,
    width: '100%',
    gap: 15,
  },
  campaignBtn: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffff',
    alignItems: 'center',
  },
  campaignBtnText: {
    color: '#00ffff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  shopBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
