import { Link, useParams } from 'react-router-dom';
import BoardNavbar from './BoardNavbar';
import { useGetBoardQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setBoard } from './boardsSlice';
import { useEffect } from 'react';
import BoardPageLists from './BoardPageLists';
import './BoardPage.css';
import authRoute from '../auth/AuthRoute';

const BoardPage = () => {
  const { id } = useParams();
  const { data: board, isLoading } = useGetBoardQuery(id!);
  const dispatch = useDispatch();
  const boardLoaded = !isLoading && board;

  useEffect(() => {
    if (!board) return;

    dispatch(setBoard(board));
  }, [board, dispatch]);

  if (!isLoading && !board)
    return (
      <div className="board-page">
        <h1>Board not found</h1>
        <Link to="/boards">Go to boards</Link>
      </div>
    );

  return (
    <div className="board-page">
      <BoardNavbar
        isLoading={isLoading}
        title={board?.title}
        favorited={board?.favorited}
        id={board?.id}
      />
      <div className="board-content">
        <div className="board-lists">
          {boardLoaded && <BoardPageLists board={board} />}
        </div>
      </div>
    </div>
  );
};

const WrappedBoardPage = authRoute(BoardPage, '/login');

export default WrappedBoardPage;
