import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useGyroscope } from '../hooks/useGyroscope';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../hooks/useSettings';

// --- Constantes de jeu (lecture seule) ---
const { width: SCREEN_W } = Dimensions.get('window');
const ZONE_W = SCREEN_W - 40;
const ZONE_H = ZONE_W / 4;

const GAME_CONFIG = {
  SCREEN_W,
  ZONE_W,
  ZONE_H,
  TARGET_W: 50,
  TARGET_H: ZONE_H,
  SWEET_W: 14,
  SWEET_H: 14,
  TARGET_SPEED: 1.5,
  BOOST_MAX: 100,
  BOOST_HIT: 10,
  BOOST_SWEET: 25,
  BOOST_MISS: -15,
  BOOST_DRAIN: 0.15,
  DIRECTION_CHANGE_MS: 1200,
};

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { settings, loaded, update } = useSettings();
  const gyro = useGyroscope();
  const audio = useAudio(loaded, settings.musicVolume, settings.soundVolume);

  const [boost, setBoost] = useState(0);
  const [won, setWon] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [targetX, setTargetX] = useState(ZONE_W / 2 - GAME_CONFIG.TARGET_W / 2);
  const targetXRef = useRef(ZONE_W / 2 - GAME_CONFIG.TARGET_W / 2);
  const dirRef = useRef(1);

  const cursorX = Math.max(0, Math.min(ZONE_W / 2 + gyro.x, ZONE_W));
  const cursorY = Math.max(0, Math.min(ZONE_H / 2 + gyro.y, ZONE_H));

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => {
      setBoost((b) => Math.max(0, b - GAME_CONFIG.BOOST_DRAIN));
    }, 100);
    return () => clearInterval(id);
  }, [won]);

  useEffect(() => {
    if (won) return;
    let lastDirChange = Date.now();
    let frameId;

    const animate = () => {
      const now = Date.now();
      if (now - lastDirChange > GAME_CONFIG.DIRECTION_CHANGE_MS) {
        dirRef.current = Math.random() > 0.5 ? 1 : -1;
        lastDirChange = now;
      }

      let nx = targetXRef.current + dirRef.current * GAME_CONFIG.TARGET_SPEED;
      if (nx < 0 || nx > ZONE_W - GAME_CONFIG.TARGET_W) dirRef.current *= -1;
      nx = Math.max(0, Math.min(nx, ZONE_W - GAME_CONFIG.TARGET_W));

      targetXRef.current = nx;
      setTargetX(nx);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [won]);

  const handleTap = useCallback(() => {
    if (won || settingsVisible) return;

    const { TARGET_W, SWEET_W, SWEET_H, BOOST_MISS, BOOST_SWEET, BOOST_HIT, BOOST_MAX } = GAME_CONFIG;

    const onTargetX = cursorX >= targetX && cursorX <= targetX + TARGET_W;
    const onTargetY = cursorY >= 0 && cursorY <= ZONE_H;

    if (!onTargetX || !onTargetY) {
      audio.playMiss();
      setBoost((b) => Math.max(0, b + BOOST_MISS));
      return;
    }

    audio.playClick();
    const sweetX = targetX + (TARGET_W - SWEET_W) / 2;
    const sweetY = (ZONE_H - GAME_CONFIG.SWEET_H) / 2;
    const onSweet = cursorX >= sweetX && cursorX <= sweetX + SWEET_W
      && cursorY >= sweetY && cursorY <= sweetY + SWEET_H;

    const gain = onSweet ? BOOST_SWEET : BOOST_HIT;
    const newBoost = Math.min(BOOST_MAX, boost + gain);
    setBoost(newBoost);

    return newBoost >= BOOST_MAX;
  }, [cursorX, cursorY, targetX, boost, won, settingsVisible, audio]);

  const resetGame = useCallback(() => {
    setBoost(0);
    setWon(false);
  }, []);

  const setGameWon = useCallback(() => {
    setWon(true);
  }, []);

  const setMusicVolume = useCallback((val) => {
    update('musicVolume', val);
    audio.setMusicVolume(val);
  }, [audio, update]);

  const setSoundVolume = useCallback((val) => {
    update('soundVolume', val);
    audio.setSoundVolume(val);
  }, [audio, update]);

  const recalibrate = useCallback(() => {
    gyro.recalibrate();
  }, [gyro]);

  const openSettings = useCallback(() => setSettingsVisible(true), []);
  const closeSettings = useCallback(() => setSettingsVisible(false), []);

  const value = {
    config: GAME_CONFIG,
    boost,
    won,
    targetX,
    cursorX,
    cursorY,
    settings,
    settingsVisible,
    handleTap,
    resetGame,
    setGameWon,
    setMusicVolume,
    setSoundVolume,
    recalibrate,
    openSettings,
    closeSettings,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
