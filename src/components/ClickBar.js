import React from 'react';
import { View } from 'react-native';

const LINE = 2;
const OVERFLOW = 15;

export default function ClickBar({ cursorX, cursorY, zoneW, zoneH }) {
  return (
    <>
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cursorX - 10, width: 20, height: LINE, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', top: -OVERFLOW, left: cursorX, width: LINE, height: zoneH + OVERFLOW * 2, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', bottom: -OVERFLOW, left: cursorX - 10, width: 20, height: LINE, backgroundColor: '#fff' }} />

      <View style={{ position: 'absolute', left: -OVERFLOW, top: cursorY - 10, width: LINE, height: 20, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', left: -OVERFLOW, top: cursorY, width: zoneW + OVERFLOW * 2, height: LINE, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', right: -OVERFLOW, top: cursorY - 10, width: LINE, height: 20, backgroundColor: '#fff' }} />
    </>
  );
}
