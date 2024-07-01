import Skeleton from 'react-loading-skeleton';
import Favorite from '../../assets/favorite.svg';
import FavoriteFilled from '../../assets/favorite_filled.svg';
import More from '../../assets/more.svg';
import './BoardNavbar.css';
import { useUpdateBoardMutation } from '../api/apiSlice';

type Props = {
  isLoading: boolean;
  title?: string;
  favorited?: boolean;
  id?: string;
};

const BoardNavbar = ({ isLoading, title, favorited, id }: Props) => {
  const [favoriteBoard] = useUpdateBoardMutation();

  const handleFavorite = async () => {
    if (isLoading || !id) return;
    await favoriteBoard({ id, favorited: !favorited });
  };

  return (
    <div className="board-navbar">
      <div className="board-info">
        <h2>
          {isLoading ? (
            <Skeleton
              width={150}
              baseColor="var(--grey-dark)"
              highlightColor="var(--grey)"
            />
          ) : (
            title
          )}
        </h2>

        {!isLoading && title && (
          <button className="favorite-btn" onClick={handleFavorite}>
            <img src={favorited ? FavoriteFilled : Favorite} alt="" />
          </button>
        )}
      </div>
      {!isLoading && title && (
        <button className="board-dropdown-btn">
          <img src={More} alt="" />
        </button>
      )}
    </div>
  );
};

export default BoardNavbar;
