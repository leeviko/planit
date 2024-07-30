import Logo from '../../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="nav-no-auth">
      <div className="nav-content-wrapper">
        <div className="nav-content">
          <img className="logo" src={Logo} alt="" />
          <button className="btn">Go to boards</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
