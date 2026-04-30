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
