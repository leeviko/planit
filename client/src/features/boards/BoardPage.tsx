import { useParams } from 'react-router-dom';
import BoardNavbar from './BoardNavbar';
import { useGetBoardQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setBoard } from './boardsSlice';
import { useEffect } from 'react';
import BoardPageLists from './BoardPageLists';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams();
  const { data: board, isLoading } = useGetBoardQuery(id!);
  const dispatch = useDispatch();
  const boardLoaded = !isLoading && board;

  useEffect(() => {
    if (!board) return;

    dispatch(setBoard(board));
  }, [board, dispatch]);

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

export default BoardPage;
