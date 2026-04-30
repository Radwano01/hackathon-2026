import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wallet: {
    balance: 0,
    currency: 'USD',
  },
  balance: 0,
  transactions: [],
  vehicles: [],
  cards: [],
  cars: [],
  sessions: [],
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setWallet: (state, action) => {
      const wallet = action.payload && typeof action.payload === 'object' ? action.payload : {};
      const balance = Number(wallet.balance ?? wallet.amount ?? 0) || 0;

      state.wallet = {
        ...state.wallet,
        ...wallet,
        balance,
        currency: wallet.currency || state.wallet.currency || 'USD',
      };
      state.balance = balance;
    },
    setBalance: (state, action) => {
      const balance = Number(action.payload ?? 0) || 0;
      state.balance = balance;
      state.wallet = {
        ...(state.wallet || {}),
        balance,
        currency: state.wallet?.currency || 'USD',
      };
    },
    setTransactions: (state, action) => {
      state.transactions = Array.isArray(action.payload) ? action.payload : [];
    },
    setVehicles: (state, action) => {
      const vehicles = Array.isArray(action.payload) ? action.payload : [];
      state.vehicles = vehicles;
      state.cars = vehicles;
    },
    setCards: (state, action) => {
      state.cards = Array.isArray(action.payload) ? action.payload : [];
    },
    addCard: (state, action) => {
      state.cards.unshift(action.payload);
    },
    updateCard: (state, action) => {
      const index = state.cards.findIndex((card) => card.id === action.payload?.id);
      if (index >= 0) {
        state.cards[index] = {
          ...state.cards[index],
          ...action.payload,
        };
      }
    },
    removeCard: (state, action) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },
    toggleCardActive: (state, action) => {
      const index = state.cards.findIndex((card) => card.id === action.payload);
      if (index >= 0) {
        state.cards[index].active = !state.cards[index].active;
      }
    },
    setCars: (state, action) => {
      const vehicles = Array.isArray(action.payload) ? action.payload : [];
      state.cars = vehicles;
      state.vehicles = vehicles;
    },
    setSessions: (state, action) => {
      state.sessions = Array.isArray(action.payload) ? action.payload : [];
    },
    addCar: (state, action) => {
      state.cars.unshift(action.payload);
    },
    updateCar: (state, action) => {
      const index = state.cars.findIndex((car) => car.id === action.payload?.id);
      if (index >= 0) {
        state.cars[index] = {
          ...state.cars[index],
          ...action.payload,
        };
      }
    },
    removeCar: (state, action) => {
      state.cars = state.cars.filter((car) => car.id !== action.payload);
    },
    toggleCarActive: (state, action) => {
      const index = state.cars.findIndex((car) => car.id === action.payload);
      if (index >= 0) {
        state.cars[index].active = !state.cars[index].active;
      }
    },
    clearFinance: (state) => {
      state.wallet = {
        balance: 0,
        currency: 'USD',
      };
      state.balance = 0;
      state.transactions = [];
      state.vehicles = [];
      state.cards = [];
      state.cars = [];
      state.sessions = [];
    },
  },
});

export const {
  setWallet,
  setBalance,
  setTransactions,
  setVehicles,
  setCards,
  addCard,
  updateCard,
  removeCard,
  toggleCardActive,
  setCars,
  addCar,
  updateCar,
  removeCar,
  toggleCarActive,
  setSessions,
  clearFinance,
} = financeSlice.actions;
export default financeSlice.reducer;
