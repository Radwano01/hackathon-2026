import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_USERS_KEY = 'demo_users';
const DEMO_PROFILE_KEY = 'demo_profile';
const DEMO_CARDS_KEY = 'demo_cards';
const DEMO_CARS_KEY = 'demo_cars';
const DEMO_MODE_ENABLED = true;

const DEMO_SEED_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@fuel.com',
  phone: '+47 900 00 000',
  password: '12345678',
};

const DEMO_SEED_PROFILE = {
  name: 'Demo User',
  email: 'demo@fuel.com',
  phone: '+47 900 00 000',
  password: '12345678',
};

const DEMO_SEED_CARDS = [
  {
    id: 'card_1',
    brand: 'Circle K EXTRA',
    cardNumber: '4111111111111234',
    expiryDate: '10/28',
    active: true,
  },
  {
    id: 'card_2',
    brand: 'Visa',
    cardNumber: '5555444433339876',
    expiryDate: '07/29',
    active: false,
  },
];

const DEMO_SEED_CARS = [
  {
    id: 'car_1',
    model: 'Tesla Model 3',
    plateNumber: '34ABC123',
    active: true,
  },
  {
    id: 'car_2',
    model: 'Toyota Corolla',
    plateNumber: '06XYZ789',
    active: false,
  },
];

const DEMO_DATA = {
  balance: { balance: 1250.75 },
  transactions: [
    { id: 'tx_1', description: 'Fuel Payment - Shell', amount: -45.5, date: '2026-04-26T09:30:00.000Z' },
    { id: 'tx_2', description: 'Wallet Top-up', amount: 120, date: '2026-04-25T15:10:00.000Z' },
    { id: 'tx_3', description: 'Fuel Payment - BP', amount: -38.25, date: '2026-04-22T11:50:00.000Z' },
  ],
  cards: DEMO_SEED_CARDS,
  cars: DEMO_SEED_CARS,
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

const getStoredJson = async (key, fallback) => {
  const raw = await AsyncStorage.getItem(key);
  const parsed = safeParse(raw, fallback);
  return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : { ...fallback, ...(parsed || {}) };
};

const setStoredJson = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getDemoProfile = async () => {
  const storedProfile = await AsyncStorage.getItem(DEMO_PROFILE_KEY);
  if (storedProfile) {
    const parsedProfile = safeParse(storedProfile, DEMO_SEED_PROFILE);
    if (parsedProfile?.name && parsedProfile?.email) {
      return parsedProfile;
    }
  }

  const storedUser = safeParse(await AsyncStorage.getItem('user'), null);
  const fallbackProfile = {
    ...DEMO_SEED_PROFILE,
    ...(storedUser || {}),
  };

  await setStoredJson(DEMO_PROFILE_KEY, fallbackProfile);
  return fallbackProfile;
};

export const saveDemoProfile = async (profile) => {
  const nextProfile = {
    ...DEMO_SEED_PROFILE,
    ...(profile || {}),
  };

  await setStoredJson(DEMO_PROFILE_KEY, nextProfile);
  await AsyncStorage.setItem(
    'user',
    JSON.stringify({
      id: 'demo-user-1',
      name: nextProfile.name,
      email: nextProfile.email,
      phone: nextProfile.phone,
    })
  );

  return nextProfile;
};

export const updateDemoProfile = async (updates) => {
  const currentProfile = await getDemoProfile();
  const nextProfile = {
    ...currentProfile,
    ...updates,
  };

  const users = await getDemoUsers();
  const normalizedOldEmail = String(currentProfile.email || '').toLowerCase();
  const normalizedNewEmail = String(nextProfile.email || '').toLowerCase();
  const matchingIndex = users.findIndex((user) => user.email?.toLowerCase() === normalizedOldEmail);

  if (
    normalizedNewEmail &&
    normalizedNewEmail !== normalizedOldEmail &&
    users.some((user) => user.email?.toLowerCase() === normalizedNewEmail)
  ) {
    throw {
      message: 'Email already exists.',
    };
  }

  if (matchingIndex >= 0) {
    const existing = users[matchingIndex];
    const updatedUser = {
      ...existing,
      name: nextProfile.name,
      phone: nextProfile.phone,
      email: nextProfile.email,
      password: nextProfile.password || existing.password,
    };

    const nextUsers = [...users];
    nextUsers[matchingIndex] = updatedUser;

    if (normalizedNewEmail !== normalizedOldEmail && !nextUsers.some((user) => user.email?.toLowerCase() === normalizedNewEmail && user.id !== existing.id)) {
      await saveDemoUsers(nextUsers);
    } else {
      await saveDemoUsers(nextUsers);
    }
  }

  await saveDemoProfile(nextProfile);

  return nextProfile;
};

export const getDemoCards = async () => {
  const cards = await getStoredJson(DEMO_CARDS_KEY, DEMO_SEED_CARDS);
  if (!Array.isArray(cards) || cards.length === 0) {
    await setStoredJson(DEMO_CARDS_KEY, DEMO_SEED_CARDS);
    return DEMO_SEED_CARDS;
  }
  return cards;
};

export const saveDemoCards = async (cards) => {
  const nextCards = Array.isArray(cards) ? cards : DEMO_SEED_CARDS;
  await setStoredJson(DEMO_CARDS_KEY, nextCards);
  return nextCards;
};

export const getDemoCars = async () => {
  const cars = await getStoredJson(DEMO_CARS_KEY, DEMO_SEED_CARS);
  if (!Array.isArray(cars) || cars.length === 0) {
    await setStoredJson(DEMO_CARS_KEY, DEMO_SEED_CARS);
    return DEMO_SEED_CARS;
  }
  return cars;
};

export const saveDemoCars = async (cars) => {
  const nextCars = Array.isArray(cars) ? cars : DEMO_SEED_CARS;
  await setStoredJson(DEMO_CARS_KEY, nextCars);
  return nextCars;
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
        phone: foundUser.phone || DEMO_SEED_PROFILE.phone,
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
      phone: String(payload?.phone || '').trim() || DEMO_SEED_PROFILE.phone,
      password: String(payload?.password || ''),
    };

    await saveDemoUsers([...users, newUser]);

    return {
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
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
    return { cards: await getDemoCards() };
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
    return { cars: await getDemoCars() };
  }
};

export default api;
