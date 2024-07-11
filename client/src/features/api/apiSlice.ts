import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Board, Card, List } from '../boards/boardsSlice';
import { User } from '../auth/authSlice';

export type ValidationErrors<T> = Record<keyof T, { msg: string }>;

type Register = {
  email: string;
  username: string;
  password: string;
};

type Login = {
  username: string;
  password: string;
};

type BoardUpdate = {
  id: string;
  title?: string;
  favorited?: boolean;
};

type NewBoard = {
  name: string;
};

type ListUpdate = {
  boardId: string;
  listId: string;
  title?: string;
  pos?: number;
};

type ListDelete = {
  boardId: string;
  listId: string;
};

type NewCard = {
  boardId: string;
  listId: string;
  title: string;
};

type CardUpdate = {
  cardId: string;
  boardId: string;
  title?: string;
  listId?: string;
  pos?: number;
};

type BoardResult = {
  ok: boolean;
  data: Board;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ['User', 'Board'],
  endpoints: (builder) => ({
    register: builder.mutation<User, Register>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        credentials: 'include',
        body,
      }),
    }),
    login: builder.mutation<User, Login>({
      query: (body) => ({
        url: '/auth',
        method: 'POST',
        credentials: 'include',
        body,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        credentials: 'include',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    validateSession: builder.query<User, undefined>({
      query: () => ({
        url: '/auth',
        credentials: 'include',
      }),
      providesTags: ['User'],
    }),

    // Boards
    getBoards: builder.query<Board[], undefined>({
      query: () => ({
        url: '/boards',
        credentials: 'include',
      }),
      providesTags: ['Board'],
    }),
    getBoard: builder.query<Board, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        credentials: 'include',
      }),
      providesTags: (result) =>
        result ? [{ type: 'Board', id: result.id }] : [],
    }),
    createBoard: builder.mutation<Board, NewBoard>({
      query: ({ name }) => ({
        url: '/boards',
        method: 'POST',
        credentials: 'include',
        body: {
          title: name,
        },
      }),
      invalidatesTags: ['Board'],
    }),
    updateBoard: builder.mutation<BoardResult, BoardUpdate>({
      query: ({ id, favorited, title }) => ({
        url: `/boards/${id}`,
        method: 'PUT',
        credentials: 'include',
        body: {
          title,
          favorited,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Board',
        { type: 'Board', id },
      ],
    }),
    deleteBoard: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Board',
        { type: 'Board', id },
      ],
    }),

    createList: builder.mutation<List, { boardId: string; title: string }>({
      query: ({ boardId, title }) => ({
        url: `/lists`,
        method: 'POST',
        credentials: 'include',
        body: {
          boardId,
          title,
        },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
    updateList: builder.mutation<{ ok: boolean }, ListUpdate>({
      query: ({ boardId, listId, title, pos }) => ({
        url: `/lists/${listId}`,
        method: 'PUT',
        credentials: 'include',
        body: {
          boardId,
          title,
          pos,
        },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
    deleteList: builder.mutation<{ ok: boolean }, ListDelete>({
      query: ({ listId }) => ({
        url: `/lists/${listId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),

    createCard: builder.mutation<Card, NewCard>({
      query: ({ boardId, listId, title }) => ({
        url: `/cards`,
        method: 'POST',
        credentials: 'include',
        body: {
          boardId,
          listId,
          title,
        },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
    updateCard: builder.mutation<Card, CardUpdate>({
      query: ({ cardId, title, listId, pos }) => ({
        url: `/cards/${cardId}`,
        method: 'PUT',
        credentials: 'include',
        body: {
          title,
          listId,
          pos,
        },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
    deleteCard: builder.mutation<
      { ok: boolean },
      { cardId: string; boardId: string }
    >({
      query: ({ cardId }) => ({
        url: `/cards/${cardId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useValidateSessionQuery,

  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,

  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,

  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} = apiSlice;
