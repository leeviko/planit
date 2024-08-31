import { useDispatch, useSelector } from 'react-redux';
import { useValidateSessionQuery } from '../api/apiSlice';
import { RootState } from '../../app/store';
import { authFailed, setUser } from './authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const { data, error, isLoading } = useValidateSessionQuery(undefined, {
    skip: isAuth,
  });

  useEffect(() => {
    if (isAuth) return;
    if (data) {
      dispatch(setUser(data));
    } else {
      dispatch(authFailed());
    }
  }, [data, error, dispatch, isAuth]);

  return { isAuth: isAuth || !!data, isLoading, error };
};
