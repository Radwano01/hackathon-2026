import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
import { clearFinance } from './src/redux/financeSlice';
import { hydrateSession, logout, markHydrated } from './src/redux/userSlice';
import { getCurrentUserRequest } from './src/services/api';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import FuelSessionsScreen from './src/screens/FuelSessionsScreen';
import CardsScreen from './src/screens/CardsScreen';
import CarsScreen from './src/screens/CarsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const getTabIcon = (routeName, color, size) => {
    if (routeName === 'Home') {
      return <Ionicons name="home-outline" size={size} color={color} />;
    }
    if (routeName === 'Transactions') {
      return <Ionicons name="list-outline" size={size} color={color} />;
    }
    if (routeName === 'Fuel Sessions') {
      return <MaterialCommunityIcons name="fuel" size={size} color={color} />;
    }
    if (routeName === 'Cards') {
      return <Ionicons name="card-outline" size={size} color={color} />;
    }
    if (routeName === 'Cars') {
      return <Ionicons name="car-outline" size={size} color={color} />;
    }

    return <Ionicons name="settings-outline" size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#e30613',
        tabBarInactiveTintColor: '#8a8f98',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => getTabIcon(route.name, color, focused ? size + 1 : size),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Fuel Sessions" component={FuelSessionsScreen} />
      <Tab.Screen name="Cards" component={CardsScreen} options={{ tabBarLabel: 'Wallet' }} />
      <Tab.Screen name="Cars" component={CarsScreen} options={{ tabBarLabel: 'Vehicles' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, isHydrated } = useSelector((state) => state.user);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const [tokenEntry, userEntry] = await AsyncStorage.multiGet(['token', 'user']);
        const authToken = tokenEntry?.[1] || null;
        const storedUser = userEntry?.[1] ? JSON.parse(userEntry[1]) : null;

        if (authToken) {
          const remoteUser = await getCurrentUserRequest().catch(() => null);
          dispatch(hydrateSession({ token: authToken, user: remoteUser || storedUser }));
          return;
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['token', 'user']);
        dispatch(clearFinance());
        dispatch(logout());
        return;
      }

      dispatch(markHydrated());
    };

    bootstrapAuth();
  }, [dispatch]);

  if (!isHydrated) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    borderTopWidth: 0,
    height: 66,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
