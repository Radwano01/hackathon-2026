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
      <Text style={styles.greeting}>Welcome, {user?.name || 'User'}</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.summaryCard} onPress={() => navigation.navigate('Cards')}>
          <Text style={styles.summaryLabel}>Cards</Text>
          <Text style={styles.summaryValue}>{cards.length}</Text>
        </Pressable>

        <Pressable style={styles.summaryCard} onPress={() => navigation.navigate('Cars')}>
          <Text style={styles.summaryLabel}>Cars</Text>
          <Text style={styles.summaryValue}>{cars.length}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.transactionsShortcut} onPress={() => navigation.navigate('Transactions')}>
        <Text style={styles.shortcutText}>View All Transactions</Text>
      </Pressable>

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
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  balanceValue: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  summaryLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  transactionsShortcut: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  shortcutText: {
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
});
