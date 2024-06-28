import CardItem from './Card';
import { Card } from './boardsSlice';
import './List.css';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, useEffect, useMemo, useState } from 'react';

type Props = {
  id: string;
  board_id: string;
  title: string;
  cards: Card[];
};

const List = ({ id, title, cards }: Props) => {
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const [originalHeight, setOriginalHeight] = useState<string | number>(0);

  const {
    node,
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

  const style: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  useEffect(() => {
    if (!isDragging) {
      setOriginalHeight(node.current?.clientHeight || 'auto');
    }
  }, [isDragging, node]);

  if (isDragging) {
    style.height = originalHeight;
    style.opacity = 0.3;
    return <div className="list drag" style={style} ref={setNodeRef}></div>;
  }

  return (
    <div className="list" style={style} ref={setNodeRef}>
      <div className="list-content">
        <h3 className="list-title" {...attributes} {...listeners}>
          {title}
        </h3>
        <div className="list-cards">
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <CardItem
                key={card.id}
                list_id={id}
                id={card.id}
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
