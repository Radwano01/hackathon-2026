import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      state.isAuthenticated = Boolean(token);
    },
    hydrateSession: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      state.isAuthenticated = Boolean(token);
      state.isHydrated = true;
    },
    markHydrated: (state) => {
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { setCredentials, hydrateSession, markHydrated, logout } = userSlice.actions;
export default userSlice.reducer;
