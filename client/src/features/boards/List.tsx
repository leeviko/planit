import CardItem from './Card';
import { Card } from './boardsSlice';
import './List.css';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';

type Props = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  cards: Card[];
};

const List = ({ id, title, position, cards }: Props) => {
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

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
      type: 'list',
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div className="list" style={style} ref={setNodeRef}>
      <div className="list-content">
        <h3 className="list-title" {...attributes} {...listeners}>
          {title}
        </h3>
        <div className="list-cards">
          <SortableContext items={cardIds}>
            {cards.map((card) => (
              <CardItem
                key={card.id}
                list_id={id}
                id={card.id}
                position={card.position}
                title={card.title}
              />
            ))}
          </SortableContext>
          <button className="add-card-btn">+ Add card</button>
        </div>
      </div>
    </div>
  );
};

export default List;
