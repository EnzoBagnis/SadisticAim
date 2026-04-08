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
export const BOOST_HIT = 1;
export const BOOST_SWEET = 3;
export const BOOST_MISS = -1;
export const BOOST_DRAIN = 0.15;
export const DIRECTION_CHANGE_MS = 1200;
export const STARTING_POINTS = 5;

// Shop constants
export const SHOP_ITEMS = [
  {
    id: "plusPoints",
    title: "+ Points",
    description: "Augmente les points gagnes sur les hits.",
    maxLevel: 50,
    basePrice: 10,
    priceFactor: 1.9,
  },
  {
    id: "slowTarget",
    title: "Cible Plus Lente",
    description: "Reduit la vitesse de la cible.",
    maxLevel: 30,
    basePrice: 10,
    priceFactor: 1.35,
  },
  {
    id: "lessLoss",
    title: "Moins De Perte",
    description: "Diminue la perte de points en cas d'echec.",
    maxLevel: 25,
    basePrice: 8,
    priceFactor: 2,
  },
  {
    id: "betterBonus",
    title: "Meilleur Bonus",
    description: "Augmente le bonus sur la zone parfaite.",
    maxLevel: 40,
    basePrice: 12,
    priceFactor: 1.24
  },
  {
    id: "sweetZoneSize",
    title: "Zone Parfaite Plus Grande",
    description: "Agrandit la zone de point parfait.",
    maxLevel: 50,
    basePrice: 8,
    priceFactor: 1.9,
  },
  {
    id: "passivePoints",
    title: "Gain Passif",
    description: "Gagne 1 point par seconde au niveau 1.",
    maxLevel: 50,
    basePrice: 30,
    priceFactor: 2.15,
  },
  {
    id: "biggerZone",
    title: "Zone de Base Plus Grande",
    description: "Agrandit la zone de hit globale.",
    maxLevel: 30,
    basePrice: 20,
    priceFactor: 1.3,
  },
  {
    id: "smallerTargetZone",
    title: "Réduction Zone Cible",
    description: "Reduit la zone de déplacement de la cible.",
    maxLevel: 35,
    basePrice: 25,
    priceFactor: 1.25,
  },
];

export const getShopPrice = (item, level) => {
  const safeLevel = Math.max(0, level);
  return Math.round(item.basePrice * Math.pow(item.priceFactor, safeLevel));
};

// Upgrade impact calculations
export const getPointsPerHit = (basePoints, plusPointsLevel) => {
  // +100% par niveau
  return Math.round(basePoints * Math.pow(2, plusPointsLevel));
};

export const getPointsSweetBonus = (basePoints, betterBonusLevel) => {
  // +10% par niveau
  return Math.round(basePoints * Math.pow(1.1, betterBonusLevel));
};

export const getTargetSpeed = (baseSpeed, slowTargetLevel) => {
  // -10% vitesse par niveau (plus lent)
  return baseSpeed * Math.pow(0.9, slowTargetLevel);
};

export const getBoostMissLoss = (baseLoss, lessLossLevel) => {
  // Réduit la perte de 5% par niveau (moins négatif)
  return baseLoss * Math.pow(0.95, lessLossLevel);
};

export const getSweetZoneSize = (baseSize, sweetZoneLevelSize) => {
  // +8% par niveau
  return baseSize * Math.pow(1.08, sweetZoneLevelSize);
};

export const getPassivePoints = (passivePointsLevel) => {
  // 1 point par seconde au niveau 1, +5% par niveau
  return passivePointsLevel * Math.pow(1.05, passivePointsLevel - 1);
};

export const getZoneWidth = (baseWidth, biggerZoneLevel) => {
  // +5% par niveau
  return baseWidth * Math.pow(1.05, biggerZoneLevel);
};

export const getZoneHeight = (baseHeight, biggerZoneLevel) => {
  // +5% par niveau
  return baseHeight * Math.pow(1.05, biggerZoneLevel);
};

export const getTargetMovementZone = (baseZone, smallerTargetZoneLevel) => {
  // -4% par niveau (réduit la zone de déplacement)
  return baseZone * Math.pow(0.96, smallerTargetZoneLevel);
};

