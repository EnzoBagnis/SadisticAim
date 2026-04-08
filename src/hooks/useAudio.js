import { useRef, useCallback, useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const musicSource = require('../../assets/sounds/music.mp3');
const clickSource = require('../../assets/sounds/click.mp3');
const missSource = require('../../assets/sounds/miss.mp3');
const campaignMusicSource = require('../../assets/sounds/campaign_music.mp3');
const bossMusicSource = require('../../assets/sounds/boss_music.mp3');
const victoryMusicSource = require('../../assets/sounds/victory_music.mp3');

export function useAudio(settingsLoaded, initialMusicVolume, initialSoundVolume) {
  const soundVolumeRef = useRef(initialSoundVolume);
  const musicVolumeRef = useRef(initialMusicVolume);
  const musicStartedRef = useRef(false);
  const [soundsReady, setSoundsReady] = useState(false);

  const musicPlayerRef = useRef(null);
  const clickPlayerRef = useRef(null);
  const missPlayerRef = useRef(null);
  const campaignMusicPlayerRef = useRef(null);
  const bossMusicPlayerRef = useRef(null);
  const victoryMusicPlayerRef = useRef(null);

  const currentPlayingMusic = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    async function loadSounds() {
      // Create sounds without autoplaying them immediately to manage them strictly
      const { sound: musicSound } = await Audio.Sound.createAsync(musicSource, { isLooping: true, volume: initialMusicVolume });
      const { sound: clickSound } = await Audio.Sound.createAsync(clickSource, { volume: initialSoundVolume });
      const { sound: missSound } = await Audio.Sound.createAsync(missSource, { volume: initialSoundVolume });
      const { sound: campaignSound } = await Audio.Sound.createAsync(campaignMusicSource, { isLooping: true, volume: initialMusicVolume });
      const { sound: bossSound } = await Audio.Sound.createAsync(bossMusicSource, { isLooping: true, volume: initialMusicVolume });
      const { sound: victorySound } = await Audio.Sound.createAsync(victoryMusicSource, { volume: initialMusicVolume });

      musicPlayerRef.current = musicSound;
      clickPlayerRef.current = clickSound;
      missPlayerRef.current = missSound;
      campaignMusicPlayerRef.current = campaignSound;
      bossMusicPlayerRef.current = bossSound;
      victoryMusicPlayerRef.current = victorySound;

      setSoundsReady(true);
    }

    loadSounds();

    return () => {
      if (musicPlayerRef.current) musicPlayerRef.current.unloadAsync();
      if (clickPlayerRef.current) clickPlayerRef.current.unloadAsync();
      if (missPlayerRef.current) missPlayerRef.current.unloadAsync();
      if (campaignMusicPlayerRef.current) campaignMusicPlayerRef.current.unloadAsync();
      if (bossMusicPlayerRef.current) bossMusicPlayerRef.current.unloadAsync();
      if (victoryMusicPlayerRef.current) victoryMusicPlayerRef.current.unloadAsync();
    };
  }, []); // Keep empty array so it only loads once

  useEffect(() => {
    soundVolumeRef.current = initialSoundVolume;
    musicVolumeRef.current = initialMusicVolume;

    const updateVolumes = async () => {
        if (musicPlayerRef.current) await musicPlayerRef.current.setVolumeAsync(initialMusicVolume);
        if (campaignMusicPlayerRef.current) await campaignMusicPlayerRef.current.setVolumeAsync(initialMusicVolume);
        if (bossMusicPlayerRef.current) await bossMusicPlayerRef.current.setVolumeAsync(initialMusicVolume);
        if (victoryMusicPlayerRef.current) await victoryMusicPlayerRef.current.setVolumeAsync(initialMusicVolume);

        if (clickPlayerRef.current) await clickPlayerRef.current.setVolumeAsync(initialSoundVolume);
        if (missPlayerRef.current) await missPlayerRef.current.setVolumeAsync(initialSoundVolume);
    };
    updateVolumes();
  }, [initialMusicVolume, initialSoundVolume]);

  const stopCurrentMusic = async () => {
      if (currentPlayingMusic.current) {
          const status = await currentPlayingMusic.current.getStatusAsync();
          if (status.isLoaded) {
             await currentPlayingMusic.current.stopAsync();
          }
      }
  };

  const playGlobalMusic = useCallback(async (type) => {
    if (musicVolumeRef.current <= 0) return;

    let targetSound = null;
    if (type === 'main') targetSound = musicPlayerRef.current;
    if (type === 'campaign') targetSound = campaignMusicPlayerRef.current;
    if (type === 'boss') targetSound = bossMusicPlayerRef.current;

    if (!targetSound) return;

    if (currentPlayingMusic.current !== targetSound) {
        await stopCurrentMusic();
        currentPlayingMusic.current = targetSound;
        await targetSound.playAsync();
    } else {
        const status = await targetSound.getStatusAsync();
        if (!status.isPlaying) {
            await targetSound.playAsync();
        }
    }
  }, []);

  useEffect(() => {
    if (settingsLoaded && soundsReady && !musicStartedRef.current && initialMusicVolume > 0) {
        playGlobalMusic('main');
        musicStartedRef.current = true;
    }
  }, [settingsLoaded, soundsReady, initialMusicVolume, playGlobalMusic]);

  const playVictoryMusic = useCallback(async () => {
    if (musicVolumeRef.current <= 0 || !victoryMusicPlayerRef.current) return;

    const previousMusic = currentPlayingMusic.current;

    await stopCurrentMusic();
    currentPlayingMusic.current = victoryMusicPlayerRef.current;
    await victoryMusicPlayerRef.current.setPositionAsync(0);
    await victoryMusicPlayerRef.current.playAsync();

    // Stop victory music after 9 seconds
    setTimeout(async () => {
        const status = await victoryMusicPlayerRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
             await victoryMusicPlayerRef.current.stopAsync();

             if (previousMusic && musicVolumeRef.current > 0) {
                 currentPlayingMusic.current = previousMusic;
                 await previousMusic.playAsync();
             }
        }
    }, 9000);

  }, []);

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
      if (currentPlayingMusic.current) {
          const status = await currentPlayingMusic.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
              await currentPlayingMusic.current.playAsync();
          }
      } else {
          // Fallback to main music if none is set as current
          await playGlobalMusic('main');
      }
    } else if (volume <= 0) {
      if (currentPlayingMusic.current) {
          const status = await currentPlayingMusic.current.getStatusAsync();
          if (status.isLoaded) {
              await currentPlayingMusic.current.pauseAsync();
          }
      }
    }
  }, []);

  const setSoundVolume = useCallback(async (volume) => {
    soundVolumeRef.current = volume;
    if (clickPlayerRef.current) await clickPlayerRef.current.setVolumeAsync(volume);
    if (missPlayerRef.current) await missPlayerRef.current.setVolumeAsync(volume);
  }, []);

  return {
      playClick,
      playMiss,
      setMusicVolume,
      setSoundVolume,
      playGlobalMusic,
      playVictoryMusic
  };
}
