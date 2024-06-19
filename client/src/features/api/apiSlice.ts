import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type UserRequest = {
  email: string;
  username: string;
  password: string;
};

type LoginRequest = {
  username: string;
  password: string;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body: UserRequest) => ({
        url: '/users',
        method: 'POST',
        credentials: 'include',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body: LoginRequest) => ({
        url: '/auth',
        method: 'POST',
        body,
      }),
    }),
    isAuth: builder.query({
      query: () => ({
        url: '/auth',
        credentials: 'include',
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLazyIsAuthQuery } =
  apiSlice;
