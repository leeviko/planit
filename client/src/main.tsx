import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './app/store.ts';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.css';
import Root from './components/Root.tsx';
import Home from './pages/Home.tsx';
import LoginPage from './features/auth/LoginPage.tsx';
import RegisterPage from './features/auth/RegisterPage.tsx';
import BoardsPage from './features/boards/BoardsPage.tsx';
import BoardPage from './features/boards/BoardPage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import Account from './features/me/Account.tsx';
import PageTitle from './components/PageTitle.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: (
          <>
            <PageTitle title="Planit" />
            <Home />
          </>
        ),
      },
      {
        path: '/boards',
        element: (
          <>
            <PageTitle title="Planit - Boards" />
            <BoardsPage />
          </>
        ),
      },
      {
        path: '/boards/:id',
        element: (
          <>
            <PageTitle title="Planit - Board" />
            <BoardPage />
          </>
        ),
      },
      {
        path: '/me/account',
        element: (
          <>
            <PageTitle title="Planit - Manage account" />
            <Account />
          </>
        ),
      },
    ],
    errorElement: (
      <>
        <PageTitle title="Planit - Error" />
        <ErrorPage />
      </>
    ),
  },
  {
    path: '/login',
    element: (
      <>
        <PageTitle title="Planit - Login" />
        <LoginPage />
      </>
    ),
  },
  {
    path: '/register',
    element: (
      <>
        <PageTitle title="Planit - Register" />
        <RegisterPage />
      </>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
