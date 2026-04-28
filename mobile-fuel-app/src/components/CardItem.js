import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const maskCardNumber = (numberValue) => {
  const digits = String(numberValue || '').replace(/\D/g, '');
  const lastFour = digits.slice(-4).padStart(4, '0');
  return `**** **** **** ${lastFour}`;
};

export default function CardItem({ card }) {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>{maskCardNumber(card?.number || card?.cardNumber)}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{card?.brand || 'Card'}</Text>
        <Text style={styles.expiry}>{card?.expiryDate || card?.expiry || '--/--'}</Text>
      </View>
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
  number: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1,
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#374151',
    fontWeight: '600',
  },
  expiry: {
    color: '#6b7280',
    fontWeight: '500',
  },
});
