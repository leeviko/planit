import { createSlice } from '@reduxjs/toolkit';

export type TUser = {
  name: string;
  id: string;
  email: string;
  admin: boolean;
  created_at: Date;
};

export type AuthState = {
  isAuth: boolean;
  status: 'idle' | 'loading' | 'failed' | 'success';
  user: TUser | null;
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
    setUser(state, action: { payload: TUser }) {
      state.isAuth = true;
      state.status = 'success';
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
