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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/boards', element: <BoardsPage /> },
      { path: '/boards/:id', element: <BoardPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
