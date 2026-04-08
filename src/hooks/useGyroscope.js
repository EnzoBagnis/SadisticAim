import { useState, useEffect, useRef } from "react";
import { Gyroscope } from "expo-sensors";
import { SENSITIVITY } from "../BaseVar";

export function useGyroscope() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef({ x: 0, y: 0 });

  const recalibrate = useCallback(() => {
    ref.current = { x: 0, y: 0 };
    setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);

    const subscription = Gyroscope.addListener(({ x, y }) => {
      ref.current = {
        x: ref.current.x + y * SENSITIVITY * 0.016,
        y: ref.current.y + x * SENSITIVITY * 0.016,
      };
      setPos({ ...ref.current });
    });

    return () => subscription.remove();
  }, []);

  return { ...pos, recalibrate };
}
