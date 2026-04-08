import React from "react";
import { View } from "react-native";
import { LINE, OVERFLOW } from "../BaseVar";
import { useGame } from '../context/GameContext';

export default function ClickBar() {
  const { cursorX, cursorY, config } = useGame();
  const { ZONE_W, ZONE_H } = config;

  return (
    <>
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cursorX - 10, width: 20, height: LINE, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cursorX, width: LINE, height: ZONE_H + OVERFLOW * 2, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', bottom: -OVERFLOW, left: cursorX - 10, width: 20, height: LINE, backgroundColor: '#fff' }} />

      <View style={{ position: 'absolute', left: -OVERFLOW, top: cursorY - 10, width: LINE, height: 20, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', left: -OVERFLOW, top: cursorY, width: ZONE_W + OVERFLOW * 2, height: LINE, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', right: -OVERFLOW, top: cursorY - 10, width: LINE, height: 20, backgroundColor: '#fff' }} />
    </>
  );
}
