import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../redux/store';
import { clearFinance } from '../redux/financeSlice';
import { logout } from '../redux/userSlice';

const DEFAULT_API_BASE_URL = 'http://YOUR_BACKEND_URL';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

const hasConfiguredBaseUrl =
  Boolean(API_BASE_URL) &&
  !String(API_BASE_URL).includes('YOUR_BACKEND_URL') &&
  !String(API_BASE_URL).includes('api.smartfuel.com');

const DEMO_MODE_ENABLED =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' || !hasConfiguredBaseUrl;

const DEMO_STATE_KEY = 'demo_state_v1';
const DEMO_SEED_USER = {
  id: 'demo-user-1',
  userId: 'demo-user-1',
  fullName: 'Demo Driver',
  phone: '+971500000001',
  email: 'demo@fuel.app',
  password: '123456',
};

const DEMO_SEED_STATE = {
  users: [DEMO_SEED_USER],
  walletsByUser: {
    'demo-user-1': {
      walletId: 'wallet-demo-1',
      balance: 1250.75,
      currency: 'USD',
    },
  },
  vehiclesByUser: {
    'demo-user-1': [
      {
        id: 'vehicle-demo-1',
        vehicleId: 'vehicle-demo-1',
        model: 'Tesla Model 3',
        plateNumber: '34ABC123',
        fuelType: 'electric',
        active: true,
      },
    ],
  },
  transactionsByUser: {
    'demo-user-1': [
      {
        id: 'tx-demo-1',
        transactionId: 'tx-demo-1',
        amount: -45.5,
        description: 'Fuel Payment - Demo Station',
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-demo-2',
        transactionId: 'tx-demo-2',
        amount: 120,
        description: 'Wallet Top-up',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  sessionsByUser: {
    'demo-user-1': [],
  },
  stations: [
    {
      id: 'station-demo-1',
      stationId: 'station-demo-1',
      name: 'Demo Station Downtown',
      city: 'Dubai',
      price: 3.05,
    },
    {
      id: 'station-demo-2',
      stationId: 'station-demo-2',
      name: 'Demo Station Marina',
      city: 'Dubai',
      price: 3.15,
    },
  ],
};

const getApiConfigurationMessage = () =>
  'Backend URL is not configured. Set EXPO_PUBLIC_API_BASE_URL (for example: http://localhost:8080/v1), then restart Expo.';

const clone = (value) => JSON.parse(JSON.stringify(value));

const readDemoState = async () => {
  const raw = await AsyncStorage.getItem(DEMO_STATE_KEY);
  if (!raw) {
    const seeded = clone(DEMO_SEED_STATE);
    await AsyncStorage.setItem(DEMO_STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...clone(DEMO_SEED_STATE),
      ...(parsed || {}),
    };
  } catch (error) {
    const seeded = clone(DEMO_SEED_STATE);
    await AsyncStorage.setItem(DEMO_STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writeDemoState = async (state) => {
  await AsyncStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
};

const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const getActiveDemoUser = async (state) => {
  const storedUser = await getStoredUser();
  const activeId = storedUser?.id || storedUser?.userId;
  const found = state.users.find((user) => user.id === activeId || user.userId === activeId);
  return found || state.users[0] || DEMO_SEED_USER;
};

const createDemoToken = (userId) => `demo-token-${userId}`;

const shouldUseDemoFallback = (error) => {
  if (!DEMO_MODE_ENABLED) {
    return false;
  }

  if (!hasConfiguredBaseUrl) {
    return true;
  }

  if (!error?.status) {
    return true;
  }

  return false;
};

const demoLogin = async (payload) => {
  const state = await readDemoState();
  const phone = String(payload?.phone || '').trim();
  const password = String(payload?.password || '');

  const found = state.users.find((user) => user.phone === phone);
  if (!found || String(found.password || '') !== password) {
    throw {
      message: 'Invalid phone number or password.',
    };
  }

  return {
    token: createDemoToken(found.id),
    userId: found.id,
    user: normalizeUser(found),
  };
};

const demoRegister = async (payload) => {
  const state = await readDemoState();
  const fullName = String(payload?.fullName || '').trim();
  const phoneNumber = String(payload?.phoneNumber || '').trim();
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');

  if (state.users.some((user) => user.phone === phoneNumber)) {
    throw {
      message: 'Phone number already exists.',
    };
  }

  const nextId = `demo-user-${Date.now()}`;
  const newUser = {
    id: nextId,
    userId: nextId,
    fullName,
    phone: phoneNumber,
    email,
    password,
  };

  state.users = [...state.users, newUser];
  state.walletsByUser[nextId] = {
    walletId: `wallet-${nextId}`,
    balance: 500,
    currency: 'USD',
  };
  state.vehiclesByUser[nextId] = [];
  state.transactionsByUser[nextId] = [];
  state.sessionsByUser[nextId] = [];

  await writeDemoState(state);

  return {
    token: createDemoToken(nextId),
    userId: nextId,
    user: normalizeUser(newUser),
    message: 'Demo account created successfully.',
  };
};

const demoGetCurrentUser = async () => {
  const state = await readDemoState();
  return normalizeUser(await getActiveDemoUser(state));
};

const demoGetWallet = async () => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  return normalizeWallet(state.walletsByUser[active.id] || { balance: 0, currency: 'USD' });
};

const demoGetTransactions = async () => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const transactions = state.transactionsByUser[active.id] || [];
  return {
    transactions: transactions.map(normalizeTransaction),
  };
};

const demoGetVehicles = async () => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const vehicles = state.vehiclesByUser[active.id] || [];
  return {
    vehicles: vehicles.map(normalizeVehicle),
    cars: vehicles.map(normalizeVehicle),
  };
};

const demoAddVehicle = async (payload) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const current = state.vehiclesByUser[active.id] || [];

  const nextVehicle = normalizeVehicle({
    id: `vehicle-${Date.now()}`,
    model: payload?.model,
    plateNumber: payload?.plateNumber,
    fuelType: payload?.fuelType,
    active: current.length === 0,
  });

  state.vehiclesByUser[active.id] = [nextVehicle, ...current];
  await writeDemoState(state);
  return nextVehicle;
};

const demoUpdateVehicle = async (vehicleId, payload) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const current = state.vehiclesByUser[active.id] || [];

  state.vehiclesByUser[active.id] = current.map((vehicle) =>
    String(vehicle.id || vehicle.vehicleId) === String(vehicleId)
      ? normalizeVehicle({ ...vehicle, ...(payload || {}) })
      : vehicle
  );

  await writeDemoState(state);
  return { message: 'Vehicle updated' };
};

const demoDeactivateVehicle = async (vehicleId) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const current = state.vehiclesByUser[active.id] || [];

  state.vehiclesByUser[active.id] = current.map((vehicle) =>
    String(vehicle.id || vehicle.vehicleId) === String(vehicleId)
      ? normalizeVehicle({ ...vehicle, active: false, status: 'inactive' })
      : vehicle
  );

  await writeDemoState(state);
  return { message: 'Vehicle deactivated' };
};

