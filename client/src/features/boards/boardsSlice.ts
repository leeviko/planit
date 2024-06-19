import { createSlice } from '@reduxjs/toolkit';

type TBoard = {
  id: string;
  name: string;
  slug: string;
};

export type TBoardState = {
  boards: TBoard[];
  selectedBoard: TBoard | null;
};

const initialState: TBoardState = {
  boards: [],
  selectedBoard: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {},
});

export default boardsSlice.reducer;
