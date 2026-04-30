import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AppHeader from '../components/AppHeader';
import {
  cancelFuelSessionRequest,
  getStationsRequest,
  getUserFuelSessionsRequest,
  startFuelSessionRequest,
  stopFuelSessionRequest,
} from '../services/api';
import { setSessions } from '../redux/financeSlice';

const parseStations = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.stations)) {
    return data.stations;
  }

  return [];
};

const parseSessions = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.sessions)) {
    return data.sessions;
  }

  return [];
};

const getSessionLabel = (session) => session?.sessionId || session?.id || 'Session';

export default function FuelSessionsScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const sessions = useSelector((state) => state.finance.sessions);
  const [stations, setStations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [actioningId, setActioningId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [stationId, setStationId] = useState('');
  const [fuelType, setFuelType] = useState('premium');
  const [userId, setUserId] = useState(user?.id || user?.userId || '');

  const activeSessions = useMemo(
    () => sessions.filter((session) => String(session?.status || '').toLowerCase() === 'started'),
    [sessions]
  );

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [stationData, sessionData] = await Promise.all([
        getStationsRequest(),
        userId ? getUserFuelSessionsRequest(userId) : Promise.resolve({ sessions: [] }),
      ]);

      setStations(parseStations(stationData));
      dispatch(setSessions(parseSessions(sessionData)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load fuel sessions.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, userId]);

  useFocusEffect(
    useCallback(() => {
      setUserId(user?.id || user?.userId || '');
      loadData();
    }, [loadData, user?.id, user?.userId])
  );

  const onStartSession = async () => {
    if (!userId.trim() || !vehicleId.trim() || !stationId.trim()) {
      Alert.alert('Validation', 'Please provide user, vehicle and station IDs.');
      return;
    }

    try {
      setStarting(true);
      await startFuelSessionRequest({
        userId: userId.trim(),
        vehicleId: vehicleId.trim(),
        stationId: stationId.trim(),
        fuelType: fuelType.trim(),
      });
      await loadData();
      Alert.alert('Success', 'Fuel session started successfully.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to start session.');
    } finally {
      setStarting(false);
    }
  };

  const onStopSession = async (sessionId) => {
    try {
      setActioningId(sessionId);
      await stopFuelSessionRequest(sessionId, {});
      await loadData();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to stop session.');
    } finally {
      setActioningId('');
    }
  };

  const onCancelSession = async (sessionId) => {
    try {
      setActioningId(sessionId);
      await cancelFuelSessionRequest(sessionId, {});
      await loadData();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to cancel session.');
    } finally {
      setActioningId('');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <AppHeader title="Fuel Sessions" subtitle="Start, stop and track sessions" showBack />

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
        <Text style={styles.heroTitle}>Fuel Sessions</Text>
        <Text style={styles.heroText}>Start, stop and cancel live fueling sessions against the backend.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Start session</Text>
        <TextInput style={styles.input} placeholder="User ID" value={userId} onChangeText={setUserId} />
        <TextInput style={styles.input} placeholder="Vehicle ID" value={vehicleId} onChangeText={setVehicleId} />
        <TextInput style={styles.input} placeholder="Station ID" value={stationId} onChangeText={setStationId} />
        <TextInput style={styles.input} placeholder="Fuel type" value={fuelType} onChangeText={setFuelType} />

        <Pressable style={styles.primaryButton} onPress={onStartSession} disabled={starting}>
          <Text style={styles.primaryButtonText}>{starting ? 'Starting...' : 'Start session'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stations</Text>
        <Text style={styles.helperText}>Use these IDs when starting a session.</Text>
        <FlatList
          data={stations}
          scrollEnabled={false}
          keyExtractor={(item, index) => String(item?.id ?? item?.stationId ?? `${index}`)}
          renderItem={({ item }) => (
            <View style={styles.stationRow}>
              <View>
                <Text style={styles.stationName}>{item?.name || 'Station'}</Text>
                <Text style={styles.stationMeta}>ID: {item?.stationId || item?.id || 'N/A'}</Text>
              </View>
              <Text style={styles.stationMeta}>{item?.city || item?.price ? `${item?.city || ''} ${item?.price ? `• ${item.price}` : ''}` : ''}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No stations returned by the backend.</Text>}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Active sessions</Text>
        <Text style={styles.helperText}>{activeSessions.length} active session(s) found.</Text>
        {activeSessions.length === 0 ? (
          <Text style={styles.emptyText}>No active sessions right now.</Text>
        ) : (
          activeSessions.map((session) => {
            const sessionId = session?.sessionId || session?.id;
            const busy = actioningId === sessionId;

            return (
              <View key={String(sessionId)} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionTitle}>{getSessionLabel(session)}</Text>
                    <Text style={styles.sessionMeta}>Status: {session?.status || 'started'}</Text>
                  </View>
                  <Text style={styles.sessionMeta}>{session?.fuelType || 'fuel'}</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => onStopSession(sessionId)} disabled={busy}>
                    <Text style={styles.secondaryButtonText}>{busy ? 'Working...' : 'Stop'}</Text>
                  </Pressable>
                  <Pressable style={styles.cancelButton} onPress={() => onCancelSession(sessionId)} disabled={busy}>
                    <Text style={styles.cancelButtonText}>{busy ? 'Working...' : 'Cancel'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Session history</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions found.</Text>
        ) : (
          sessions.map((session) => (
            <View key={String(session?.sessionId || session?.id)} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyTitle}>{getSessionLabel(session)}</Text>
                <Text style={styles.historyMeta}>
                  Vehicle: {session?.vehicleId || 'N/A'} • Station: {session?.stationId || 'N/A'}
                </Text>
              </View>
              <Text style={styles.historyStatus}>{session?.status || 'unknown'}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: '#e30613',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroKicker: {
    color: '#ffd5d8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 8,
    color: '#ffecec',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#ffd4d7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#e30613',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  stationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  stationName: {
    fontWeight: '800',
    color: '#111827',
  },
  stationMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  emptyText: {
    color: '#6b7280',
  },
  sessionCard: {
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fffaf9',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  sessionTitle: {
    fontWeight: '900',
    color: '#111827',
  },
  sessionMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#b91c1c',
    fontWeight: '800',
  },
  historyRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyTitle: {
    fontWeight: '800',
    color: '#111827',
  },
  historyMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  historyStatus: {
    color: '#e30613',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});