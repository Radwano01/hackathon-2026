import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const maskCardNumber = (numberValue) => {
  const digits = String(numberValue || '').replace(/\D/g, '');
  const lastFour = digits.slice(-4).padStart(4, '0');
  return `**** **** **** ${lastFour}`;
};

export default function CardItem({ card, onToggleActive, onDelete }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Text style={styles.label}>{card?.brand || 'Card'}</Text>
          <Text style={styles.number}>{maskCardNumber(card?.number || card?.cardNumber)}</Text>
        </View>
        <View style={[styles.badge, card?.active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{card?.active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.expiry}>{card?.expiryDate || card?.expiry || '--/--'}</Text>
        <View style={styles.actions}>
          <Switch
            value={Boolean(card?.active)}
            onValueChange={onToggleActive}
            trackColor={{ false: '#d1d5db', true: '#f97316' }}
            thumbColor="#ffffff"
          />
          {onDelete ? (
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandWrap: {
    flex: 1,
  },
  label: {
    color: '#e30613',
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  number: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 1.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiry: {
    color: '#6b7280',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
  },
  deleteText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
