import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/userSlice';
import { clearFinance } from '../redux/financeSlice';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  const onLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      dispatch(clearFinance());
      dispatch(logout());
    } catch (error) {
      Alert.alert('Error', 'Unable to logout right now. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.itemLabel}>Name</Text>
        <Text style={styles.itemValue}>{user?.name || 'N/A'}</Text>

        <Text style={styles.itemLabel}>Email</Text>
        <Text style={styles.itemValue}>{user?.email || 'N/A'}</Text>

        <Text style={styles.itemLabel}>Token Status</Text>
        <Text style={styles.itemValue}>{token ? 'Authenticated' : 'Not Authenticated'}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  itemLabel: {
    color: '#6b7280',
    marginTop: 10,
    fontWeight: '600',
  },
  itemValue: {
    marginTop: 4,
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
