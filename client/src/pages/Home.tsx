import { Link } from 'react-router-dom';
import '../styles/Home.css';
import noAuthRoute from '../features/auth/NoAuthRoute';
import Pattern from '../assets/pattern.svg';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-header">
        <img src={Pattern} alt="" className="home-header-pattern" />
        <div className="home-header-container">
          <div className="text">
            <h1>
              Organize, prioritize, and achieve more with our project management
              tool
            </h1>
            <p>Register now, it's free!</p>
          </div>
          <Link to={'/register'} className="btn-lg">
            Register
          </Link>
          <Link to={'/login'} className="btn-lg-line">
            Login
          </Link>
        </div>
      </div>
      <div className="home-footer">
        <div className="home-footer-cards">
          <div className="home-footer-card">
            <h3>Intuitive Drag-and-Drop Interface</h3>
            <p>
              Our platform offers an intuitive drag-and-drop interface, making
              task management simple and efficient.
            </p>
          </div>
          <div className="home-footer-card">
            <h3>Customizable Boards and Cards</h3>
            <p>
              Tailor your workflow to fit your unique needs with our
              customizable boards and cards.
            </p>
          </div>
          <div className="home-footer-card">
            <h3>Secure Data Management</h3>
            <p>
              Your data's security is our top priority. Our platform uses
              advanced security measures to ensure that your information is
              always protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WrappedHomePage = noAuthRoute(HomePage, '/boards');
export default WrappedHomePage;
