import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const getStatusColor = (status) => {
  const value = String(status || 'completed').toLowerCase();
  if (value.includes('cancel')) {
    return { backgroundColor: '#fee2e2', color: '#b91c1c' };
  }
  if (value.includes('pending')) {
    return { backgroundColor: '#fef3c7', color: '#92400e' };
  }
  return { backgroundColor: '#dcfce7', color: '#166534' };
};

export default function TransactionItem({ transaction, onPress }) {
  const amount = Number(transaction?.amount) || 0;
  const statusStyle = getStatusColor(transaction?.status);

  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={amount < 0 ? 'arrow-down-circle' : 'arrow-up-circle'} size={22} color={amount < 0 ? '#b91c1c' : '#15803d'} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{transaction?.description || transaction?.type || 'Transaction'}</Text>
        <Text style={styles.subtitle}>{formatDate(transaction?.date || transaction?.createdAt)}</Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={[styles.amount, amount < 0 ? styles.negative : styles.positive]}>{formatAmount(transaction?.amount)}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: statusStyle.color }]}>{transaction?.status || 'completed'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.82,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginLeft: 10,
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  positive: {
    color: '#15803d',
  },
  negative: {
    color: '#b91c1c',
  },
});
