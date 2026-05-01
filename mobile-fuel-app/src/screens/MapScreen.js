import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import AppHeader from '../components/AppHeader';

const resolvePlacesProxyUrl = () => {
  const explicitUrl =
    (Constants?.expoConfig?.extra && Constants.expoConfig.extra.PLACES_PROXY_URL) ||
    (Constants?.manifest?.extra && Constants.manifest.extra.PLACES_PROXY_URL) ||
    process.env.EXPO_PUBLIC_PLACES_PROXY_URL ||
    '';

  if (explicitUrl && explicitUrl !== 'http://localhost:4000') {
    return explicitUrl;
  }

  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost || '';
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    if (host) {
      return `http://${host}:4000`;
    }
  }

  return explicitUrl || 'http://localhost:4000';
};

const PLACES_PROXY_URL = resolvePlacesProxyUrl();

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [stations, setStations] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLocation(null);
        setStations([]);
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      const loc = lastKnown || (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }));
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      await fetchStations(coords.latitude, coords.longitude);
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Unable to get location or stations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const fetchStations = async (lat, lng) => {
    try {
      const url = `${PLACES_PROXY_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=5000`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.results) {
        setStations(data.results);
      } else {
        console.warn('Places proxy response', data);
      }
    } catch (err) {
      console.warn(err);
      setStations([]);
    }
  };

  const fitMapToPoints = () => {
    if (!mapReady || !mapRef.current || !location) {
      return;
    }

    const points = [
      { latitude: location.latitude, longitude: location.longitude },
      ...stations
        .map((station) => ({
          latitude: station?.geometry?.location?.lat,
          longitude: station?.geometry?.location?.lng,
        }))
        .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)),
    ];

    if (points.length > 1) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    fitMapToPoints();
  }, [mapReady, location, stations]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <AppHeader title="Stations" subtitle="Nearby gas stations" showBack={false} />
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Location access is turned off</Text>
          <Text style={styles.permissionText}>
            Turn on location access to show nearby gas stations on the interactive map.
          </Text>

          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={requestLocation}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.secondaryButtonText}>Open app settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Stations" subtitle="Nearby gas stations" showBack={false} />
      {location ? (
        stations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No nearby gas stations loaded</Text>
            <Text style={styles.emptyText}>
              Check that the proxy server is running on your computer and that your phone can reach it on the same Wi-Fi network.
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            onMapReady={() => setMapReady(true)}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
          >
            {stations.map((s) => (
              <Marker
                key={s.place_id}
                coordinate={{ latitude: s.geometry.location.lat, longitude: s.geometry.location.lng }}
                title={s.name}
                description={s.vicinity}
              />
            ))}
          </MapView>
        )
      ) : (
        <View style={styles.center}>
          <Text style={styles.info}>Location not available.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { color: '#6b7280' },
  permissionCard: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#fee2e2',
    justifyContent: 'center',
  },
  permissionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  permissionText: {
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyCard: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fee2e2',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#e30613',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
