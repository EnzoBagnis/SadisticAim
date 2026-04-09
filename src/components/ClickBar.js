import React from "react";
import { View } from "react-native";
import { LINE, OVERFLOW } from "../BaseVar";
import { useGame } from '../context/GameContext';

export default function ClickBar({ cursorX, cursorY, zoneW, zoneH }) {
  // Use props if provided, otherwise fallback to useGame context (for backward compatibility if needed)
  const game = useGame();
  const cx = cursorX ?? game?.cursorX ?? 0;
  const cy = cursorY ?? game?.cursorY ?? 0;
  const zw = zoneW ?? game?.config?.ZONE_W ?? 300;
  const zh = zoneH ?? game?.config?.ZONE_H ?? 300;

  return (
    <>
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cx - 10, width: 20, height: LINE, backgroundColor: 'rgba(255,255,255,0.7)' }} />
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cx, width: LINE, height: zh + OVERFLOW * 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <View style={{ position: 'absolute', bottom: -OVERFLOW, left: cx - 10, width: 20, height: LINE, backgroundColor: 'rgba(255,255,255,0.7)' }} />

      <View style={{ position: 'absolute', left: -OVERFLOW, top: cy - 10, width: LINE, height: 20, backgroundColor: 'rgba(255,255,255,0.7)' }} />
      <View style={{ position: 'absolute', left: -OVERFLOW, top: cy, width: zw + OVERFLOW * 2, height: LINE, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <View style={{ position: 'absolute', right: -OVERFLOW, top: cy - 10, width: LINE, height: 20, backgroundColor: 'rgba(255,255,255,0.7)' }} />

      <View pointerEvents="none" style={{ position: 'absolute', width: zw, height: zh }}>
        <View style={{
          position: 'absolute',
          top: cy - 1, left: cx - 12,
          width: 24, height: 2,
          backgroundColor: '#00ff66',
          shadowColor: '#00ff66',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 4,
        }} />
        <View style={{
          position: 'absolute',
          top: cy - 12, left: cx - 1,
          width: 2, height: 24,
          backgroundColor: '#00ff66',
          shadowColor: '#00ff66',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 4,
        }} />
      </View>
    </>
  );
}
