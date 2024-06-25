import { useParams } from 'react-router-dom';
import authRoute from '../auth/AuthRoute';
import { useGetBoardQuery } from '../api/apiSlice';

const BoardPage = () => {
  const { id } = useParams();
  const { data: board, error, isLoading } = useGetBoardQuery(id!);
  console.log(board);
  return <div>BoardPage</div>;
};

const WrappedBoardPage = authRoute(BoardPage, '/login');
export default WrappedBoardPage;