const demoGetStations = async () => {
  const state = await readDemoState();
  return {
    stations: (state.stations || []).map(normalizeStation),
  };
};

const demoStartSession = async (payload) => {
  const state = await readDemoState();
  const userId = payload?.userId;
  const sessionId = `session-${Date.now()}`;
  const userSessions = state.sessionsByUser[userId] || [];
  const startedAt = new Date().toISOString();

  const nextSession = normalizeSession({
    id: sessionId,
    sessionId,
    userId,
    vehicleId: payload?.vehicleId,
    stationId: payload?.stationId,
    fuelType: payload?.fuelType || 'premium',
    status: 'started',
    startedAt,
    createdAt: startedAt,
  });

  state.sessionsByUser[userId] = [nextSession, ...userSessions];
  await writeDemoState(state);
  return nextSession;
};

const demoUpdateSessionStatus = async (sessionId, status) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);
  const userId = active.id;
  const currentSessions = state.sessionsByUser[userId] || [];

  let updatedSession = null;
  state.sessionsByUser[userId] = currentSessions.map((session) => {
    if (String(session.sessionId || session.id) !== String(sessionId)) {
      return session;
    }

    updatedSession = normalizeSession({
      ...session,
      status,
      updatedAt: new Date().toISOString(),
    });
    return updatedSession;
  });

  if (status === 'completed' && updatedSession) {
    const amount = -35.25;
    const userTransactions = state.transactionsByUser[userId] || [];
    state.transactionsByUser[userId] = [
      {
        id: `tx-${Date.now()}`,
        transactionId: `tx-${Date.now()}`,
        amount,
        description: 'Fuel Session Payment',
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      ...userTransactions,
    ];

    const wallet = state.walletsByUser[userId] || { balance: 0, currency: 'USD' };
    state.walletsByUser[userId] = {
      ...wallet,
      balance: Number(wallet.balance || 0) + amount,
    };
  }

  await writeDemoState(state);
  return updatedSession;
};

