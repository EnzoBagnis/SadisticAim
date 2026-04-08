import React from "react";
import { View, Text } from "react-native";
import { getBoostPercentage } from "../BaseVar";
import { useGame } from '../context/GameContext';

export default function BoostBar({ value, max }) {
  const { boost, config } = useGame();
  const percentage = getBoostPercentage(value, max);

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
      <Text style={{ color: "#fff", marginBottom: 5 }}>
        Boost : {Math.round(percentage)}%
      </Text>
      <View
        style={{
          height: 20,
          backgroundColor: "#333",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: percentage >= 100 ? "#FFD700" : "#4CAF50",
          }}
        />
      </View>
    </View>
  );
}
