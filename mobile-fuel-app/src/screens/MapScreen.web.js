import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/AppHeader';

export default function MapScreenWeb() {
  const openGoogleMaps = async () => {
    const url = 'https://www.google.com/maps/search/gas+stations/';
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Stations" subtitle="Nearby gas stations" showBack={false} />
      <View style={styles.card}>
        <Text style={styles.title}>Map preview is not available in web mode yet.</Text>
        <Text style={styles.text}>
          Open the mobile app to see the interactive map with live nearby gas stations, or use Google Maps in your browser.
        </Text>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={openGoogleMaps}>
          <Text style={styles.buttonText}>Open Google Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
    padding: 18,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  text: {
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#e30613',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
