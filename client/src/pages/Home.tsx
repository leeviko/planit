import { Link } from 'react-router-dom';
import '../styles/Home.css';
import noAuthRoute from '../features/auth/NoAuthRoute';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-content">
        <div className="text">
          <h1>
            Organize, prioritize, and achieve more with our project management
            tool
          </h1>
          <p>Register now, it's free!</p>
        </div>
        <Link to={'/register'} className="btn">
          Register
        </Link>
        <Link to={'/login'} className="btn-line">
          Login
        </Link>
      </div>
    </div>
  );
};

const WrappedHomePage = noAuthRoute(HomePage, '/boards');
export default WrappedHomePage;
