import { useAuth } from '../features/auth/useAuth';
import AuthNavbar from '../features/ui/AuthNavbar';
import Navbar from '../features/ui/Navbar';
import { Outlet } from 'react-router-dom';
import Toast from '../features/ui/Toast';

const Root = () => {
  const { isAuth, isLoading } = useAuth();

  return (
    <>
      <Toast />
      {!isLoading && (isAuth ? <AuthNavbar /> : <Navbar />)}
      <Outlet />
    </>
  );
};

export default Root;
