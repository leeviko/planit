import { useDispatch, useSelector } from 'react-redux';
import { useLazyIsAuthQuery } from '../api/apiSlice';
import { RootState } from '../../app/store';
import { setUser } from './authSlice';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [trigger, result] = useLazyIsAuthQuery();
  const isAuthState = useSelector((state: RootState) => state.auth.isAuth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthState) return setIsAuthenticated(true);
    const checkIsAuth = async () => {
      if (result.isError) return setIsAuthenticated(false);

      if (!result.isLoading) {
        try {
          const res = await trigger(undefined).unwrap();

          dispatch(setUser(res));
          return setIsAuthenticated(true);
        } catch (err) {
          return setIsAuthenticated(false);
        }
      }

      setIsAuthenticated(false);
    };

    checkIsAuth();
  }, []);

  return isAuthenticated;
};
