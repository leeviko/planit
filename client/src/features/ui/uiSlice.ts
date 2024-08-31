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
      value: string | boolean;
      placeholder?: string;
      required?: { min: number; max: number };
    }[];
  };
  dialog: {
    title: string;
    description: string;
    yes: string;
    no: string;
    id: string;
    initiator: string;
  };
  showToast: boolean;
  showSettings: boolean;
  showBoardDropdown: boolean;
  cardEditing: string | null;
  boardEditing: boolean;
  showFormModal: boolean;
  formModalSubmitted: boolean;
  showDialog: boolean;
  dialogConfirmed: boolean;
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
  dialog: {
    title: '',
    description: '',
    yes: 'Yes',
    no: 'Cancel',
    id: '',
    initiator: '',
  },
  showToast: false,
  showSettings: false,
  showBoardDropdown: false,
  cardEditing: null,
  boardEditing: false,
  showFormModal: false,
  formModalSubmitted: false,
  showDialog: false,
  dialogConfirmed: false,
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
    toggleBoardDropdown(state) {
      state.showBoardDropdown = !state.showBoardDropdown;
    },
    setCardEditing(state, action) {
      state.cardEditing = action.payload;
    },

    setBoardEditing(state, action) {
      state.boardEditing = action.payload;
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

    showDialog(state, action: { payload: UIState['dialog'] }) {
      state.showDialog = true;
      state.dialogConfirmed = false;
      state.dialog = action.payload;
    },
    closeDialog(state) {
      state.showDialog = false;
      state.dialogConfirmed = false;
      state.dialog = initialState.dialog;
    },
    confirmDialog(state) {
      state.dialogConfirmed = true;
      state.showDialog = false;
    },
  },
});

export const {
  showToast,
  hideToast,

  toggleSettings,
  toggleBoardDropdown,

  setBoardEditing,
  setCardEditing,

  showFormModal,
  hideFormModal,
  submitFormModal,
  formModalError,
  setFormModalLoading,

  showDialog,
  closeDialog,
  confirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
