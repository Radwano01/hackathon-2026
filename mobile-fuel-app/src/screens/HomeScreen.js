import React, { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getBalanceRequest,
  getCardsRequest,
  getCarsRequest,
  getTransactionsRequest,
} from '../services/api';
import { setBalance, setCards, setCars, setTransactions } from '../redux/financeSlice';
import TransactionItem from '../components/TransactionItem';

const parseCollection = (data, key) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.[key])) {
    return data[key];
  }
  return [];
};

const parseBalance = (data) => {
  const value = data?.balance ?? data?.amount ?? data;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { balance, transactions, cards, cars } = useSelector((state) => state.finance);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      const [balanceData, transactionsData, cardsData, carsData] = await Promise.all([
        getBalanceRequest(),
        getTransactionsRequest(),
        getCardsRequest(),
        getCarsRequest(),
      ]);

      dispatch(setBalance(parseBalance(balanceData)));
      dispatch(setTransactions(parseCollection(transactionsData, 'transactions')));
      dispatch(setCards(parseCollection(cardsData, 'cards')));
      dispatch(setCars(parseCollection(carsData, 'cars')));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load dashboard data.');
    } finally {
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
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
        <Text style={styles.heroTitle}>Welcome, {user?.name || 'User'}</Text>
        <Text style={styles.heroText}>Manage fuel, cards, cars and your profile from one place.</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
        <Text style={styles.balanceCaption}>Available for fuel and payments</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.summaryCard} onPress={() => navigation.navigate('Cards')}>
          <Text style={styles.summaryLabel}>Cards</Text>
          <Text style={styles.summaryValue}>{cards.length}</Text>
          <Text style={styles.summaryHint}>{cards.filter((card) => card.active).length} active</Text>
        </Pressable>

        <Pressable style={styles.summaryCard} onPress={() => navigation.navigate('Cars')}>
          <Text style={styles.summaryLabel}>Cars</Text>
          <Text style={styles.summaryValue}>{cars.length}</Text>
          <Text style={styles.summaryHint}>{cars.filter((car) => car.active).length} active</Text>
        </Pressable>
      </View>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.quickButtonTitle}>Transactions</Text>
          <Text style={styles.quickButtonText}>See payment history</Text>
        </Pressable>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.quickButtonTitle}>Profile</Text>
          <Text style={styles.quickButtonText}>Edit account details</Text>
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
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
});
