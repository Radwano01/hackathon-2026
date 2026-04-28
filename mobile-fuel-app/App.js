import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
import { hydrateSession, markHydrated } from './src/redux/userSlice';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import CardsScreen from './src/screens/CardsScreen';
import CarsScreen from './src/screens/CarsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="Cars" component={CarsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, isHydrated } = useSelector((state) => state.user);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const [token, userRaw] = await AsyncStorage.multiGet(['token', 'user']);
        const authToken = token?.[1] || null;
        const storedUser = userRaw?.[1] ? JSON.parse(userRaw[1]) : null;

        if (authToken) {
          dispatch(hydrateSession({ token: authToken, user: storedUser }));
          return;
        }
      } catch (error) {
        // If parsing fails, app continues in logged-out mode.
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
      {isAuthenticated ? <MainStack /> : <AuthStack />}
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
