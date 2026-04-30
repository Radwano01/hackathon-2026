import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  getTransactionsRequest,
  getVehiclesRequest,
  getWalletRequest,
} from '../services/api';
import { setTransactions, setVehicles, setWallet } from '../redux/financeSlice';
import TransactionItem from '../components/TransactionItem';
import AppHeader from '../components/AppHeader';

const parseCollection = (data, key) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.[key])) {
    return data[key];
  }
  return [];
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { wallet, transactions, vehicles } = useSelector((state) => state.finance);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const [walletData, transactionsData, vehiclesData] = await Promise.all([
        getWalletRequest(),
        getTransactionsRequest(),
        getVehiclesRequest(),
      ]);

      dispatch(setWallet(walletData));
      dispatch(setTransactions(parseCollection(transactionsData, 'transactions')));
      dispatch(setVehicles(parseCollection(vehiclesData, 'vehicles')));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} />}
    >
      <AppHeader title="Dashboard" subtitle="Your account overview" showProfile />

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
        <Text style={styles.heroTitle}>Welcome, {user?.name || 'User'}</Text>
        <Text style={styles.heroText}>Manage fuel, cards, cars and your profile from one place.</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#e30613" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      ) : null}

      <View style={styles.balanceCard}>
        <View style={styles.balanceTitleRow}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Ionicons name="wallet-outline" size={18} color="#6b7280" />
        </View>
        <Text style={styles.balanceValue}>{wallet?.currency || 'USD'} {Number(wallet?.balance || 0).toFixed(2)}</Text>
        <Text style={styles.balanceCaption}>Available for fuel and payments</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]} onPress={() => navigation.navigate('Cars')}>
          <Ionicons name="car-outline" size={18} color="#e30613" />
          <Text style={styles.summaryLabel}>Vehicles</Text>
          <Text style={styles.summaryValue}>{vehicles.length}</Text>
          <Text style={styles.summaryHint}>{vehicles.filter((vehicle) => vehicle.active).length} active</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]} onPress={() => navigation.navigate('Transactions')}>
          <Ionicons name="list-outline" size={18} color="#e30613" />
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>{transactions.length}</Text>
          <Text style={styles.summaryHint}>Recent activity</Text>
        </Pressable>
      </View>

      <View style={styles.quickGrid}>
        <Pressable style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]} onPress={() => navigation.navigate('Fuel Sessions')}>
          <Text style={styles.quickButtonTitle}>Fuel Sessions</Text>
          <Text style={styles.quickButtonText}>Start or stop fueling</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.slice(0, 3).map((item, index) => (
        <TransactionItem
          key={String(item?.id ?? item?._id ?? `${item?.date || item?.createdAt || 'tx'}-${index}`)}
          transaction={item}
        />
      ))}

      {transactions.length === 0 && <Text style={styles.emptyText}>No transactions yet.</Text>}
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
    paddingBottom: 24,
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
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceValue: {
    marginTop: 8,
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
  },
  balanceCaption: {
    marginTop: 8,
    color: '#6b7280',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
    padding: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  summaryLabel: {
    color: '#e30613',
    fontWeight: '800',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  summaryHint: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#fff1f2',
    borderRadius: 24,
    padding: 16,
  },
  quickButtonTitle: {
    color: '#b91c1c',
    fontWeight: '900',
    fontSize: 16,
  },
  quickButtonText: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
    color: '#111827',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
});
