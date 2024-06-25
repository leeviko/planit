import './Navbar.css';
import './AuthNavbar.css';
import Logo from '../../assets/logo.svg';
import { useDispatch } from 'react-redux';
import { toggleSettings } from './uiSlice';
import SettingsSVG from '../../assets/settings.svg';
import Settings from './Settings';

const AuthNavbar = () => {
  const dispatch = useDispatch();

  return (
    <>
      <nav>
        <div className="nav-auth nav-content">
          <img className="logo" src={Logo} alt="" />
          <button
            className="settings-btn"
            onClick={() => dispatch(toggleSettings())}
          >
            <img src={SettingsSVG} alt="" draggable="false" />
          </button>
        </div>
      </nav>

      <Settings />
    </>
  );
};

export default AuthNavbar;
