import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SHOP_ITEMS, getShopPrice } from "../BaseVar";

export default function Shop({ points = 0, levels = {}, onBuy }) {
  return (
    <View style={{ width: "100%", height: 350, marginTop: 15, paddingHorizontal: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <Text
          style={{
            color: "#00ffff",
            fontSize: 22,
            fontWeight: "900",
            textTransform: 'uppercase',
            letterSpacing: 2,
            textShadowColor: "#00ffff",
            textShadowOffset: { width: 0, height: 0 },
            textShadowOpacity: 0.8,
            textShadowRadius: 8,
          }}
        >
          Terminal QG
        </Text>
        <Text style={{ color: "#d0d0e0", fontSize: 14, fontWeight: 'bold' }}>
          Crédits : <Text style={{ color: '#00ff66' }}>{points}</Text>
        </Text>
      </View>

        <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor: "rgba(20,20,35,0.7)", borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
            contentContainerStyle={{ padding: 15, gap: 15 }}
            showsVerticalScrollIndicator={false}
        >

        {SHOP_ITEMS.map((item) => {
          const level = levels[item.id] ?? 0;
          const isMaxed = level >= item.maxLevel;
          const price = getShopPrice(item, level);
          const canBuy = !isMaxed && points >= price;

          return (
            <View
              key={item.id}
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isMaxed ? "#333" : canBuy ? "#00ffff" : "#444",
                padding: 15,
                backgroundColor: "rgba(0,0,0,0.6)",
                shadowColor: canBuy && !isMaxed ? "#00ffff" : "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                {item.title}
              </Text>
              <Text style={{ color: "#a0a0b0", marginTop: 6, fontStyle: 'italic', fontSize: 13 }}>
                {item.description}
              </Text>

              <View
                style={{
                  marginTop: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#d0d0e0", fontWeight: 'bold' }}>
                  Niveau {level} <Text style={{ color: '#555' }}>/ {item.maxLevel}</Text>
                </Text>

                <Pressable
                  disabled={!canBuy}
                  onPress={() => onBuy?.(item.id, price)}
                  style={{
                    backgroundColor: isMaxed
                      ? "rgba(255,255,255,0.1)"
                      : canBuy
                        ? "rgba(0,255,102,0.2)"
                        : "rgba(255,68,68,0.2)",
                    borderRadius: 8,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: isMaxed ? "#555" : canBuy ? "#00ff66" : "#ff4444",
                  }}
                >
                  <Text style={{
                    color: isMaxed ? "#888" : canBuy ? "#00ff66" : "#ff4444",
                    fontWeight: "900"
                  }}>
                    {isMaxed ? "SYSTÈME MAXIMAL" : `UPGRADE (${price})`}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
