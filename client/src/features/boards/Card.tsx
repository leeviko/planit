import './List.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties } from 'react';
import Edit from '../../assets/edit.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setCardEditing } from '../ui/uiSlice';
import { RootState } from '../../app/store';
import CardEdit from './CardEdit';

type Props = {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  pos?: number;
};

const Card = ({ id, board_id, list_id, title, pos }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'card',
      list_id,
      title,
      pos,
    },
  });
  const cardEditing = useSelector((state: RootState) => state.ui.cardEditing);
  const dispatch = useDispatch();

  if (cardEditing === id)
    return <CardEdit id={id} board_id={board_id} name={title} />;

  const style: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    style.opacity = 0.3;
    return (
      <div className="card drag" style={style} ref={setNodeRef}>
        <div className="card-title">{title}</div>
      </div>
    );
  }

  const handleEdit = () => {
    dispatch(setCardEditing(id));
  };

  return (
    <div
      className="card"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="card-content">
        <p className="card-title">{title}</p>
        <button className="card-edit-btn" onClick={handleEdit}>
          <img className="card-edit-img" src={Edit} alt="edit" />
        </button>
      </div>
    </div>
  );
};

export default Card;
