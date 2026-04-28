import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import financeReducer from './financeSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    finance: financeReducer,
  },
});

export default store;
