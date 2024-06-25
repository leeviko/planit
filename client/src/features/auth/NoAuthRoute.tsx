import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

type Props = { children: JSX.Element; redirect?: string };

// eslint-disable-next-line react-refresh/only-export-components
const NoAuthRoute = ({ children, redirect = '/' }: Props) => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) return <></>;

  if (isAuth) return <Navigate to={redirect} replace />;

  return children;
};

const noAuthRoute = (Component: React.FC, redirect: string = '/') => {
  const WrappedComponent = (props: any) => {
    return (
      <NoAuthRoute redirect={redirect}>
        <Component {...props} />
      </NoAuthRoute>
    );
  };

  WrappedComponent.displayName = `NoAuthRoute(${
    Component.displayName || Component.name || Component
  })`;

  return WrappedComponent;
};

export default noAuthRoute;
