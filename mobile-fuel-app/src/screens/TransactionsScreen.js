import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionsRequest } from '../services/api';
import { setTransactions } from '../redux/financeSlice';
import TransactionItem from '../components/TransactionItem';

const parseTransactions = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.transactions)) {
    return data.transactions;
  }
  return [];
};

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.finance.transactions);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getTransactionsRequest();
      dispatch(setTransactions(parseTransactions(data)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load transactions.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item, index) =>
          String(item?.id ?? item?._id ?? `${item?.date || item?.createdAt || 'tx'}-${index}`)
        }
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTransactions} />}
        contentContainerStyle={transactions.length ? styles.listContent : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
});
