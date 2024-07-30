import './Navbar.css';
import './AuthNavbar.css';
import Logo from '../../assets/logo.svg';
import { useDispatch } from 'react-redux';
import { toggleSettings } from './uiSlice';
import SettingsSVG from '../../assets/settings.svg';
import Settings from './Settings';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  const dispatch = useDispatch();

  return (
    <>
      <nav className="nav-auth">
        <div className="nav-content-wrapper">
          <div className="nav-content">
            <Link to="/boards">
              <img className="logo" src={Logo} alt="" />
            </Link>
            <button
              className="settings-btn"
              onClick={() => dispatch(toggleSettings())}
            >
              <img
                className="settings-img"
                src={SettingsSVG}
                alt="Settings"
                draggable="false"
              />
            </button>
          </div>
        </div>
      </nav>

      <Settings />
    </>
  );
};

export default AuthNavbar;
