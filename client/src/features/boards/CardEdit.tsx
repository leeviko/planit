import { useDispatch } from 'react-redux';
import { setCardEditing } from '../ui/uiSlice';

import './CardEdit.css';
import useForm from '../../hooks/useForm';
import { useDeleteCardMutation, useUpdateCardMutation } from '../api/apiSlice';

type Props = {
  id: string;
  board_id: string;
  name: string;
};

const CardEdit = ({ id, board_id, name }: Props) => {
  const [deleteCard] = useDeleteCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [values, handleChange] = useForm({ name });
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      await deleteCard({ cardId: id, boardId: board_id }).unwrap();
    } catch (err) {
      console.log(err);
    }

    dispatch(setCardEditing(null));
  };

  const handleSave = async () => {
    if (!values.name || values.name === name) {
      dispatch(setCardEditing(null));
      return;
    }

    try {
      await updateCard({
        title: values.name,
        cardId: id,
        boardId: board_id,
      }).unwrap();
    } catch (err) {
      console.log(err);
    }

    dispatch(setCardEditing(null));
  };

  return (
    <>
      <div
        className="overlay"
        onClick={() => dispatch(setCardEditing(null))}
      ></div>
      <div className="card-editing">
        <div className="card-content">
          <div className="card-input-container">
            <input
              autoFocus
              className="card-input"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
            />
            <button className="btn" onClick={handleSave}>
              Save
            </button>
          </div>
          <div className="card-sidebar">
            <button className="btn delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardEdit;
