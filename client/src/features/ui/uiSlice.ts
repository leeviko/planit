import { createSlice } from '@reduxjs/toolkit';

export type UIState = {
  toast: {
    msg: string;
    type: 'success' | 'warning' | 'error' | null;
  };
  showToast: boolean;
  showSettings: boolean;
};

const initialState: UIState = {
  toast: {
    msg: '',
    type: null,
  },
  showToast: false,
  showSettings: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action) {
      state.toast = action.payload;
      state.showToast = true;
    },
    hideToast(state) {
      state.showToast = false;
      state.toast = initialState.toast;
    },

    toggleSettings(state) {
      state.showSettings = !state.showSettings;
    },
  },
});

export const { showToast, hideToast, toggleSettings } = uiSlice.actions;
export default uiSlice.reducer;
