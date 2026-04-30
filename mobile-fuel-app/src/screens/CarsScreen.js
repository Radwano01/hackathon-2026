import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addVehicleRequest,
  deactivateVehicleRequest,
  getVehiclesRequest,
  updateVehicleRequest,
} from '../services/api';
import { setVehicles } from '../redux/financeSlice';
import CarItem from '../components/CarItem';
import AppHeader from '../components/AppHeader';

const parseVehicles = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.vehicles)) {
    return data.vehicles;
  }
  if (Array.isArray(data?.cars)) {
    return data.cars;
  }
  return [];
};

export default function CarsScreen() {
  const dispatch = useDispatch();
  const vehicles = useSelector((state) => state.finance.vehicles);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [fuelType, setFuelType] = useState('gasoline');

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const data = await getVehiclesRequest();
      dispatch(setVehicles(parseVehicles(data)));
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load vehicles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  const onAddCar = async () => {
    if (!model.trim() || !plateNumber.trim()) {
      Alert.alert('Validation', 'Please fill model and plate number.');
      return;
    }

    try {
      await addVehicleRequest({
        model: model.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        fuelType: fuelType.trim() || 'gasoline',
      });
      await loadVehicles();
      setModel('');
      setPlateNumber('');
      setFuelType('gasoline');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to add vehicle.');
    }
  };

  const onToggleCarActive = async (id) => {
    const target = vehicles.find((vehicle) => String(vehicle?.id || vehicle?.vehicleId) === String(id));

    try {
      if (target?.active) {
        await deactivateVehicleRequest(id);
      } else {
        await updateVehicleRequest(id, { active: true });
      }
      await loadVehicles();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to update vehicle.');
    }
  };

  const onDeleteCar = async (id) => {
    try {
      await deactivateVehicleRequest(id);
      await loadVehicles();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to deactivate vehicle.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Vehicles" subtitle="Manage your registered cars" showBack />

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#e30613" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : null}

      <FlatList
        data={vehicles}
        keyExtractor={(item, index) => String(item?.id ?? item?.vehicleId ?? `${item?.plateNumber || 'vehicle'}-${index}`)}
        renderItem={({ item }) => (
          <CarItem
            car={item}
            onToggleActive={() => onToggleCarActive(item.id || item.vehicleId)}
            onDelete={() => onDeleteCar(item.id || item.vehicleId)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadVehicles} />}
        contentContainerStyle={vehicles.length ? styles.listContent : styles.emptyContainer}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>CIRCLE K EXTRA</Text>
            <Text style={styles.title}>Vehicles</Text>
            <Text style={styles.subtitle}>
              Add all registered vehicles and mark one or many as active.
            </Text>

            <TextInput style={styles.input} placeholder="Vehicle model" value={model} onChangeText={setModel} />
            <TextInput
              style={styles.input}
              placeholder="Plate number"
              autoCapitalize="characters"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />
            <TextInput style={styles.input} placeholder="Fuel type" value={fuelType} onChangeText={setFuelType} />

            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onAddCar}>
              <Text style={styles.buttonText}>Add vehicle</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No vehicles added.</Text>}
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
  pressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
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
