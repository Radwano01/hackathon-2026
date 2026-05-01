require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Allow this app to access your location to show nearby gas stations on the map.',
        },
      ],
    ],
    extra: {
      PLACES_PROXY_URL: process.env.EXPO_PUBLIC_PLACES_PROXY_URL || 'http://localhost:4000',
    },
  };
};
