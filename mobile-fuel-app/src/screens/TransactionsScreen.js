import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionsRequest } from '../services/api';
import { setTransactions } from '../redux/financeSlice';
import TransactionItem from '../components/TransactionItem';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';

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
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.finance.transactions);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const data = await getTransactionsRequest();
      dispatch(setTransactions(parseTransactions(data)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = transactions.filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      const amount = String(item?.amount ?? '').toLowerCase();
      const type = String(item?.type || item?.description || '').toLowerCase();
      const status = String(item?.status || '').toLowerCase();
      return amount.includes(normalizedQuery) || type.includes(normalizedQuery) || status.includes(normalizedQuery);
    });

    const sorted = [...filtered];
    if (sortBy === 'amount') {
      sorted.sort((a, b) => Number(b?.amount || 0) - Number(a?.amount || 0));
    } else if (sortBy === 'status') {
      sorted.sort((a, b) => String(a?.status || '').localeCompare(String(b?.status || '')));
    } else {
      sorted.sort((a, b) => {
        const left = new Date(a?.date || a?.createdAt || 0).getTime();
        const right = new Date(b?.date || b?.createdAt || 0).getTime();
        return right - left;
      });
    }

    return sorted;
  }, [query, sortBy, transactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Transactions" subtitle="Search and sort activity" showBack />

      <View style={styles.controlsWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by amount, type, or status"
        />

        <View style={styles.sortRow}>
          <Pressable style={({ pressed }) => [styles.sortChip, sortBy === 'date' && styles.sortChipActive, pressed && styles.pressed]} onPress={() => setSortBy('date')}>
            <Text style={[styles.sortChipText, sortBy === 'date' && styles.sortChipTextActive]}>Newest</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.sortChip, sortBy === 'amount' && styles.sortChipActive, pressed && styles.pressed]} onPress={() => setSortBy('amount')}>
            <Text style={[styles.sortChipText, sortBy === 'amount' && styles.sortChipTextActive]}>Amount</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.sortChip, sortBy === 'status' && styles.sortChipActive, pressed && styles.pressed]} onPress={() => setSortBy('status')}>
            <Text style={[styles.sortChipText, sortBy === 'status' && styles.sortChipTextActive]}>Status</Text>
          </Pressable>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#e30613" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : null}

      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item, index) =>
          String(item?.id ?? item?._id ?? `${item?.date || item?.createdAt || 'tx'}-${index}`)
        }
        renderItem={({ item }) => <TransactionItem transaction={item} onPress={() => navigation.navigate('Home')} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTransactions} />}
        contentContainerStyle={filteredAndSorted.length ? styles.listContent : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
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
  controlsWrap: {
    gap: 10,
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
  },
  sortChipActive: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  sortChipText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  sortChipTextActive: {
    color: '#b91c1c',
  },
  pressed: {
    opacity: 0.82,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 13,
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
