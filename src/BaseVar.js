import { Dimensions } from "react-native";

// ClickBar constants
export const LINE = 2;
export const OVERFLOW = 15;

// BoostBar constants
export const getBoostPercentage = (value, max) => {
  if (max <= 0) return 0;
  return Math.min(100, (value / max) * 100);
};

// useGyroscope constants
export const SENSITIVITY = 150;

// App constants
export const SCREEN_W = Dimensions.get("window").width;
export const ZONE_W = SCREEN_W - 40;
export const ZONE_H = ZONE_W / 4;
export const TARGET_W = 50;
export const TARGET_H = ZONE_H;
export const SWEET_W = 14;
export const SWEET_H = 14;
export const TARGET_SPEED = 1.5;
export const BOOST_MAX = 100;
export const BOOST_HIT = 10;
export const BOOST_SWEET = 25;
export const BOOST_MISS = -15;
export const BOOST_DRAIN = 0.15;
export const DIRECTION_CHANGE_MS = 1200;

// Shop constants
export const SHOP_ITEMS = [
  {
    id: "plusPoints",
    title: "+ Points",
    description: "Augmente les points gagnes sur les hits.",
    maxLevel: 10,
    basePrice: 120,
    priceFactor: 1.35,
  },
  {
    id: "slowTarget",
    title: "Cible Plus Lente",
    description: "Reduit la vitesse de la cible.",
    maxLevel: 8,
    basePrice: 160,
    priceFactor: 1.4,
  },
  {
    id: "lessLoss",
    title: "Moins De Perte",
    description: "Diminue la perte de points en cas d'echec.",
    maxLevel: 8,
    basePrice: 150,
    priceFactor: 1.35,
  },
  {
    id: "betterBonus",
    title: "Meilleur Bonus",
    description: "Augmente le bonus sur la zone parfaite.",
    maxLevel: 8,
    basePrice: 200,
    priceFactor: 1.45,
  },
  {
    id: "sweetZoneSize",
    title: "Zone Parfaite Plus Grande",
    description: "Agrandit la zone de point parfait.",
    maxLevel: 10,
    basePrice: 180,
    priceFactor: 1.38,
  },
];

export const getShopPrice = (item, level) => {
  const safeLevel = Math.max(0, level);
  return Math.round(item.basePrice * Math.pow(item.priceFactor, safeLevel));
};
