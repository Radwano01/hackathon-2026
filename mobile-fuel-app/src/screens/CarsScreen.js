import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCarsRequest, saveDemoCars } from '../services/api';
import { setCars } from '../redux/financeSlice';
import CarItem from '../components/CarItem';

const parseCars = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.cars)) {
    return data.cars;
  }
  return [];
};

export default function CarsScreen() {
  const dispatch = useDispatch();
  const cars = useSelector((state) => state.finance.cars);
  const [refreshing, setRefreshing] = useState(false);
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const loadCars = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getCarsRequest();
      dispatch(setCars(parseCars(data)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load cars.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const persistCars = async (nextCars) => {
    dispatch(setCars(nextCars));
    await saveDemoCars(nextCars);
  };

  const onAddCar = async () => {
    if (!model.trim() || !plateNumber.trim()) {
      Alert.alert('Validation', 'Please fill model and plate number.');
      return;
    }

    const nextCar = {
      id: `car_${Date.now()}`,
      model: model.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      active: cars.length === 0,
    };

    try {
      await persistCars([nextCar, ...cars]);
      setModel('');
      setPlateNumber('');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to add car.');
    }
  };

  const onToggleCarActive = async (id) => {
    const nextCars = cars.map((car) =>
      car.id === id ? { ...car, active: !car.active } : car
    );
    await persistCars(nextCars);
  };

  const onDeleteCar = async (id) => {
    const nextCars = cars.filter((car) => car.id !== id);
    await persistCars(nextCars);
  };

  useFocusEffect(
    useCallback(() => {
      loadCars();
    }, [loadCars])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item, index) => String(item?.id ?? item?._id ?? `${item?.plateNumber || 'car'}-${index}`)}
        renderItem={({ item }) => (
          <CarItem
            car={item}
            onToggleActive={() => onToggleCarActive(item.id)}
            onDelete={() => onDeleteCar(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCars} />}
        contentContainerStyle={cars.length ? styles.listContent : styles.emptyContainer}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>CIRCLE K EXTRA</Text>
            <Text style={styles.title}>Cars</Text>
            <Text style={styles.subtitle}>
              Add all registered cars and mark one or many as active.
            </Text>

            <TextInput style={styles.input} placeholder="Car model" value={model} onChangeText={setModel} />
            <TextInput
              style={styles.input}
              placeholder="Plate number"
              autoCapitalize="characters"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />

            <Pressable style={styles.button} onPress={onAddCar}>
              <Text style={styles.buttonText}>Add car</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No cars found.</Text>}
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