const demoGetUserSessions = async (userId) => {
  const state = await readDemoState();
  return {
    sessions: (state.sessionsByUser[userId] || []).map(normalizeSession),
  };
};

const demoGetSession = async (sessionId) => {
  const state = await readDemoState();
  const all = Object.values(state.sessionsByUser || {}).flat();
  const found = all.find((session) => String(session.sessionId || session.id) === String(sessionId));
  return normalizeSession(found || {});
};

const demoUpdateUser = async (payload) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);

  state.users = state.users.map((user) =>
    user.id === active.id
      ? {
          ...user,
          fullName: payload?.fullName ?? user.fullName,
          phone: payload?.phone ?? user.phone,
          email: payload?.email ?? user.email,
        }
      : user
  );

  await writeDemoState(state);
  return { message: 'Profile updated successfully' };
};

const demoUpdatePassword = async (payload) => {
  const state = await readDemoState();
  const active = await getActiveDemoUser(state);

  state.users = state.users.map((user) => {
    if (user.id !== active.id) {
      return user;
    }

    if (payload?.oldPassword && String(user.password || '') !== String(payload.oldPassword)) {
      throw {
        message: 'Current password is incorrect.',
      };
    }

    return {
      ...user,
      password: payload?.newPassword || user.password,
    };
  });

  await writeDemoState(state);
  return { message: 'Password updated' };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeUser = (data) => {
  if (!data) {
    return null;
  }

  const source = data.user || data;
  return {
    id: source.userId || source.id || null,
    userId: source.userId || source.id || null,
    name: source.fullName || source.name || '',
    fullName: source.fullName || source.name || '',
    phone: source.phone || source.phoneNumber || '',
    email: source.email || '',
  };
};

const normalizeWallet = (data) => {
  const source = data?.wallet || data || {};
  const balance = Number(source.balance ?? source.amount ?? 0) || 0;
  return {
    ...source,
    balance,
    currency: source.currency || 'USD',
  };
};

const normalizeVehicle = (data) => {
  const source = data?.vehicle || data || {};
  return {
    ...source,
    id: source.vehicleId || source.id || null,
    vehicleId: source.vehicleId || source.id || null,
    plateNumber: source.plateNumber || source.plate || '',
    model: source.model || '',
    fuelType: source.fuelType || '',
    active: source.active ?? source.isActive ?? source.status !== 'inactive',
  };
};

const normalizeTransaction = (data) => {
  const source = data?.transaction || data || {};
  return {
    ...source,
    id: source.id || source.transactionId || null,
    transactionId: source.transactionId || source.id || null,
    amount: Number(source.amount ?? source.totalAmount ?? 0) || 0,
  };
};

const normalizeSession = (data) => {
  const source = data?.session || data || {};
  return {
    ...source,
    id: source.sessionId || source.id || null,
    sessionId: source.sessionId || source.id || null,
  };
};

const normalizeStation = (data) => {
  const source = data?.station || data || {};
  return {
    ...source,
    id: source.stationId || source.id || null,
    stationId: source.stationId || source.id || null,
  };
};

const normalizeList = (data, key, mapper) => {
  if (Array.isArray(data)) {
    return data.map(mapper);
  }

  if (Array.isArray(data?.[key])) {
    return data[key].map(mapper);
  }

  return [];
};

const clearSessionStorage = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};

const handleUnauthorized = () => {
  void clearSessionStorage();
  store.dispatch(clearFinance());
  store.dispatch(logout());
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message
      || (!error.response
        ? `Cannot reach backend at ${API_BASE_URL}. Set EXPO_PUBLIC_API_BASE_URL and restart Expo.`
        : error.message)
      || 'Something went wrong. Please try again.';

    if (status === 401) {
      handleUnauthorized();
    }

    return Promise.reject({
      message,
      status,
      data: error.response?.data,
    });
  }
);

