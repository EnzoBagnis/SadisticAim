import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Pressable, Modal, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    openSettings,
    playVictoryMusic,
    playLoseMusic,
    stopLoseMusic
  } = useGame();

  const [isLoading, setIsLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [world, setWorld] = useState(1);
  const [levelName, setLevelName] = useState(campaign.World_1.Level_1_1.name);
  const [levelEndText, setLevelEndText] = useState(campaign.World_1.Level_1_1.end_text);
  const [levelStartText, setLevelStartText] = useState(campaign.World_1.Level_1_1.start_text);
  const [worldName, setWorldName] = useState(campaign.World_1.world_name);
  const [worldDescription, setWorldDescription] = useState(campaign.World_1.world_description);

  const [showEndTextModal, setShowEndTextModal] = useState(false);
  const [showStartTextModal, setShowStartTextModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showKonamiModal, setShowKonamiModal] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [konamiActivated, setKonamiActivated] = useState(false);

  const konamiSequence = ['U', 'U', 'D', 'D', 'L', 'R', 'L', 'R'];
  const konamiIndex = React.useRef(0);
  const lastKonamiTime = React.useRef(0);

  const { ZONE_W, ZONE_H, TARGET_W, TARGET_H, SWEET_W, SWEET_H, BOOST_MAX, BOOST_DRAIN } = config;

  // Set colors based on the current world
  const getWorldColor = (w) => {
    switch (w) {
      case 1: return '#8b5a2b'; // Earth/Crystal
      case 2: return '#00ffff'; // Neon Water
      case 3: return '#0055ff'; // Cobalt Fire
      case 4: return '#99ff99'; // Electric Jade
      case 5: return '#6600cc'; // Void
      default: return '#00ffff';
    }
  };
  const themeColor = getWorldColor(world);

  useEffect(() => {
    const loadCampaignProgress = async () => {
      try {
        const savedWorld = await AsyncStorage.getItem('@campaign_world');
        const savedLevel = await AsyncStorage.getItem('@campaign_level');
        const initialWorld = savedWorld ? parseInt(savedWorld, 10) : 1;
        const initialLevel = savedLevel ? parseInt(savedLevel, 10) : 1;

        setWorld(initialWorld);
        setLevel(initialLevel);
        updateCampaign(initialLevel, initialWorld);
      } catch (error) {
        console.error("Erreur de chargement de la campagne", error);
        updateCampaign(1, 1);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignProgress();

    // Fallback to main music when leaving CampaignScreen
    return () => {
      if (playGlobalMusic) {
        playGlobalMusic('main');
      }
    };
  }, []);

  const saveCampaignProgress = async (newLevel, newWorld) => {
    try {
      await AsyncStorage.setItem('@campaign_level', newLevel.toString());
      await AsyncStorage.setItem('@campaign_world', newWorld.toString());
    } catch (error) {
      console.error("Erreur de sauvegarde de la campagne", error);
    }
  };

  const updateCampaign = (currentLevel, world) => {
      const worldData = campaign[`World_${world}`];
      if (worldData) {
        setWorldName(worldData.world_name);
        setWorldDescription(worldData.world_description);
      }
    const levelData = campaign[`World_${world}`]?.[`Level_${world}_${currentLevel}`];
    if (levelData) {
      setLevelName(levelData.name);
      setLevelEndText(levelData.end_text);
      setLevelStartText(levelData.start_text);

      const { name, description, start_text, end_text, background, ...configUpdates } = levelData;
      updateConfig(configUpdates);
      setOpponentProgress(0);
      setShowGameOverModal(false);

      // Jouer la musique correcte
      if (playGlobalMusic) {
        if (currentLevel % 6 === 0) {
          playGlobalMusic('boss');
        } else {
          playGlobalMusic('campaign');
        }
      }
    }
  };

  useEffect(() => {
    if (showStartTextModal || showEndTextModal || showGameOverModal) return;
    const interval = setInterval(() => {
      setOpponentProgress((p) => {
        // L'adversaire avance en fonction de la difficulté (drain)
        const speed = (BOOST_DRAIN || 1) * 0.2;
        return Math.min(100, p + speed);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [showStartTextModal, showEndTextModal, showGameOverModal, BOOST_DRAIN, opponentProgress]);

  useEffect(() => {
    if (opponentProgress >= 100 && !showGameOverModal && !showStartTextModal && !showEndTextModal) {
      setShowGameOverModal(true);
      if (playLoseMusic) playLoseMusic(konamiActivated);
    }
  }, [opponentProgress, showGameOverModal, showStartTextModal, showEndTextModal]);

  const getDirection = (x, y, w, h) => {
    // Marges représentant la zone d'activation (33% du bord)
    const marginX = w * 1.00;
    const marginY = h * 0.33;

    const dx = x - w / 2;
    const dy = y - h / 2;

    // Détermine si on est plus proche d'un bord horizontal ou vertical
    if (Math.abs(dx) / w > Math.abs(dy) / h) {
      // Vérifie si on est dans la marge du bord (gauche ou droite)
      if (Math.abs(dx) > w / 2 - marginX) {
        return dx < 0 ? 'L' : 'R';
      }
    } else {
      // Vérifie si on est dans la marge du bord (haut ou bas)
      if (Math.abs(dy) > h / 2 - marginY) {
        return dy < 0 ? 'U' : 'D';
      }
    }
    // Si on est au centre (hors des marges), on ne valide aucune direction
    return null;
  };

  const onPress = () => {
    if (showStartTextModal || showEndTextModal || showGameOverModal || showKonamiModal) return;

    const now = Date.now();
    if (now - lastKonamiTime.current > 2500) {
      konamiIndex.current = 0; // Réinitialise si plus de 2.5s entre chaque clic
    }

    const dir = getDirection(cursorX, cursorY, ZONE_W, ZONE_H);

    if (dir) {
      if (dir === konamiSequence[konamiIndex.current]) {
        konamiIndex.current++;
        lastKonamiTime.current = now;
        if (konamiIndex.current === konamiSequence.length) {
          setKonamiActivated(true);
          setShowKonamiModal(true);
          konamiIndex.current = 0;
        }
      } else {
        if (dir === konamiSequence[0]) {
          konamiIndex.current = 1;
          lastKonamiTime.current = now;
        } else {
          konamiIndex.current = 0;
        }
      }
    }

    const isWin = handleTap();
    if (isWin) {
      setGameWon();
      if (playVictoryMusic) playVictoryMusic();
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
    setShowGameOverModal(false);
    resetGame();
    setOpponentProgress(0);
    let nextWorld, nextLevel;
    if (level >= 6) {
        nextWorld = world + 1;
        nextLevel = 1;
    } else {
        nextWorld = world;
        nextLevel = level + 1;
    }

    // Si le monde suivant n'existe pas, on recommence au premier niveau (Fin de la campagne)
    if (!campaign[`World_${nextWorld}`]) {
      nextWorld = 1;
      nextLevel = 1;
    }

    setLevel(nextLevel);
    setWorld(nextWorld);
    updateCampaign(nextLevel, nextWorld);
    saveCampaignProgress(nextLevel, nextWorld);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00ffff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
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

        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColor, textShadowColor: themeColor }]}>Campagne</Text>
          {onGoBack && (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Retour au QG</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.loreCard}>
          <Text style={[styles.worldText, { color: themeColor }]}>
            Monde {world} : {worldName}
          </Text>
          <Text style={styles.descText} numberOfLines={2}>{worldDescription}</Text>
          <View style={styles.separator} />
          <Text style={styles.levelTitle}>
            {level === 6 ? 'BOSS' : `Niveau ${level}`} : {levelName}
          </Text>
          <Text style={styles.descText}>{campaign[`World_${world}`]?.[`Level_${world}_${level}`]?.description}</Text>
        </View>

        <View style={styles.navRow}>
          <Pressable
            style={[styles.navBtn, { borderColor: themeColor }]}
            onPress={() => {
              const newWorld = world > 1 ? world - 1 : 5;
              setWorld(newWorld);
              setLevel(1);
              updateCampaign(1, newWorld);
              resetGame();
              saveCampaignProgress(1, newWorld);
            }}
          >
            <Text style={{color: themeColor}}>{'< '}</Text>
          </Pressable>
          <Text style={styles.navText}>Changer de Monde</Text>
          <Pressable
            style={[styles.navBtn, { borderColor: themeColor }]}
            onPress={() => {
              const newWorld = world < 5 ? world + 1 : 1;
              setWorld(newWorld);
              setLevel(1);
              updateCampaign(1, newWorld);
              resetGame();
              saveCampaignProgress(1, newWorld);
            }}
          >
            <Text style={{color: themeColor}}>{' >'}</Text>
          </Pressable>
        </View>

        <View style={styles.raceContainer}>
          <Text style={[styles.raceTitle, { color: themeColor }]}>Progression de la Course</Text>
          <View style={[styles.raceTrack, { borderColor: themeColor }]}>
            <View style={styles.finishLine} />

            {/* Curseur Joueur */}
            <View style={[styles.racerIcon, { left: `${Math.min(100, (boost / BOOST_MAX) * 100)}%`, backgroundColor: '#00ff66', top: 5 }]}>
              <Text style={styles.racerLabel}>VOUS</Text>
            </View>

            {/* Curseur Adversaire */}
            <View style={[styles.racerIcon, { left: `${opponentProgress}%`, backgroundColor: '#ff4444', bottom: 5 }]}>
              <Text style={styles.racerLabel}>{level % 6 === 0 ? 'BOSS' : 'ENNEMI'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.gameArea, { borderColor: themeColor, shadowColor: themeColor }]}>
          <View style={{ width: ZONE_W, height: ZONE_H, overflow: 'visible' }}>
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
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 5,
                }}
              />
            </View>
            <ClickBar cursorX={cursorX} cursorY={cursorY} zoneW={ZONE_W} zoneH={ZONE_H} />
          </View>
        </View>

        <View style={styles.boostContainer}>
          <BoostBar value={boost} max={BOOST_MAX} />
        </View>

        <Modal visible={showEndTextModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: themeColor }]}>
              <Text style={[styles.modalTitle, { color: themeColor }]}>Objectif atteint</Text>
              <Text style={styles.modalText}>{levelEndText}</Text>
              <Pressable style={[styles.modalBtn, { backgroundColor: themeColor }]} onPress={handleEndTextContinue}>
                <Text style={styles.modalBtnText}>Continuer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showStartTextModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: themeColor }]}>
              <Text style={[styles.modalTitle, { color: themeColor }]}>Victoire !</Text>
              <Text style={styles.modalText}>{levelStartText}</Text>
              {canProceed ? (
                <Pressable style={[styles.modalBtn, { backgroundColor: themeColor }]} onPress={handleNextLevel}>
                  <Text style={styles.modalBtnText}>Poursuivre la mission</Text>
                </Pressable>
              ) : (
                <Text style={styles.modalWaitText}>Analyse de l'environnement...</Text>
              )}
            </View>
          </View>
        </Modal>

        <Modal visible={showGameOverModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: '#ff003c', backgroundColor: '#1a0006' }]}>
              <Text style={[styles.modalTitle, { color: '#ff003c', textShadowColor: '#ff003c' }]}>ÉCHEC CRITIQUE</Text>
              <Text style={[styles.modalText, { color: '#ffcccc' }]}>{level % 6 === 0 ? 'Le boss' : 'L\'ennemi'} a atteint la ligne d'arrivée avant vous. Le système s'effondre.</Text>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#ff003c', marginTop: 20 }]} onPress={() => {
                setShowGameOverModal(false);
                if (stopLoseMusic) stopLoseMusic();
                resetGame();
                setOpponentProgress(0);
                updateCampaign(level, world);
              }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Relancer la simulation</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showKonamiModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: '#ffd700' }]}>
              <Text style={[styles.modalTitle, { color: '#ffd700', textShadowColor: '#ffd700' }]}>CODE SECRET</Text>
              <Text style={styles.modalText}>Félicitations, vous avez trouvé le Konami code !</Text>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#ffd700' }]} onPress={() => setShowKonamiModal(false)}>
                <Text style={styles.modalBtnText}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <SettingsModal />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a16',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowOffset: { width: 0, height: 0 },
    textShadowOpacity: 0.8,
    textShadowRadius: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  backButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  loreCard: {
    width: '90%',
    backgroundColor: 'rgba(20,20,35,0.8)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  worldText: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  levelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  descText: {
    color: '#a0a0b0',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginTop: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  navBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  raceContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: 'rgba(20,20,35,0.6)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  raceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  raceTrack: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    position: 'relative',
  },
  finishLine: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#fff',
  },
  racerIcon: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    transform: [{ translateX: -6 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  racerLabel: {
    position: 'absolute',
    top: -16,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
  },
  gameArea: {
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: 30,
  },
  boostContainer: {
    width: '90%',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '85%',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  modalText: {
    color: '#d0d0e0',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  modalWaitText: {
    color: '#777',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
