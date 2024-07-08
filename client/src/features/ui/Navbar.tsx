import Logo from '../../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="nav">
      <div className="nav-noauth nav-content">
        <img className="logo" src={Logo} alt="" />
        <button className="btn">Go to boards</button>
      </div>
    </nav>
  );
};

export default Navbar;
