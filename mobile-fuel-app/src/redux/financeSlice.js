import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  transactions: [],
  cards: [],
  cars: [],
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload ?? 0;
    },
    setTransactions: (state, action) => {
      state.transactions = Array.isArray(action.payload) ? action.payload : [];
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
      state.cars = Array.isArray(action.payload) ? action.payload : [];
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
      state.balance = 0;
      state.transactions = [];
      state.cards = [];
      state.cars = [];
    },
  },
});

export const {
  setBalance,
  setTransactions,
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
  clearFinance,
} = financeSlice.actions;
export default financeSlice.reducer;
