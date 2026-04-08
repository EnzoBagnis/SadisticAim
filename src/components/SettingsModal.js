import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
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
              <Text style={styles.label}>Musique</Text>
              <Text style={styles.value}>{Math.round(settings.musicVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.musicVolume}
              onValueChange={setMusicVolume}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#555"
              thumbTintColor="#fff"
            />
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Sons</Text>
              <Text style={styles.value}>{Math.round(settings.soundVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.soundVolume}
              onValueChange={setSoundVolume}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#555"
              thumbTintColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.calibrateBtn} onPress={recalibrate}>
            <Text style={styles.calibrateTxt}>Recalibrer le gyroscope</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={closeSettings}>
            <Text style={styles.closeTxt}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  value: {
    color: '#aaa',
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  calibrateBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  calibrateTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeTxt: {
    color: '#fff',
    fontSize: 14,
  },
};
