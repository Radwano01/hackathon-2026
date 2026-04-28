import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCardsRequest, saveDemoCards } from '../services/api';
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
  const [brand, setBrand] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

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

  const persistCards = async (nextCards) => {
    dispatch(setCards(nextCards));
    await saveDemoCards(nextCards);
  };

  const onAddCard = async () => {
    if (!brand.trim() || !cardNumber.trim() || !expiryDate.trim()) {
      Alert.alert('Validation', 'Please fill brand, card number and expiry date.');
      return;
    }

    const normalizedNumber = cardNumber.replace(/\D/g, '');
    if (normalizedNumber.length < 4) {
      Alert.alert('Validation', 'Card number should contain at least 4 digits.');
      return;
    }

    const nextCard = {
      id: `card_${Date.now()}`,
      brand: brand.trim(),
      cardNumber: normalizedNumber,
      expiryDate: expiryDate.trim(),
      active: cards.length === 0,
    };

    try {
      await persistCards([nextCard, ...cards]);
      setBrand('');
      setCardNumber('');
      setExpiryDate('');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to add card.');
    }
  };

  const onToggleCardActive = async (id) => {
    const nextCards = cards.map((card) =>
      card.id === id ? { ...card, active: !card.active } : card
    );
    await persistCards(nextCards);
  };

  const onDeleteCard = async (id) => {
    const nextCards = cards.filter((card) => card.id !== id);
    await persistCards(nextCards);
  };

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
        renderItem={({ item }) => (
          <CardItem
            card={item}
            onToggleActive={() => onToggleCardActive(item.id)}
            onDelete={() => onDeleteCard(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCards} />}
        contentContainerStyle={cards.length ? styles.listContent : styles.emptyContainer}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>CIRCLE K EXTRA</Text>
            <Text style={styles.title}>Cards</Text>
            <Text style={styles.subtitle}>
              Add as many cards as you want. Use the switch to mark one or more as active.
            </Text>

            <TextInput style={styles.input} placeholder="Card brand" value={brand} onChangeText={setBrand} />
            <TextInput
              style={styles.input}
              placeholder="Card number"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry date (MM/YY)"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />

            <Pressable style={styles.button} onPress={onAddCard}>
              <Text style={styles.buttonText}>Add card</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No cards found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  kicker: {
    color: '#e30613',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: '#6b7280',
    lineHeight: 20,
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
  button: {
    backgroundColor: '#e30613',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
});
