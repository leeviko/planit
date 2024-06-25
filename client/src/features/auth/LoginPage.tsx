import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import Logo from '../../assets/logo.svg';
import { FormEvent, useState } from 'react';
import { useLoginMutation } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setUser } from './authSlice';
import useForm from '../../hooks/useForm';
import noAuthRoute from './NoAuthRoute';
import { showToast } from '../ui/uiSlice';
import Toast from '../ui/Toast';
const LoginPage = () => {
  const [values, handleChange] = useForm({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  // const { isAuth, isLoading: isAuthLoading } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { username, password } = values;
    const newErrors = { username: '', password: '' };
    setErrors(newErrors);

    if (username.length < 3) {
      newErrors.username = 'Username have to be at least 3 characters long';
    }
    if (password.length < 4) {
      newErrors.password = 'Password have to be at least 4 characters long';
    }
    setErrors(newErrors);

    if (isLoading || newErrors.username || newErrors.password) return;

    try {
      const result = await login({ username, password }).unwrap();

      dispatch(setUser(result));
      dispatch(showToast({ msg: 'Successfully logged in', type: 'success' }));

      navigate('/');
    } catch (err: any) {
      if (!err.data) {
        setError('Failed to login. Please try again later.');
        return;
      }

      switch (err.data.status) {
        case 422:
          setError(err.data.errors[0].msg);
          break;
        default:
          setError(err.data.msg);
          break;
      }
    }
  };

  return (
    <>
      <Toast />
      <div className="login-page">
        <div className="box">
          <Link to={'/'}>
            <img className="logo" src={Logo} draggable="false" />
          </Link>
          <h2>Login to continue</h2>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              value={values.username}
              name="username"
              className={errors.username ? 'invalid' : ''}
              onChange={handleChange}
            />
            <label>Password</label>
            <input
              type="password"
              value={values.password}
              name="password"
              className={errors.password ? 'invalid' : ''}
              onChange={handleChange}
            />
            <button className="btn" type="submit">
              Login
            </button>
            {error && <p className="errors">{error}</p>}
          </form>
          <div className="box-footer">
            <p>
              New to Planit? <Link to={'/register'}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const WrappedLoginPage = noAuthRoute(LoginPage);
export default WrappedLoginPage;
