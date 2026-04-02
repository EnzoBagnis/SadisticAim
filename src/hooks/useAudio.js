import { useRef, useCallback, useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const musicSource = require('../../assets/sounds/music.mp3');
const clickSource = require('../../assets/sounds/click.mp3');
const missSource = require('../../assets/sounds/miss.mp3');

export function useAudio(settingsLoaded, initialMusicVolume, initialSoundVolume) {
  const soundVolumeRef = useRef(initialSoundVolume);
  const musicStartedRef = useRef(false);

  const musicPlayer = useAudioPlayer(musicSource);
  const clickPlayer = useAudioPlayer(clickSource);
  const missPlayer = useAudioPlayer(missSource);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  useEffect(() => {
    if (!settingsLoaded || musicStartedRef.current) return;
    soundVolumeRef.current = initialSoundVolume;

    musicPlayer.loop = true;
    musicPlayer.volume = initialMusicVolume;
    clickPlayer.volume = initialSoundVolume;
    missPlayer.volume = initialSoundVolume;

    if (initialMusicVolume > 0) {
      musicPlayer.play();
    }
    musicStartedRef.current = true;
  }, [settingsLoaded, initialMusicVolume, initialSoundVolume, musicPlayer, clickPlayer, missPlayer]);

  const playClick = useCallback(() => {
    if (soundVolumeRef.current <= 0) return;
    clickPlayer.seekTo(0);
    clickPlayer.play();
  }, [clickPlayer]);

  const playMiss = useCallback(() => {
    if (soundVolumeRef.current <= 0) return;
    missPlayer.seekTo(0);
    missPlayer.play();
  }, [missPlayer]);

  const setMusicVolume = useCallback((volume) => {
    musicPlayer.volume = volume;
    if (volume > 0 && !musicPlayer.playing) {
      musicPlayer.play();
    } else if (volume <= 0) {
      musicPlayer.pause();
    }
  }, [musicPlayer]);

  const setSoundVolume = useCallback((volume) => {
    soundVolumeRef.current = volume;
    clickPlayer.volume = volume;
    missPlayer.volume = volume;
  }, [clickPlayer, missPlayer]);

  return { playClick, playMiss, setMusicVolume, setSoundVolume };
}
