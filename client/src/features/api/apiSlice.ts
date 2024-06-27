import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Board } from '../boards/boardsSlice';
import { User } from '../auth/authSlice';

type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

type LoginRequest = {
  username: string;
  password: string;
};

type BoardUpdate = {
  id: string;
  title?: string;
  favorited?: boolean;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ['User', 'Board'],
  endpoints: (builder) => ({
    register: builder.mutation<User, RegisterRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        credentials: 'include',
        body,
      }),
    }),
    login: builder.mutation<User, LoginRequest>({
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
    updateBoard: builder.mutation<Board, BoardUpdate>({
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
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useValidateSessionQuery,

  useGetBoardsQuery,
  useGetBoardQuery,
  useUpdateBoardMutation,
} = apiSlice;