const request = async (method, url, data, config = {}) => {
  if (!hasConfiguredBaseUrl) {
    throw {
      message: getApiConfigurationMessage(),
      status: 0,
      data: null,
    };
  }

  const response = await api.request({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
};

export const authApi = {
  login: (payload) => request('post', '/auth/login', payload),
  register: (payload) => request('post', '/auth/register', payload),
  validate: (token) => request('get', '/auth/validate', undefined, { headers: { Authorization: `Bearer ${token}` } }),
  me: () => request('get', '/auth/me'),
};

export const userApi = {
  register: (payload) => request('post', '/users/register', payload),
  login: (payload) => request('post', '/users/login', payload),
  getUser: (userId) => request('get', `/users/${encodeURIComponent(userId)}`),
  updateUser: (payload) => request('put', '/users', payload),
  updatePassword: (payload) => request('put', '/users/password', payload),
  passwordResetRequest: (payload) => request('post', '/users/password-reset/request', payload),
  passwordReset: (payload) => request('post', '/users/password-reset', payload),
};

export const walletApi = {
  createWallet: (payload) => request('post', '/wallet', payload),
  getWallet: () => request('get', '/wallet/balance'),
  updateWallet: (payload) => request('put', '/wallet', payload),
  deactivateWallet: (walletId) => request('post', `/wallet/${encodeURIComponent(walletId)}/deactivate`),
  bonusWallet: (payload) => request('post', '/wallet/bonus', payload),
};

export const vehicleApi = {
  addVehicle: (payload) => request('post', '/vehicles', payload),
  getVehicles: () => request('get', '/vehicles'),
  getVehicleById: (vehicleId) => request('get', `/vehicles/${encodeURIComponent(vehicleId)}`),
  updateVehicle: (vehicleId, payload) => request('put', `/vehicles/${encodeURIComponent(vehicleId)}`, payload),
  deactivateVehicle: (vehicleId) => request('post', `/vehicles/${encodeURIComponent(vehicleId)}/deactivate`),
};

export const stationApi = {
  getStations: () => request('get', '/stations'),
  getStationById: (stationId) => request('get', `/stations/${encodeURIComponent(stationId)}`),
  getStationsByCity: (city) => request('get', '/stations', undefined, { params: { city } }),
  getStationPrices: (stationId) => request('get', `/stations/${encodeURIComponent(stationId)}/prices`),
};

export const transactionApi = {
  createTransaction: (payload) => request('post', '/transactions', payload),
  updateTransactionStatus: (transactionId, payload) =>
    request('patch', `/transactions/${encodeURIComponent(transactionId)}/status`, payload),
  getTransactions: () => request('get', '/transactions'),
  getTransactionById: (transactionId) => request('get', `/transactions/${encodeURIComponent(transactionId)}`),
};

export const fuelSessionApi = {
  startSession: ({ userId, vehicleId, stationId, ...payload }) =>
    request('post', `/fuel-sessions/users/${encodeURIComponent(userId)}/vehicles/${encodeURIComponent(vehicleId)}/stations/${encodeURIComponent(stationId)}/start`, payload),
  stopSession: (sessionId, payload) =>
    request('post', `/fuel-sessions/${encodeURIComponent(sessionId)}/stop`, payload),
  cancelSession: (sessionId, payload) =>
    request('post', `/fuel-sessions/${encodeURIComponent(sessionId)}/cancel`, payload),
  getSession: (sessionId) => request('get', `/fuel-sessions/${encodeURIComponent(sessionId)}`),
  getUserSessions: (userId) => request('get', `/fuel-sessions/users/${encodeURIComponent(userId)}`),
};

export const passwordResetTokenApi = {
  createToken: (payload) => request('post', '/password-reset-token', payload),
  validateToken: (payload) => request('post', '/password-reset-token/validate', payload),
};

export const registerRequest = async (payload) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoRegister(payload);
  }
};

