import BoardItem from './BoardItem';
import { Board } from './boardsSlice';
import './BoardsPage.css';
import BoardsListSkeleton from './BoardsListSkeleton';
import NotFound from '../../assets/not_found.svg';

type Props = {
  isLoading: boolean;
  boards: Board[];
  notFoundMsg?: string;
};

const BoardsList = ({ isLoading, boards, notFoundMsg }: Props) => {
  if (!isLoading && boards.length === 0) {
    if (notFoundMsg) {
      return (
        <div className="board-error">
          <img src={NotFound} alt="Not found" />
          <p className="error">{notFoundMsg}</p>
        </div>
      );
    } else {
      return;
    }
  }

  return (
    <>
      {isLoading ? (
        <BoardsListSkeleton />
      ) : (
        boards.map((board) => (
          <BoardItem
            key={board.id}
            id={board.id}
            slug={board.slug}
            title={board.title}
            favorited={board.favorited}
          />
        ))
      )}
    </>
  );
};

export default BoardsList;
