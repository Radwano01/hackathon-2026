import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const formatAmount = (amount) => {
  const numeric = Number(amount) || 0;
  return `${numeric < 0 ? '-' : ''}$${Math.abs(numeric).toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString();
};

export default function TransactionItem({ transaction }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{transaction?.description || transaction?.type || 'Transaction'}</Text>
        <Text style={styles.subtitle}>{formatDate(transaction?.date || transaction?.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, (Number(transaction?.amount) || 0) < 0 ? styles.negative : styles.positive]}>
        {formatAmount(transaction?.amount)}
      </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  positive: {
    color: '#15803d',
  },
  negative: {
    color: '#b91c1c',
  },
});
