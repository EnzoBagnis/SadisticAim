import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useGame } from '../context/GameContext';

export default function SettingsModal() {
  const {
    settings,
    settingsVisible,
    setMusicVolume,
    setSoundVolume,
    recalibrate,
    closeSettings,
  } = useGame();

  return (
    <Modal visible={settingsVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Paramètres</Text>

          <View style={styles.sliderGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>CANAL AUDIO : Musique</Text>
              <Text style={styles.value}>{Math.round(settings.musicVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.musicVolume}
              onValueChange={setMusicVolume}
              minimumTrackTintColor="#00ffff"
              maximumTrackTintColor="#333"
              thumbTintColor="#fff"
            />
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>CANAL AUDIO : SFX</Text>
              <Text style={styles.value}>{Math.round(settings.soundVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.soundVolume}
              onValueChange={setSoundVolume}
              minimumTrackTintColor="#00ffff"
              maximumTrackTintColor="#333"
              thumbTintColor="#fff"
            />
          </View>

          <Pressable style={({ pressed }) => [styles.calibrateBtn, pressed && { opacity: 0.7 }]} onPress={recalibrate}>
            <Text style={styles.calibrateTxt}>RECALIBRER CAPTEURS</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]} onPress={closeSettings}>
            <Text style={styles.closeTxt}>FERMER</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 25,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowOpacity: 0.8,
    textShadowRadius: 8,
  },
  sliderGroup: {
    marginBottom: 25,
    backgroundColor: 'rgba(0,255,255,0.05)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '900',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  calibrateBtn: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  calibrateTxt: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeTxt: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
