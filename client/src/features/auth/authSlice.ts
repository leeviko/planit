import { createSlice } from '@reduxjs/toolkit';

export type User = {
  username: string;
  id: string;
  email: string;
  admin: boolean;
  created_at: Date;
};

export type AuthState = {
  isAuth: boolean;
  status: 'idle' | 'loading' | 'failed' | 'success';
  user: User | null;
};

const initialState: AuthState = {
  isAuth: false,
  status: 'idle',
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: { payload: User }) {
      state.isAuth = true;
      state.status = 'success';
      state.user = action.payload;
    },
    logoutUser(state) {
      state.isAuth = false;
      state.status = 'idle';
      state.user = null;
    },
    authFailed(state) {
      state.isAuth = false;
      state.status = 'failed';
      state.user = null;
    },
  },
});

export const { setUser, logoutUser, authFailed } = authSlice.actions;

export default authSlice.reducer;
