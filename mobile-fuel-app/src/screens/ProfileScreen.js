import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { clearFinance } from '../redux/financeSlice';
import { logout, updateUserProfile } from '../redux/userSlice';
import { updateDemoProfile } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const { cards, cars } = useSelector((state) => state.finance);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
  }, [user]);

  const activeCardsCount = useMemo(() => cards.filter((card) => card.active).length, [cards]);
  const activeCarsCount = useMemo(() => cars.filter((car) => car.active).length, [cars]);

  const onSave = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name, phone and email are required.');
      return;
    }

    try {
      const updatedProfile = await updateDemoProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ...(password.trim() ? { password } : {}),
      });

      const profileForStorage = {
        id: user?.id || 'demo-user-1',
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        email: updatedProfile.email,
      };

      await AsyncStorage.setItem('user', JSON.stringify(profileForStorage));
      dispatch(updateUserProfile(profileForStorage));
      setPassword('');
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to update profile.');
    }
  };

  const onLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      dispatch(clearFinance());
      dispatch(logout());
    } catch (error) {
      Alert.alert('Error', 'Unable to logout right now. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
          <Text style={styles.heroTitle}>Profile & Access</Text>
          <Text style={styles.heroText}>Edit your account, cards and cars in one place.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your account</Text>

          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="New password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.primaryButton} onPress={onSave}>
            <Text style={styles.primaryButtonText}>Save profile</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeCardsCount}</Text>
            <Text style={styles.summaryLabel}>Active cards</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeCarsCount}</Text>
            <Text style={styles.summaryLabel}>Active cars</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Manage access</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Cards')}>
              <Text style={styles.secondaryButtonText}>Open cards</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Cars')}>
              <Text style={styles.secondaryButtonText}>Open cars</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.mutedText}>{token ? 'You are logged in.' : 'You are logged out.'}</Text>
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: '#e30613',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroKicker: {
    color: '#ffd5d8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroText: {
    marginTop: 8,
    color: '#ffecec',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#ffd4d7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#e30613',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#e30613',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff1f2',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#b91c1c',
    fontWeight: '800',
  },
  mutedText: {
    color: '#6b7280',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});