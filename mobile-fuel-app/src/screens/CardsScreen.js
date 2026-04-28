import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCardsRequest } from '../services/api';
import { setCards } from '../redux/financeSlice';
import CardItem from '../components/CardItem';

const parseCards = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.cards)) {
    return data.cards;
  }
  return [];
};

export default function CardsScreen() {
  const dispatch = useDispatch();
  const cards = useSelector((state) => state.finance.cards);
  const [refreshing, setRefreshing] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getCardsRequest();
      dispatch(setCards(parseCards(data)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load cards.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item, index) => String(item?.id ?? item?._id ?? `${item?.cardNumber || 'card'}-${index}`)}
        renderItem={({ item }) => <CardItem card={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCards} />}
        contentContainerStyle={cards.length ? styles.listContent : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No cards found.</Text>}
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
