import React from 'react';
import { View, Text, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import ClickBar from './src/components/ClickBar';
import BoostBar from './src/components/BoostBar';
import SettingsModal from './src/components/SettingsModal';

function GameScreen() {
  const {
    config,
    targetX,
    handleTap,
    resetGame,
    setGameWon,
    openSettings,
  } = useGame();

  const { ZONE_W, ZONE_H, TARGET_W, SWEET_W, SWEET_H } = config;

  const onPress = () => {
    const isWin = handleTap();
    if (isWin) {
      setGameWon();
      Alert.alert('Victoire !', 'Boost au maximum !', [
        { text: 'Rejouer', onPress: resetGame },
      ]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={openSettings}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>

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
          <ClickBar />
        </View>

        <BoostBar />
        <SettingsModal />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}

const styles = {
  settingsBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: '#fff',
  },
};
