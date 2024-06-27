import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export type Board = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  favorited: boolean;
  created_at: Date;
  updated_at: Date;
  lists: List[];
};

export type Card = {
  id: string;
  list_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
};

export type List = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  cards: Card[];
};

export type DraggedList = {
  id: string;
  title: string;
  position: number;
  cards: Card[];
};

export type DraggedCard = {
  id: string;
  list_id: string;
  title: string;
  position: number;
};

export type BoardState = {
  boards: Board[];
  activeBoard: Board | null;
};

const initialState: BoardState = {
  boards: [],
  activeBoard: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoard(state, action) {
      state.activeBoard = action.payload;
    },
    setList(state, action) {
      if (!state.activeBoard) return state;

      state.activeBoard.lists = action.payload;
    },
  },
});

export const selectActiveBoard = (state: RootState) => state.boards.activeBoard;

export const selectActiveBoardLists = createSelector(
  [selectActiveBoard],
  (board) => {
    return board?.lists || [];
  }
);

export const selectActiveBoardListIds = createSelector(
  [selectActiveBoardLists],
  (lists) => {
    return lists.map((list) => list.id);
  }
);

export const { setBoard, setList } = boardsSlice.actions;
export default boardsSlice.reducer;
