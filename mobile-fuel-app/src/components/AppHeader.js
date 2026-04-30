import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { clearFinance } from '../redux/financeSlice';
import { logout } from '../redux/userSlice';

export default function AppHeader({ title, subtitle, showBack = false, showProfile = false }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [menuVisible, setMenuVisible] = useState(false);

  const initials = useMemo(() => {
    const full = String(user?.name || '').trim();
    if (!full) {
      return 'U';
    }

    return full
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }, [user?.name]);

  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  };

  const onLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    dispatch(clearFinance());
    dispatch(logout());
  };

  const openProfile = () => {
    setMenuVisible(false);
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftArea}>
        {showBack ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={onBack}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {showProfile ? (
        <Pressable
          style={({ pressed }) => [styles.avatarButton, pressed && styles.iconButtonPressed]}
          onPress={() => setMenuVisible((current) => !current)}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
      ) : null}

      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <View style={styles.menuHeader}>
              <Ionicons name="person-circle-outline" size={22} color="#111827" />
              <Text style={styles.menuName}>{user?.name || 'User'}</Text>
            </View>
            <Text style={styles.menuEmail}>{user?.email || 'No email provided'}</Text>
            <Pressable
              style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
              onPress={openProfile}
            >
              <Ionicons name="create-outline" size={16} color="#111827" />
              <Text style={styles.settingsText}>Edit Profile</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Settings');
              }}
            >
              <Ionicons name="settings-outline" size={16} color="#111827" />
              <Text style={styles.settingsText}>Settings</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
              onPress={onLogout}
            >
              <Ionicons name="log-out-outline" size={16} color="#ffffff" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leftArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#e30613',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingRight: 16,
  },
  menuCard: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  menuEmail: {
    marginTop: 8,
    marginBottom: 14,
    color: '#6b7280',
    fontSize: 13,
  },
  settingsButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  settingsButtonPressed: {
    opacity: 0.85,
  },
  settingsText: {
    color: '#111827',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});