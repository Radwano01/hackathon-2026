import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletRequest } from '../services/api';
import { removeCard, setWallet, toggleCardActive } from '../redux/financeSlice';
import AppHeader from '../components/AppHeader';
import CardItem from '../components/CardItem';

export default function CardsScreen() {
  const dispatch = useDispatch();
  const wallet = useSelector((state) => state.finance.wallet);
  const cards = useSelector((state) => state.finance.cards);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const data = await getWalletRequest();
      dispatch(setWallet(data));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load wallet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadWallet} />}
    >
      <AppHeader title="Wallet & Cards" subtitle="Balance and saved cards" showBack />

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
        <Text style={styles.heroTitle}>Wallet</Text>
        <Text style={styles.heroText}>Your balance and currency are loaded from the backend.</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#e30613" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      ) : null}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>
          {wallet?.currency || 'USD'} {Number(wallet?.balance || 0).toFixed(2)}
        </Text>
        <Text style={styles.balanceCaption}>Connected to the live wallet service</Text>
      </View>

      <Text style={styles.sectionTitle}>Saved Cards</Text>
      <FlatList
        data={cards}
        keyExtractor={(item, index) => String(item?.id ?? `${item?.cardNumber || 'card'}-${index}`)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <CardItem
            card={item}
            onToggleActive={() => dispatch(toggleCardActive(item.id))}
            onDelete={() => dispatch(removeCard(item.id))}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No cards added yet.</Text>}
      />
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroKicker: {
    color: '#ffd5d8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 6,
    color: '#ffffff',
    fontSize: 24,
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
