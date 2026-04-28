import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCarsRequest } from '../services/api';
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
        renderItem={({ item }) => <CarItem car={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCars} />}
        contentContainerStyle={cars.length ? styles.listContent : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No cars found.</Text>}
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
