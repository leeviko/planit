import { Link, Navigate } from 'react-router-dom';
import '../styles/Home.css';
import Pattern from '../assets/pattern.svg';
import { useAuth } from '../features/auth/useAuth';
import LandingPic from '../assets/landing_pic.png';
import { useRef } from 'react';

const HomePage = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  if (auth.isAuth) return <Navigate to={'/boards'} replace />;

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-container">
      <div className="home-page">
        <div className="home-header">
          <img src={Pattern} alt="" className="home-header-pattern-right" />
          <img src={Pattern} alt="" className="home-header-pattern-left" />
          <div className="home-header-container">
            <div className="text">
              <h1>
                Organize, prioritize, and achieve more with our project
                management tool
              </h1>
            </div>
            <div className="header-actions">
              <Link to={'/register'} className="btn-lg">
                Register
              </Link>
              <Link to={'/login'} className="btn-lg">
                Login
              </Link>
            </div>
          </div>
        </div>
        <div className="home-content-container">
          <div className="home-content">
            <img
              src={LandingPic}
              className="landing-pic"
              onClick={scrollToFeatures}
            />
            <h2>Features</h2>
            <div className="feature-cards" ref={featuresRef}>
              <div className="feature-card">
                <h3>Intuitive Drag-and-Drop Interface</h3>
                <p>
                  Our platform offers an intuitive drag-and-drop interface,
                  making task management simple and efficient.
                </p>
              </div>
              <div className="feature-card">
                <h3>Customizable Boards and Cards</h3>
                <p>
                  Tailor your workflow to fit your unique needs with our
                  customizable boards and cards.
                </p>
              </div>
            </div>
            <Link className="btn-lg make-board-btn" to={'/boards'}>
              Go make your first board!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
