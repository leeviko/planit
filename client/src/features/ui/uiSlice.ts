import { createSlice } from '@reduxjs/toolkit';

export type UIState = {
  toast: {
    msg: string;
    type: 'success' | 'warning' | 'error' | null;
  };
  formModal: {
    title: string;
    buttonText: string;
    error: string;
    isLoading: boolean;
    inputs: {
      name: string;
      type: string;
      value: string;
      placeholder?: string;
      required?: { min: number; max: number };
    }[];
  };
  showToast: boolean;
  showSettings: boolean;
  showFormModal: boolean;
  formModalSubmitted: boolean;
};

const initialState: UIState = {
  toast: {
    msg: '',
    type: null,
  },
  formModal: {
    title: '',
    buttonText: '',
    error: '',
    isLoading: false,
    inputs: [],
  },
  showToast: false,
  showSettings: false,
  showFormModal: false,
  formModalSubmitted: false,
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

    showFormModal(state, action) {
      state.formModal = action.payload;
      state.showFormModal = true;
    },
    hideFormModal(state) {
      state.formModal = initialState.formModal;
      state.showFormModal = false;
      state.formModalSubmitted = false;
    },
    submitFormModal(state, action) {
      action.payload.forEach((input: string, index: number) => {
        state.formModal.inputs[index].value = input;
      });

      state.formModalSubmitted = true;
    },

    formModalError(state, action) {
      state.formModal.error = action.payload;
      state.formModal.isLoading = false;
      state.formModalSubmitted = false;
    },
    setFormModalLoading(state, action) {
      state.formModal.isLoading = action.payload;
    },
  },
});

export const {
  showToast,
  hideToast,
  toggleSettings,
  showFormModal,
  hideFormModal,
  submitFormModal,
  formModalError,
  setFormModalLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
