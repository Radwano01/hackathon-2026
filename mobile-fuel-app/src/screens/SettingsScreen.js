import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { clearFinance } from '../redux/financeSlice';
import { logout } from '../redux/userSlice';

export default function SettingsScreen({ navigation }) {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);

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
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<AppHeader title="Settings" subtitle="Preferences and account" showBack />

			<View style={styles.profileCard}>
				<View style={styles.avatarWrap}>
					<Ionicons name="person" size={22} color="#ffffff" />
				</View>
				<View>
					<Text style={styles.name}>{user?.name || 'User'}</Text>
					<Text style={styles.email}>{user?.email || 'No email provided'}</Text>
				</View>
			</View>

			<View style={styles.menuCard}>
				<Pressable style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]} onPress={() => navigation.navigate('Cards')}>
					<Ionicons name="card-outline" size={18} color="#111827" />
					<Text style={styles.rowText}>Manage cards</Text>
				</Pressable>
				<Pressable style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]} onPress={() => navigation.navigate('Cars')}>
					<Ionicons name="car-outline" size={18} color="#111827" />
					<Text style={styles.rowText}>Manage vehicles</Text>
				</Pressable>
				<Pressable style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]} onPress={() => navigation.navigate('Transactions')}>
					<Ionicons name="list-outline" size={18} color="#111827" />
					<Text style={styles.rowText}>View transactions</Text>
				</Pressable>
			</View>

			<Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]} onPress={onLogout}>
				<Ionicons name="log-out-outline" size={18} color="#ffffff" />
				<Text style={styles.logoutText}>Logout</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f7f7f7',
	},
	content: {
		padding: 16,
		paddingBottom: 24,
	},
	profileCard: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		padding: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 3 },
		elevation: 2,
	},
	avatarWrap: {
		width: 40,
		height: 40,
		borderRadius: 14,
		backgroundColor: '#e30613',
		alignItems: 'center',
		justifyContent: 'center',
	},
	name: {
		fontSize: 16,
		fontWeight: '800',
		color: '#111827',
	},
	email: {
		marginTop: 4,
		color: '#6b7280',
		fontSize: 13,
	},
	menuCard: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		paddingVertical: 6,
		marginBottom: 14,
	},
	rowButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	rowText: {
		color: '#111827',
		fontWeight: '700',
		fontSize: 14,
	},
	logoutButton: {
		backgroundColor: '#111827',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	logoutText: {
		color: '#ffffff',
		fontWeight: '700',
	},
	pressed: {
		opacity: 0.82,
	},
});
