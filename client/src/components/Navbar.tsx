import Logo from '../assets/logo.svg';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav>
      <div className="nav-content">
        <img src={Logo} alt="" />
        <button className="btn">Go to boards</button>
      </div>
    </nav>
  );
};

export default Navbar;
