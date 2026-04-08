import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@sadisticaim_settings';

const DEFAULTS = {
  musicVolume: 0.5,
  soundVolume: 1.0,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const update = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, loaded, update };
}
