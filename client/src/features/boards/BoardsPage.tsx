import { useGetBoardsQuery } from '../api/apiSlice';
import authRoute from '../auth/AuthRoute';
import { Board } from './boardsSlice';
import './BoardsPage.css';
import BoardsList from './BoardsList';
import NewBoardItem from './NewBoardItem';

const BoardsPage = () => {
  const { data, isLoading } = useGetBoardsQuery(undefined);

  const favoritedBoards = data?.filter((board: Board) => board.favorited) || [];

  const allBoards = data?.filter((board: Board) => !board.favorited) || [];

  return (
    <div className="boards-page">
      <div className="boards-content">
        <h1>Your boards</h1>
        <p>Favorited</p>
        <div
          className={`board-list ${
            !isLoading && favoritedBoards.length === 0 ? 'empty' : ''
          }`}
        >
          <BoardsList
            isLoading={isLoading}
            boards={favoritedBoards}
            notFoundMsg="You have not favorited any boards"
          />
        </div>
        <p>All</p>
        <div className="board-list">
          <BoardsList isLoading={isLoading} boards={allBoards} />
          {!isLoading && <NewBoardItem />}
        </div>
      </div>
    </div>
  );
};

const WrappedBoardsPage = authRoute(BoardsPage, '/login');
export default WrappedBoardsPage;
