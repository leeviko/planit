import Skeleton from 'react-loading-skeleton';
import Favorite from '../../assets/favorite.svg';
import FavoriteFilled from '../../assets/favorite_filled.svg';
import More from '../../assets/more.svg';
import './BoardNavbar.css';
import { useUpdateBoardMutation } from '../api/apiSlice';
import { setBoardEditing, showToast, toggleBoardDropdown } from '../ui/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import BoardDropdown from './BoardDropdown';
import { RootState } from '../../app/store';
import useForm from '../../hooks/useForm';

type Props = {
  isLoading: boolean;
  title?: string;
  favorited?: boolean;
  id?: string;
};

const BoardNavbar = ({ isLoading, title, favorited, id }: Props) => {
  const [updateBoard] = useUpdateBoardMutation();
  const isEditing = useSelector((state: RootState) => state.ui.boardEditing);
  const [values, handleChange] = useForm({ name: '' });
  const dispatch = useDispatch();

  const handleFavorite = async () => {
    if (isLoading || !id) return;
    try {
      await updateBoard({ id, favorited: !favorited }).unwrap();
    } catch (err) {
      dispatch(showToast({ msg: 'Failed to favorite board', type: 'error' }));
    }
  };

  const handleTitleEdit = async () => {
    if (isLoading || !id) return;
    if (!values.name) return;
    if (title === values.name) {
      dispatch(setBoardEditing(false));
      return;
    }
    try {
      const result = await updateBoard({ id, title: values.name }).unwrap();
      if (result.ok) {
        dispatch(showToast({ msg: 'Title updated', type: 'success' }));
      }
    } catch (err) {
      dispatch(showToast({ msg: 'Failed to edit board', type: 'error' }));
    }
    dispatch(setBoardEditing(false));
  };

  return (
    <>
      <nav className="board-navbar">
        <div className="board-info">
          <h2>
            {isLoading ? (
              <Skeleton
                width={150}
                baseColor="var(--grey-dark)"
                highlightColor="var(--grey)"
              />
            ) : isEditing ? (
              <input
                autoFocus
                onBlur={() => dispatch(setBoardEditing(false))}
                type="text"
                name="name"
                onKeyDown={(e) => e.key === 'Enter' && handleTitleEdit()}
                value={values.name}
                onChange={handleChange}
              />
            ) : (
              title
            )}
          </h2>

          {!isLoading && title && !isEditing && (
            <button className="favorite-btn" onClick={handleFavorite}>
              <img src={favorited ? FavoriteFilled : Favorite} alt="" />
            </button>
          )}
        </div>
        {!isLoading && title && (
          <button
            className="board-dropdown-btn"
            onClick={() => dispatch(toggleBoardDropdown())}
          >
            <img className="board-dropdown-img" src={More} alt="" />
          </button>
        )}
      </nav>
      {!isLoading && id && <BoardDropdown id={id} />}
    </>
  );
};

export default BoardNavbar;
