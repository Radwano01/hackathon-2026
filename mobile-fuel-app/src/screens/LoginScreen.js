import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearFinance } from '../redux/financeSlice';
import { hydrateSession } from '../redux/userSlice';
import { getCurrentUserRequest, loginRequest, normalizeUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onLogin = async () => {
    setErrorMessage('');

    if (!phone.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter both phone number and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginRequest({
        phone: phone.trim(),
        password,
      });

      const token = data?.token || data?.accessToken;
      const fallbackUser = normalizeUser({
        userId: data?.userId || data?.id,
        fullName: data?.fullName || data?.name,
        phone: phone.trim(),
        email: data?.email,
      });

      if (!token) {
        throw new Error('No token returned from server.');
      }

      await AsyncStorage.setItem('token', token);
      const currentUser = data?.user || (await getCurrentUserRequest().catch(() => null)) || fallbackUser;
      const user = currentUser || fallbackUser;
      await AsyncStorage.setItem('user', JSON.stringify(user));

      dispatch(clearFinance());
      dispatch(hydrateSession({ token, user }));
    } catch (error) {
      const message = error?.message || 'Unable to login. Please try again.';
      setErrorMessage(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CIRCLE K EXTRA</Text>
        <Text style={styles.heroTitle}>Fuel app login</Text>
        <Text style={styles.heroText}>Use your phone number and password to continue.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage cards, cars and profile settings.</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View style={styles.passwordWrap}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
            onPress={() => setShowPassword((current) => !current)}
          >
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6b7280" />
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    padding: 20,
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
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 8,
    color: '#ffecec',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffd4d7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    color: '#111827',
    backgroundColor: '#fff7f7',
  },
  passwordWrap: {
    borderWidth: 1,
    borderColor: '#ffd4d7',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fff7f7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 11,
    color: '#111827',
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButtonPressed: {
    opacity: 0.75,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '700',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#e30613',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  link: {
    textAlign: 'center',
    marginTop: 16,
    color: '#b91c1c',
    fontWeight: '800',
  },
});
