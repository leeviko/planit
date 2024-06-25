import { createSlice } from '@reduxjs/toolkit';

export type Board = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  favorited: boolean;
  created_at: Date;
  updated_at: Date;
  lists: any[];
};

export type BoardState = {
  boards: Board[];
  selectedBoard: Board | null;
};

const initialState: BoardState = {
  boards: [],
  selectedBoard: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {},
});

export default boardsSlice.reducer;
