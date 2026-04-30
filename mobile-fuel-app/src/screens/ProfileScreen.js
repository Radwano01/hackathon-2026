import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AppHeader from '../components/AppHeader';
import { clearFinance } from '../redux/financeSlice';
import { logout, updateUserProfile } from '../redux/userSlice';
import { getCurrentUserRequest, updatePasswordRequest, updateUserRequest } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
  }, [user]);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserRequest();
      if (!profile) {
        return;
      }

      setName(profile.fullName || profile.name || user?.name || '');
      setPhone(profile.phone || user?.phone || '');
      setEmail(user?.email || '');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to load profile.');
    }
  }, [user?.email, user?.name, user?.phone]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onSave = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name, phone and email are required.');
      return;
    }

    try {
      await updateUserRequest({
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      if (currentPassword.trim() && newPassword.trim()) {
        await updatePasswordRequest({
          oldPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        });
      }

      const profileForStorage = {
        id: user?.id || 'demo-user-1',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(profileForStorage));
      dispatch(updateUserProfile(profileForStorage));
      setCurrentPassword('');
      setNewPassword('');
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
        <AppHeader title="Edit Profile" subtitle="Update your account details" showBack />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your account</Text>

          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
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
            placeholder="Current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Pressable style={styles.primaryButton} onPress={onSave}>
            <Text style={styles.primaryButtonText}>Save profile</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
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