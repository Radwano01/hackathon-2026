import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CarItem({ car }) {
  return (
    <View style={styles.container}>
      <Text style={styles.model}>{car?.model || 'Unknown Model'}</Text>
      <Text style={styles.plate}>Plate: {car?.plateNumber || car?.plate || 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  model: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  plate: {
    marginTop: 6,
    color: '#4b5563',
    fontSize: 14,
  },
});
