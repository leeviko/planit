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
import { useCreateCardMutation } from '../api/apiSlice';
import DeleteIcon from '../../assets/delete.svg';

type Props = {
  id: string;
  board_id: string;
  title: string;
  cards: Card[];
  handleDeleteDialog?: (id: string) => void;
};

const List = ({ board_id, id, title, cards, handleDeleteDialog }: Props) => {
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const [originalHeight, setOriginalHeight] = useState<string | number>(0);
  const [newCardName, setNewCardName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [createCard] = useCreateCardMutation();

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

  const handleAddCard = async () => {
    if (!newCardName) return;

    try {
      await createCard({ boardId: board_id, listId: id, title: newCardName });
    } catch (err) {
      console.log(err);
    }

    setNewCardName('');
  };

  return (
    <div className="list" style={style} ref={setNodeRef}>
      <div className="list-content">
        <h3 className="list-title" {...attributes} {...listeners}>
          {title}
          <button
            onClick={
              handleDeleteDialog ? () => handleDeleteDialog(id) : undefined
            }
          >
            <img src={DeleteIcon} alt="Delete" />
          </button>
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
                board_id={board_id}
                pos={card.position}
              />
            ))}
          </SortableContext>
          <button
            className="add-card-btn"
            onClick={() => setShowAddInput(true)}
          >
            {showAddInput && (
              <input
                type="text"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Name..."
                autoFocus
                onBlur={() => {
                  setNewCardName('');
                  setShowAddInput(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              />
            )}
            {!showAddInput && <>+ Add Card</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default List;