export const loginRequest = async (payload) => {
  try {
    return await authApi.login(payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoLogin(payload);
  }
};

export const getCurrentUserRequest = async () => {
  try {
    return normalizeUser(await authApi.me());
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetCurrentUser();
  }
};

export const getWalletRequest = async () => {
  try {
    return normalizeWallet(await walletApi.getWallet());
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetWallet();
  }
};

export const getBalanceRequest = getWalletRequest;

export const getTransactionsRequest = async () => {
  try {
    return {
      transactions: normalizeList(await transactionApi.getTransactions(), 'transactions', normalizeTransaction),
    };
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetTransactions();
  }
};

export const getVehiclesRequest = async () => {
  try {
    const data = await vehicleApi.getVehicles();

    return {
      vehicles: normalizeList(data, 'vehicles', normalizeVehicle),
      cars: normalizeList(data, 'vehicles', normalizeVehicle),
    };
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetVehicles();
  }
};

export const addVehicleRequest = async (payload) => {
  try {
    return await vehicleApi.addVehicle(payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoAddVehicle(payload);
  }
};

export const updateVehicleRequest = async (vehicleId, payload) => {
  try {
    return await vehicleApi.updateVehicle(vehicleId, payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoUpdateVehicle(vehicleId, payload);
  }
};

export const deactivateVehicleRequest = async (vehicleId) => {
  try {
    return await vehicleApi.deactivateVehicle(vehicleId);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoDeactivateVehicle(vehicleId);
  }
};

export const startFuelSessionRequest = async (payload) => {
  try {
    return await fuelSessionApi.startSession(payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoStartSession(payload);
  }
};

export const stopFuelSessionRequest = async (sessionId, payload) => {
  try {
    return await fuelSessionApi.stopSession(sessionId, payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoUpdateSessionStatus(sessionId, 'completed');
  }
};

export const cancelFuelSessionRequest = async (sessionId, payload) => {
  try {
    return await fuelSessionApi.cancelSession(sessionId, payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoUpdateSessionStatus(sessionId, 'cancelled');
  }
};

export const getFuelSessionRequest = async (sessionId) => {
  try {
    return normalizeSession(await fuelSessionApi.getSession(sessionId));
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetSession(sessionId);
  }
};

export const getUserFuelSessionsRequest = async (userId) => {
  try {
    return {
      sessions: normalizeList(await fuelSessionApi.getUserSessions(userId), 'sessions', normalizeSession),
    };
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetUserSessions(userId);
  }
};

export const updateUserRequest = async (payload) => {
  try {
    return await request('put', '/users', payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoUpdateUser(payload);
  }
};

export const updatePasswordRequest = async (payload) => {
  try {
    return await request('put', '/users/password', payload);
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoUpdatePassword(payload);
  }
};

export const passwordResetRequest = async (payload) => userApi.passwordResetRequest(payload);

export const passwordResetRequestByToken = async (payload) => passwordResetTokenApi.createToken(payload);

export const validatePasswordResetTokenRequest = async (payload) => passwordResetTokenApi.validateToken(payload);

export const getStationsRequest = async () => {
  try {
    return {
      stations: normalizeList(await stationApi.getStations(), 'stations', normalizeStation),
    };
  } catch (error) {
    if (!shouldUseDemoFallback(error)) {
      throw error;
    }

    return demoGetStations();
  }
};

export const getStationByIdRequest = async (stationId) => normalizeStation(await stationApi.getStationById(stationId));

export const getStationsByCityRequest = async (city) => ({
  stations: normalizeList(await stationApi.getStationsByCity(city), 'stations', normalizeStation),
});

export const getStationPricesRequest = async (stationId) => request('get', `/stations/${encodeURIComponent(stationId)}/prices`);

export const getTransactionByIdRequest = async (transactionId) => normalizeTransaction(await transactionApi.getTransactionById(transactionId));

export const updateTransactionStatusRequest = async (transactionId, payload) =>
  transactionApi.updateTransactionStatus(transactionId, payload);

export const createTransactionRequest = async (payload) => transactionApi.createTransaction(payload);

export const authLogout = async () => {
  await clearSessionStorage();
  store.dispatch(clearFinance());
  store.dispatch(logout());
};

export { normalizeUser, normalizeWallet, normalizeVehicle, normalizeTransaction, normalizeSession, normalizeStation };

export default api;
