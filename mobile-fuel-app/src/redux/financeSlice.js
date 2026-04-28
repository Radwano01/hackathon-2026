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
    setCars: (state, action) => {
      state.cars = Array.isArray(action.payload) ? action.payload : [];
    },
    clearFinance: (state) => {
      state.balance = 0;
      state.transactions = [];
      state.cards = [];
      state.cars = [];
    },
  },
});

export const { setBalance, setTransactions, setCards, setCars, clearFinance } = financeSlice.actions;
export default financeSlice.reducer;
