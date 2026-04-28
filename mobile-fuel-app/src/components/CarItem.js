import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export default function CarItem({ car, onToggleActive, onDelete }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftBlock}>
          <Text style={styles.model}>{car?.model || 'Unknown Model'}</Text>
          <Text style={styles.plate}>Plate: {car?.plateNumber || car?.plate || 'N/A'}</Text>
        </View>
        <View style={[styles.badge, car?.active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{car?.active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Switch
          value={Boolean(car?.active)}
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
  leftBlock: {
    flex: 1,
  },
  model: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  plate: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 14,
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
