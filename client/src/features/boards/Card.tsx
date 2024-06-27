import './List.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  id: string;
  list_id: string;
  title: string;
  position: number;
  // created_at: Date;
  // updated_at: Date;
};

const Card = ({ title, id, list_id, position }: Props) => {
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
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
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
      </div>
    </div>
  );
};

export default Card;
