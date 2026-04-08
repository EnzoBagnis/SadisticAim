import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

const musicSource = require('../../assets/sounds/music.mp3');
const clickSource = require('../../assets/sounds/click.mp3');
const missSource = require('../../assets/sounds/miss.mp3');

export function useAudio(settingsLoaded, initialMusicVolume, initialSoundVolume) {
  const soundVolumeRef = useRef(initialSoundVolume);
  const musicStartedRef = useRef(false);

  const musicPlayerRef = useRef(null);
  const clickPlayerRef = useRef(null);
  const missPlayerRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    async function loadSounds() {
      const { sound: musicSound } = await Audio.Sound.createAsync(musicSource, { isLooping: true, volume: initialMusicVolume });
      const { sound: clickSound } = await Audio.Sound.createAsync(clickSource, { volume: initialSoundVolume });
      const { sound: missSound } = await Audio.Sound.createAsync(missSource, { volume: initialSoundVolume });

      musicPlayerRef.current = musicSound;
      clickPlayerRef.current = clickSound;
      missPlayerRef.current = missSound;

      if (!settingsLoaded || musicStartedRef.current) return;

      if (initialMusicVolume > 0) {
        await musicSound.playAsync();
      }
      musicStartedRef.current = true;
    }

    loadSounds();

    return () => {
      if (musicPlayerRef.current) musicPlayerRef.current.unloadAsync();
      if (clickPlayerRef.current) clickPlayerRef.current.unloadAsync();
      if (missPlayerRef.current) missPlayerRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    soundVolumeRef.current = initialSoundVolume;
    if (musicPlayerRef.current) {
      musicPlayerRef.current.setVolumeAsync(initialMusicVolume);
    }
    if (clickPlayerRef.current) {
      clickPlayerRef.current.setVolumeAsync(initialSoundVolume);
    }
    if (missPlayerRef.current) {
      missPlayerRef.current.setVolumeAsync(initialSoundVolume);
    }
  }, [initialMusicVolume, initialSoundVolume]);


  const playClick = useCallback(async () => {
    if (soundVolumeRef.current <= 0 || !clickPlayerRef.current) return;
    await clickPlayerRef.current.setPositionAsync(0);
    await clickPlayerRef.current.playAsync();
  }, []);

  const playMiss = useCallback(async () => {
    if (soundVolumeRef.current <= 0 || !missPlayerRef.current) return;
    await missPlayerRef.current.setPositionAsync(0);
    await missPlayerRef.current.playAsync();
  }, []);

  const setMusicVolume = useCallback(async (volume) => {
    if (!musicPlayerRef.current) return;
    await musicPlayerRef.current.setVolumeAsync(volume);
    if (volume > 0) {
      const status = await musicPlayerRef.current.getStatusAsync();
      if (!status.isPlaying) {
        await musicPlayerRef.current.playAsync();
      }
    } else if (volume <= 0) {
      await musicPlayerRef.current.pauseAsync();
    }
  }, []);

  const setSoundVolume = useCallback(async (volume) => {
    soundVolumeRef.current = volume;
    if (clickPlayerRef.current) await clickPlayerRef.current.setVolumeAsync(volume);
    if (missPlayerRef.current) await missPlayerRef.current.setVolumeAsync(volume);
  }, []);

  return { playClick, playMiss, setMusicVolume, setSoundVolume };
}
