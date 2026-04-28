import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_USERS_KEY = 'demo_users';
const DEMO_MODE_ENABLED = true;

const DEMO_SEED_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@fuel.com',
  password: '12345678',
};

const DEMO_DATA = {
  balance: { balance: 1250.75 },
  transactions: [
    { id: 'tx_1', description: 'Fuel Payment - Shell', amount: -45.5, date: '2026-04-26T09:30:00.000Z' },
    { id: 'tx_2', description: 'Wallet Top-up', amount: 120, date: '2026-04-25T15:10:00.000Z' },
    { id: 'tx_3', description: 'Fuel Payment - BP', amount: -38.25, date: '2026-04-22T11:50:00.000Z' },
  ],
  cards: [
    { id: 'card_1', brand: 'Visa', cardNumber: '4111111111111234', expiryDate: '10/28' },
    { id: 'card_2', brand: 'Mastercard', cardNumber: '5555444433339876', expiryDate: '07/29' },
  ],
  cars: [
    { id: 'car_1', model: 'Tesla Model 3', plateNumber: '34ABC123' },
    { id: 'car_2', model: 'Toyota Corolla', plateNumber: '06XYZ789' },
  ],
};

const buildDemoToken = (email) => `demo-token-${email}-${Date.now()}`;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const getDemoUsers = async () => {
  const raw = await AsyncStorage.getItem(DEMO_USERS_KEY);
  const parsed = safeParse(raw, []);
  const list = Array.isArray(parsed) ? parsed : [];

  if (!list.some((user) => user.email?.toLowerCase() === DEMO_SEED_USER.email.toLowerCase())) {
    const seeded = [...list, DEMO_SEED_USER];
    await AsyncStorage.setItem(DEMO_USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return list;
};

const saveDemoUsers = async (users) => {
  await AsyncStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

const shouldUseDemoFallback = (error) => {
  if (!DEMO_MODE_ENABLED) {
    return false;
  }

  // Fallback only when server is unreachable/timeouts/5xx.
  const status = error?.status || error?.response?.status;
  return !status || status >= 500;
};

const api = axios.create({
  baseURL: 'http://YOUR_BACKEND_URL',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export const loginRequest = async (payload) => {
  try {
    const response = await api.post('/login', payload);
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    const users = await getDemoUsers();
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');
    const foundUser = users.find((user) => user.email?.toLowerCase() === email);

    if (!foundUser || foundUser.password !== password) {
      throw {
        message: 'Invalid email or password.',
      };
    }

    return {
      token: buildDemoToken(foundUser.email),
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      },
    };
  }
};

export const registerRequest = async (payload) => {
  try {
    const response = await api.post('/register', payload);
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    const users = await getDemoUsers();
    const email = String(payload?.email || '').trim().toLowerCase();

    if (users.some((user) => user.email?.toLowerCase() === email)) {
      throw {
        message: 'Email already exists.',
      };
    }

    const newUser = {
      id: `demo-user-${Date.now()}`,
      name: String(payload?.name || '').trim() || 'User',
      email,
      password: String(payload?.password || ''),
    };

    await saveDemoUsers([...users, newUser]);

    return {
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }
};

export const getBalanceRequest = async () => {
  try {
    const response = await api.get('/balance');
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }
    return DEMO_DATA.balance;
  }
};

export const getTransactionsRequest = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }
    return { transactions: DEMO_DATA.transactions };
  }
};

export const getCardsRequest = async () => {
  try {
    const response = await api.get('/cards');
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }
    return { cards: DEMO_DATA.cards };
  }
};

export const getCarsRequest = async () => {
  try {
    const response = await api.get('/cars');
    return response.data;
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }
    return { cars: DEMO_DATA.cars };
  }
};

export default api;
