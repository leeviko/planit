import { useAuth } from '../features/auth/useAuth';
import AuthNavbar from '../features/ui/AuthNavbar';
import Navbar from '../features/ui/Navbar';
import { Outlet } from 'react-router-dom';
import Toast from '../features/ui/Toast';
import FormModal from '../features/ui/FormModal';
import Dialog from '../features/ui/Dialog';

const Root = () => {
  const { isAuth } = useAuth();

  return (
    <>
      <Dialog />
      <Toast />
      <FormModal />
      {isAuth ? <AuthNavbar /> : <Navbar />}
      <Outlet />
    </>
  );
};

export default Root;
