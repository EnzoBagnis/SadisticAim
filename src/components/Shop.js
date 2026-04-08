import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SHOP_ITEMS, getShopPrice } from "../BaseVar";

export default function Shop({ points = 0, levels = {}, onBuy }) {
  return (
    <View style={{ width: "100%", maxHeight: 280, marginTop: 18 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 10,
        }}
      >
        Shop
      </Text>
      <Text style={{ color: "#9fb1c9", marginBottom: 12 }}>
        Points disponibles : {points}
      </Text>

      <ScrollView
        style={{ backgroundColor: "#0f1723", borderRadius: 10 }}
        contentContainerStyle={{ padding: 12, gap: 10 }}
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
                borderColor: "#263245",
                padding: 12,
                backgroundColor: "#121b2b",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {item.title}
              </Text>
              <Text style={{ color: "#9fb1c9", marginTop: 4 }}>
                {item.description}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#d4e2f5" }}>
                  Niveau: {level}/{item.maxLevel}
                </Text>

                <Pressable
                  disabled={!canBuy}
                  onPress={() => onBuy?.(item.id, price)}
                  style={{
                    backgroundColor: isMaxed
                      ? "#4b5563"
                      : canBuy
                        ? "#16a34a"
                        : "#b91c1c",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {isMaxed ? "MAX" : `Acheter (${price})`}
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
