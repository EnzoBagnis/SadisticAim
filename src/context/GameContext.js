import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useGyroscope } from '../hooks/useGyroscope';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../hooks/useSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STARTING_POINTS } from '../BaseVar';

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
  BOOST_HIT: 100,
  BOOST_SWEET: 250,
  BOOST_MISS: -15,
  BOOST_DRAIN: 0.15,
  DIRECTION_CHANGE_MS: 1200,
};

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { settings, loaded, update } = useSettings();
  const gyro = useGyroscope();
  const audio = useAudio(loaded, settings.musicVolume, settings.soundVolume);

  const [currentConfig, setCurrentConfig] = useState(GAME_CONFIG);
  const [boost, setBoost] = useState(0);
  const [won, setWon] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [targetX, setTargetX] = useState(ZONE_W / 2 - currentConfig.TARGET_W / 2);
  const targetXRef = useRef(ZONE_W / 2 - currentConfig.TARGET_W / 2);
  const dirRef = useRef(1);

  const [points, setPoints] = useState(STARTING_POINTS);
  const [shopLevels, setShopLevels] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPoints = await AsyncStorage.getItem('@shop_points');
        const savedLevels = await AsyncStorage.getItem('@shop_levels');
        if (savedPoints !== null) setPoints(parseFloat(savedPoints));
        if (savedLevels !== null) setShopLevels(JSON.parse(savedLevels));
      } catch (e) {
        console.error('Failed to load shop data', e);
      }
    };
    loadData();
  }, []);

  const updatePoints = useCallback(async (newPoints) => {
    setPoints(newPoints);
    try {
      await AsyncStorage.setItem('@shop_points', newPoints.toString());
    } catch (e) {}
  }, []);

  const updateShopLevels = useCallback(async (newLevels) => {
    setShopLevels(newLevels);
    try {
      await AsyncStorage.setItem('@shop_levels', JSON.stringify(newLevels));
    } catch (e) {}
  }, []);

  const cursorX = Math.max(0, Math.min(ZONE_W / 2 + gyro.x, ZONE_W));
  const cursorY = Math.max(0, Math.min(ZONE_H / 2 + gyro.y, ZONE_H));

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => {
      setBoost((b) => Math.max(0, b - currentConfig.BOOST_DRAIN));
    }, 100);
    return () => clearInterval(id);
  }, [won, currentConfig.BOOST_DRAIN]);

  useEffect(() => {
    if (won) return;
    let lastDirChange = Date.now();
    let frameId;

    const animate = () => {
      const now = Date.now();
      if (now - lastDirChange > currentConfig.DIRECTION_CHANGE_MS) {
        dirRef.current = Math.random() > 0.5 ? 1 : -1;
        lastDirChange = now;
      }

      let nx = targetXRef.current + dirRef.current * currentConfig.TARGET_SPEED;
      if (nx < 0 || nx > ZONE_W - currentConfig.TARGET_W) dirRef.current *= -1;
      nx = Math.max(0, Math.min(nx, ZONE_W - currentConfig.TARGET_W));

      targetXRef.current = nx;
      setTargetX(nx);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [won, currentConfig.DIRECTION_CHANGE_MS, currentConfig.TARGET_SPEED, currentConfig.TARGET_W]);

  const handleTap = useCallback(() => {
    if (won || settingsVisible) return;

    const { TARGET_W, TARGET_H, SWEET_W, SWEET_H, BOOST_MISS, BOOST_SWEET, BOOST_HIT, BOOST_MAX, ZONE_H } = currentConfig;

    const onTargetX = cursorX >= targetX && cursorX <= targetX + TARGET_W;
    const targetMinY = (ZONE_H - TARGET_H) / 2;
    const targetMaxY = targetMinY + TARGET_H;
    const onTargetY = cursorY >= targetMinY && cursorY <= targetMaxY;

    if (!onTargetX || !onTargetY) {
      if (audio.playMiss) audio.playMiss();
      setBoost((b) => Math.max(0, b + BOOST_MISS));
      return;
    }

    if (audio.playClick) audio.playClick();
    const sweetMinY = (TARGET_H - SWEET_H) / 2 + targetMinY;
    const sweetX = targetX + (TARGET_W - SWEET_W) / 2;

    const onSweet = cursorX >= sweetX && cursorX <= sweetX + SWEET_W
      && cursorY >= sweetMinY && cursorY <= sweetMinY + SWEET_H;

    const gain = onSweet ? BOOST_SWEET : BOOST_HIT;
    const newBoost = Math.min(BOOST_MAX, boost + gain);
    setBoost(newBoost);

    return newBoost >= BOOST_MAX;
  }, [cursorX, cursorY, targetX, boost, won, settingsVisible, audio, currentConfig]);

  const resetGame = useCallback(() => {
    setBoost(0);
    setWon(false);
  }, []);

  const updateConfig = useCallback((newValues) => {
    setCurrentConfig(prev => ({ ...prev, ...newValues }));
  }, []);

  const setGameWon = useCallback(() => {
    setWon(true);
    if (audio.playVictoryMusic) {
      audio.playVictoryMusic();
    }
  }, [audio]);

  const setMusicVolume = useCallback((val) => {
    update('musicVolume', val);
    audio.setMusicVolume(val);
  }, [audio, update]);

  const setSoundVolume = useCallback((val) => {
    update('soundVolume', val);
    audio.setSoundVolume(val);
  }, [audio, update]);

  const gyroRecalibrateRef = useRef(gyro.recalibrate);
  gyroRecalibrateRef.current = gyro.recalibrate;

  const recalibrate = useCallback(() => {
    gyroRecalibrateRef.current();
  }, []);

  const openSettings = useCallback(() => setSettingsVisible(true), []);
  const closeSettings = useCallback(() => setSettingsVisible(false), []);

  const value = {
    config: currentConfig,
    boost,
    won,
    targetX,
    cursorX,
    cursorY,
    settings,
    settingsVisible,
    points,
    updatePoints,
    shopLevels,
    updateShopLevels,
    handleTap,
    resetGame,
    setGameWon,
    setMusicVolume,
    setSoundVolume,
    recalibrate,
    openSettings,
    closeSettings,
    updateConfig,
    playGlobalMusic: audio.playGlobalMusic, // Expose to screens
    playVictoryMusic: audio.playVictoryMusic,
    playLoseMusic: audio.playLoseMusic,
    stopLoseMusic: audio.stopLoseMusic,
    playClick: audio.playClick,
    playMiss: audio.playMiss,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
