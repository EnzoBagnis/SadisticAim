import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Button, Modal, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ClickBar from '../components/ClickBar';
import BoostBar from '../components/BoostBar';
import SettingsModal from '../components/SettingsModal';
import { useGame } from '../context/GameContext';
import campaign from '../../campain.json';

export default function CampaignScreen({ onGoBack }) {
  const {
    config,
    targetX,
    cursorX,
    cursorY,
    handleTap,
    resetGame,
    updateConfig,
    boost,
    setGameWon,
    playGlobalMusic,
    openSettings
  } = useGame();

  const [level, setLevel] = useState(1);
  const [world, setWorld] = useState(1);
  const [levelName, setLevelName] = useState(campaign.World_1.Level_1_1.name);
  const [levelEndText, setLevelEndText] = useState(campaign.World_1.Level_1_1.end_text);
  const [levelStartText, setLevelStartText] = useState(campaign.World_1.Level_1_1.start_text);
  const [worldName, setWorldName] = useState(campaign.World_1.world_name);
  const [worldDescription, setWorldDescription] = useState(campaign.World_1.world_description);

  const [showEndTextModal, setShowEndTextModal] = useState(false);
  const [showStartTextModal, setShowStartTextModal] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const { ZONE_W, ZONE_H, TARGET_W, TARGET_H, SWEET_W, SWEET_H, BOOST_MAX } = config;

  useEffect(() => {
    // Initialize config for level 1
    updateCampaign(level,world);

    // Fallback to main music when leaving CampaignScreen
    return () => {
      if (playGlobalMusic) {
        playGlobalMusic('main');
      }
    };
  }, []);

  const updateCampaign = (currentLevel,world) => {
      const worldData = campaign[`World_${world}`];
      if (worldData) {
        setWorldName(worldData.world_name);
        setWorldDescription(worldData.world_description);
      }
    const levelData = campaign[`World_${world}`][`Level_${world}_${currentLevel}`];
    if (levelData) {
      setLevelName(levelData.name);
      setLevelEndText(levelData.end_text);
      setLevelStartText(levelData.start_text);

      // On extrait la configuration de la campagne (sans le nom) pour l'appliquer au jeu
      const { name, description, start_text, end_text, background, ...configUpdates } = levelData;
      updateConfig(configUpdates);

      // Play boss music if it's the 6th level (last level of the world), else play campaign music
      if (playGlobalMusic) {
        if (currentLevel === 6) {
          playGlobalMusic('boss');
        } else {
          playGlobalMusic('campaign');
        }
      }
    }
  };

  const onPress = () => {
    if (showStartTextModal || showEndTextModal) return; // Ignore taps while win screen is up
    const isWin = handleTap();
    if (isWin) {
      setGameWon();
      setShowEndTextModal(true);
    }
  };

  const handleEndTextContinue = () => {
    setShowEndTextModal(false);
    setShowStartTextModal(true);
    setCanProceed(false);
    setTimeout(() => {
      setCanProceed(true);
    }, 5000);
  };

  const handleNextLevel = () => {
    setShowStartTextModal(false);
    resetGame();
    let nextWorld, nextLevel;
    if (level >= 6) {
        nextWorld = world + 1;
        nextLevel = 1;
    } else {
        nextWorld = world;
        nextLevel = level + 1;
    }
    setLevel(nextLevel);
    setWorld(nextWorld);
    updateCampaign(nextLevel, nextWorld);
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          style={{
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
          }}
          onPress={openSettings}
        >
          <Text style={{ fontSize: 24, color: '#fff' }}>⚙️</Text>
        </Pressable>

        <Text style={{ color: '#fff', fontSize: 24, marginBottom: 30 }}>Campagne</Text>
        {onGoBack && <Button title="Retour au menu" onPress={onGoBack} color="#ff4444" />}
        <Text style={{ color: '#ccc', fontSize: 16, marginTop: 10 }}>Monde {world} : {worldName}</Text>
        <Text style={{ color: '#ccc', fontSize: 16, marginTop: 5 }}>{worldDescription}</Text>
        <Text style={{ color: '#ccc', fontSize: 16, marginTop: 10 }}>Niveau {level} : {campaign[`World_${world}`][`Level_${world}_${level}`].name}</Text>
        <Text style={{ color: '#ccc', fontSize: 16, marginTop: 10 }}>{campaign[`World_${world}`][`Level_${world}_${level}`].description}</Text>

        <View style={{ flexDirection: 'row', width: '90%', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
          <Picker
            selectedValue={`World_${world}`}
            style={{ flex: 1, height: 50, color: '#000' }}
            onValueChange={(itemValue) => {
              const newWorld = parseInt(itemValue.replace('World_', ''));
              setWorld(newWorld);
              setLevel(1);
              updateCampaign(1, newWorld);
              resetGame();
            }}
          >
            {Object.keys(campaign).map((worldKey) => (
              <Picker.Item key={worldKey} label={worldKey} value={worldKey} color="#fff" />
            ))}
          </Picker>
          <Picker
            selectedValue={`Level_${world}_${level}`}
            style={{ flex: 1, height: 50, color: '#000' }}
            onValueChange={(itemValue) => {
              const parts = itemValue.split('_');
              const newLevel = parseInt(parts[2]);
              setLevel(newLevel);
              updateCampaign(newLevel, world);
              resetGame();
            }}
          >
            {Object.keys(campaign[`World_${world}`] || {}).map((levelKey) => (
              <Picker.Item key={levelKey} label={campaign[`World_${world}`][levelKey].name} value={levelKey} color="#fff" />
            ))}
          </Picker>
        </View>

        <Text style={{ color: '#fff', fontSize: 18, marginTop: 20 }}>{levelName}</Text>
        <View style={{ width: ZONE_W, height: ZONE_H, borderWidth: 1, borderColor: '#444', overflow: 'visible', marginTop: 20 }}>
          <View
            style={{
              position: 'absolute',
              left: targetX,
              top: (ZONE_H - TARGET_H) / 2,
              width: TARGET_W,
              height: TARGET_H,
              backgroundColor: '#FF4444',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: (TARGET_W - SWEET_W) / 2,
                top: (TARGET_H - SWEET_H) / 2,
                width: SWEET_W,
                height: SWEET_H,
                backgroundColor: '#FFD700',
              }}
            />
          </View>
          <ClickBar cursorX={cursorX} cursorY={cursorY} zoneW={ZONE_W} zoneH={ZONE_H} />
        </View>

        <BoostBar value={boost} max={BOOST_MAX} />

        <Modal visible={showEndTextModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Objectif atteint</Text>
              <Text style={styles.modalText}>{levelEndText}</Text>
              <Button title="Continuer" onPress={handleEndTextContinue} color="#007bff" />
            </View>
          </View>
        </Modal>

        <Modal visible={showStartTextModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Victoire !</Text>
              <Text style={styles.modalText}>{levelStartText}</Text>
              {canProceed ? (
                <Button title="Niveau suivant" onPress={handleNextLevel} color="#28a745" />
              ) : (
                <Text style={styles.modalWaitText}>Veuillez patienter...</Text>
              )}
            </View>
          </View>
        </Modal>

        <SettingsModal />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalWaitText: {
    color: '#aaa',
    fontSize: 16,
    fontStyle: 'italic',
  },
});
