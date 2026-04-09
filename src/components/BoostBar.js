import React from "react";
import { View, Text } from "react-native";
import { getBoostPercentage } from "../BaseVar";
import { useGame } from '../context/GameContext';

export default function BoostBar({ value, max }) {
  const { boost, config } = useGame();
  const percentage = getBoostPercentage(value, max);
  const isDanger = percentage < 20;

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8, paddingHorizontal: 4 }}>
        <Text style={{ color: isDanger ? "#ff4444" : "#00ffff", fontWeight: '900', letterSpacing: 1 }}>
          BOOST SYSTEM
        </Text>
        <Text style={{ color: isDanger ? "#ff4444" : "#00ffff", fontWeight: 'bold' }}>
          {Math.round(percentage)}%
        </Text>
      </View>
      <View
        style={{
          width: '100%',
          height: 24,
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDanger ? "#ff4444" : "#333",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: percentage >= 100 ? "#fff" : isDanger ? "#ff4444" : "#00ffff",
            shadowColor: percentage >= 100 ? "#fff" : isDanger ? "#ff4444" : "#00ffff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
          }}
        />
      </View>
    </View>
  );
}
