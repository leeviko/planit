import { Link, useRouteError } from 'react-router-dom';
import NotFound from '../assets/not_found.svg';

const ErrorPage = () => {
  const error: any = useRouteError();
  console.log(error);
  return (
    <div className="error-page">
      <div className="error-page-container">
        {error?.status === 404 && (
          <div className="img-container">
            <img src={NotFound} alt="404" />
          </div>
        )}
        <h1>
          {error?.status === 404
            ? 'Page not found'
            : 'An unexpected error has occurred.'}
        </h1>

        <Link to="/">Go to front page</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
