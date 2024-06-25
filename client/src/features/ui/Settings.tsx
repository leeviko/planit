import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../api/apiSlice';
import { logoutUser } from '../auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { showToast, toggleSettings } from './uiSlice';
import { RootState } from '../../app/store';

import './Settings.css';

const Settings = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const showSettings = useSelector((state: RootState) => state.ui.showSettings);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(undefined);
      dispatch(logoutUser());

      dispatch(showToast({ msg: 'Logged out', type: 'success' }));
      dispatch(toggleSettings());
      return navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={`settings-dropdown ${showSettings ? 'show' : 'hide'}`}>
      <div className="settings-section">
        <p className="settings-section-title">Account</p>
        <div className="settings-account">
          <p className="username">{user?.username}</p>
          <p className="email">{user?.email}</p>
        </div>
        <Link className="settings-link" to="#">
          Manage account
        </Link>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Planit</p>
        <Link className="settings-link" to="#">
          Activity
        </Link>
        <Link className="settings-link" to="#">
          Theme
        </Link>
      </div>

      <div className="settings-section">
        <button className="settings-link logout-link" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};

export default Settings;
