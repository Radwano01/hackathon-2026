# Mobile Fuel App

A React Native + Expo mobile app for managing fuel sessions, wallet balance, vehicles, transactions, and profile settings.

## Stack

- Expo / React Native
- React Navigation
- Redux Toolkit
- AsyncStorage
- Axios

## Features

- Login and registration
- Demo account fallback when backend is unavailable
- Home dashboard with balance, recent transactions, and quick access
- Transactions with search and sorting
- Wallet/cards view
- Vehicle management
- Fuel sessions flow
- Profile editing from the top-right avatar menu
- Settings accessible from the profile slide menu

## Demo Account

When the backend URL is not configured, the app uses demo mode automatically.

Demo credentials:

- Phone: `+971500000001`
- Password: `123456`

## Environment Variables

Optional backend configuration:

- `EXPO_PUBLIC_API_BASE_URL` - your backend base URL
- `EXPO_PUBLIC_DEMO_MODE=true` - force demo mode

Example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
EXPO_PUBLIC_DEMO_MODE=true
```

## Maps (Nearby Stations)

This app includes a `Map` tab that shows nearby gas stations using Google Maps / Places.

- Install native deps (run in `mobile-fuel-app`):

```bash
npm install react-native-maps expo-location
# If using expo-managed workflow run: npx expo install react-native-maps expo-location
```

- Set your Google Maps API key in `.env` (see `.env.example`) as `GOOGLE_MAPS_API_KEY`. Do NOT commit your key.
 - Set your Google Maps API key in the proxy server (see `server/README.md`) as `GOOGLE_MAPS_API_KEY`.
 - If running the local proxy, set `EXPO_PUBLIC_PLACES_PROXY_URL=http://localhost:4000` in your `.env` (see `.env.example`).
 - `app.config.js` exposes `EXPO_PUBLIC_PLACES_PROXY_URL` into Expo runtime under `extra.PLACES_PROXY_URL`. You can copy `.env.example` to `.env` and set `EXPO_PUBLIC_PLACES_PROXY_URL` there.


## Install

From the `mobile-fuel-app` folder:

```bash
npm install
```

## Run

Start the Expo app:

```bash
npm start
```

Platform-specific shortcuts:

```bash
npm run android
npm run ios
npm run web
```

To clear the Expo cache:

```bash
npx expo start -c
```

## Project Structure

- `App.js` - app bootstrap, navigation, and auth hydration
- `src/screens/` - feature screens
- `src/components/` - reusable UI components
- `src/services/api.js` - backend service layer and demo fallback
- `src/redux/` - Redux slices and store

## Notes

- The app is currently optimized for the existing demo/offline workflow and can switch to a real backend when `EXPO_PUBLIC_API_BASE_URL` is set.
- Settings is intentionally hidden from the bottom tabs and is available from the profile slide menu.
