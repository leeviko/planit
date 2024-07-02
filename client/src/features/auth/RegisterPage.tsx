import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import Logo from '../../assets/logo.svg';
import { FormEvent, useState } from 'react';
import { checkEmail } from '../../utils';
import { useRegisterMutation } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setUser } from './authSlice';
import useForm from '../../hooks/useForm';
import noAuthRoute from './NoAuthRoute';
import { ValidationErrors } from '../api/apiSlice';

const RegisterPage = () => {
  const [values, handleChange] = useForm({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = { email: '', username: '', password: '' };
    setErrors(newErrors);
    setError('');

    const { email, username, password } = values;

    if (!checkEmail(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (username.length < 3) {
      newErrors.username = 'Username have to be at least 3 characters long';
    }
    if (password.length < 4) {
      newErrors.password = 'Password have to be at least 4 characters long';
    }

    setErrors(newErrors);

    if (
      isLoading ||
      newErrors.email ||
      newErrors.username ||
      newErrors.password
    )
      return;

    try {
      const result = await register({ email, username, password }).unwrap();

      dispatch(setUser(result));

      navigate('/');
    } catch (err: any) {
      if (!err.data) {
        setError('Failed to register. Please try again later.');
        return;
      }

      switch (err.status) {
        case 422: {
          const errors: ValidationErrors<typeof values> = err.data;
          const newErrors = {
            email: errors.email?.msg || '',
            username: errors.username?.msg || '',
            password: errors.password?.msg || '',
          };
          setErrors(newErrors);
          break;
        }
        default:
          setError(err.data.msg);
          break;
      }
    }
  };

  return (
    <div className="register-page">
      <div className="box">
        <Link to={'/'} draggable="false">
          <img className="logo" src={Logo} draggable="false" />
        </Link>
        <h2>Continue by registering</h2>
        <form onSubmit={handleRegister}>
          <label>Email</label>
          <input
            type="text"
            value={values.email}
            name="email"
            onChange={handleChange}
            className={errors.email ? 'invalid' : ''}
            placeholder="example@ex.com"
          />
          <label>Username</label>
          <input
            type="text"
            value={values.username}
            name="username"
            onChange={handleChange}
            className={errors.username ? 'invalid' : ''}
          />
          <label>Password</label>
          <input
            type="password"
            value={values.password}
            name="password"
            onChange={handleChange}
            className={errors.password ? 'invalid' : ''}
          />
          <button className="btn" type="submit">
            Register
          </button>
          {error && <p className="errors">{error}</p>}
          {errors.email && <p className="errors">{errors.email}</p>}
          {errors.username && <p className="errors">{errors.username}</p>}
          {errors.password && <p className="errors">{errors.password}</p>}
        </form>
        <div className="box-footer">
          <p>
            Already have an account? <Link to={'/login'}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const WrappedRegisterPage = noAuthRoute(RegisterPage);
export default WrappedRegisterPage;
