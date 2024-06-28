import './List.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties } from 'react';

type Props = {
  id: string;
  list_id: string;
  title: string;
};

const Card = ({ id, list_id, title }: Props) => {
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
    },
  });

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
      </div>
    </div>
  );
};

export default Card;
