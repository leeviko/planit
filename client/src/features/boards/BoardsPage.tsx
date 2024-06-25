import { useGetBoardsQuery } from '../api/apiSlice';
import authRoute from '../auth/AuthRoute';
import BoardItem from './BoardItem';
import { Board } from './boardsSlice';
import './BoardsPage.css';
import Skeleton from 'react-loading-skeleton';

const BoardsPage = () => {
  const { data, error, isLoading } = useGetBoardsQuery(undefined);

  const favoritedBoardsList =
    data?.filter((board: Board) => board.favorited) || [];
  const favoritedBoards =
    !isLoading && favoritedBoardsList.length === 0 ? (
      <p className="error">No boards favorited</p>
    ) : (
      favoritedBoardsList?.map((board: Board) => (
        <BoardItem
          key={board.id}
          title={board.title}
          favorited={board.favorited}
          slug={board.slug}
          id={board.id}
        />
      ))
    );

  const allBoardsList = data?.filter((board: Board) => !board.favorited) || [];
  const allBoards =
    !isLoading && allBoardsList.length === 0 ? (
      <p className="error">No boards found</p>
    ) : (
      allBoardsList?.map((board: Board) => (
        <BoardItem
          key={board.id}
          title={board.title}
          favorited={board.favorited}
          slug={board.slug}
          id={board.id}
        />
      ))
    );

  return (
    <div className="boards-page">
      <div className="boards-content">
        <h1>Your boards</h1>
        <p>Favorited</p>
        <div className="board-list">
          {!isLoading
            ? favoritedBoards
            : Array.from({ length: 2 }, (_, i) => (
                <BoardItem
                  key={i}
                  title=""
                  favorited={false}
                  slug=""
                  id=""
                  skeleton={true}
                />
              ))}
        </div>
        <p>All</p>
        <div className="board-list">
          {!isLoading
            ? allBoards
            : Array.from({ length: 2 }, (_, i) => (
                <BoardItem
                  key={i}
                  title=""
                  favorited={false}
                  slug=""
                  id=""
                  skeleton={true}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

const WrappedBoardsPage = authRoute(BoardsPage, '/login');
export default WrappedBoardsPage;
