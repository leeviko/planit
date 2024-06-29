import Skeleton from 'react-loading-skeleton';
import Favorite from '../../assets/favorite.svg';
import FavoriteFilled from '../../assets/favorite_filled.svg';
import { useUpdateBoardMutation } from '../api/apiSlice';
import './BoardItem.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link } from 'react-router-dom';

type Props = {
  skeleton?: boolean;
  title: string;
  favorited: boolean;
  slug: string;
  id: string;
};

export const BoardItemWrapper = ({
  skeleton = false,
  title,
  favorited,
  slug,
  id,
}: Props) => {
  if (skeleton) return <BoardItemSkeleton />;

  return <BoardItem title={title} favorited={favorited} slug={slug} id={id} />;
};

export const BoardItemSkeleton = () => {
  return (
    <div className="board-item">
      <h3>
        <Skeleton
          baseColor="var(--accent-dark)"
          highlightColor="var(--accent-020)"
          height="1rem"
        />
      </h3>
      <button className="favorite-btn">
        <img src={Favorite} alt="" />
      </button>
    </div>
  );
};

const BoardItem = ({ title, favorited, slug, id }: Props) => {
  const [favoriteBoard] = useUpdateBoardMutation();

  const handleFavorite = async () => {
    await favoriteBoard({ id, favorited: !favorited });
  };

  return (
    <div className="board-item">
      <Link to={`/boards/${slug}`}>
        <h3>{title}</h3>
      </Link>
      <button className="favorite-btn" onClick={handleFavorite}>
        <img src={favorited ? FavoriteFilled : Favorite} alt="" />
      </button>
    </div>
  );
};

export default BoardItemWrapper;
