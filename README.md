# Etape pour setup le projet

## 1. Cloner le projet

```bash
git clone https://github.com/EnzoBagnis/SadisticAim.git
```

## 2. Modifer les dépendances

Vérifier vos version de expo go dans l'application mobile 
ExpoGo --> Paramètre --> Client Version 

Check la version de expo dans le package.json et package-lock.json et la mettre à jour si besoin
```json
//package-lock.json
"packages": {
    "": {
      "name": "sadisticaim",
      "version": "1.0.0",
      "dependencies": {
        "expo": "{VERSION}",
        "expo-status-bar": "~55.0.4",
        "react": "19.2.0",
        "react-native": "0.83.4"
      }
//package.json
"dependencies": {
  "expo": "{VERSION}",
  "expo-status-bar": "~55.0.4",
  "react": "19.2.0",
  "react-native": "0.83.4"
},

```
## 3. Installer les dépendances

```bash
npm install
```

## 4. Lancer le projet

```bash
npx expo start --tunnel
```
## 5. Ouvrir le projet sur votre téléphone
Pensez a vous mettre sur le même réseau wifi que votre ordinateur pour que le projet puisse se charger sur votre téléphone

- Ouvrir l'application Expo Go sur votre téléphone
- Scanner le QR code affiché dans votre terminal ou dans la page web qui s'ouvre
- Le projet devrait se charger et s'afficher sur votre téléphone
