import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Board, List as ListItem, setList } from './boardsSlice';
import Card from './Card';
import List from './List';
import { useCreateListMutation, useUpdateListMutation } from '../api/apiSlice';

type Props = {
  board: Board;
};

export type ActiveList = {
  id: string;
};

export type ActiveCard = {
  id: string;
  list_id: string;
  title: string;
};

const BoardPageLists = ({ board }: Props) => {
  const [lists, setLists] = useState<ListItem[]>([]);
  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);
  const [activeList, setActiveList] = useState<ActiveList | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [createList] = useCreateListMutation();
  const [updateList] = useUpdateListMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    setLists(board.lists);
  }, [board]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'list') {
      setActiveList({
        // @ts-expect-error
        id: event.active.id,
      });
      return;
    }
    if (event.active.data.current?.type === 'card') {
      setActiveCard({
        // @ts-expect-error
        id: event.active.id,
        title: event.active.data.current.title,
      });
      return;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveList(null);
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const oldLists = lists;

    const activeId = active.id as string;
    const overId = over.id;

    if (activeId === overId) return;

    if (active.data.current?.type !== 'list') return;

    const activeIndex = lists.findIndex((list) => list.id === activeId);
    const overIndex = lists.findIndex((list) => list.id === overId);

    const newLists = arrayMove(lists, activeIndex, overIndex);
    const updatedPositions = newLists.map((list, index) => {
      return { ...list, position: index };
    });

    setLists(updatedPositions);

    const response = await updateList({
      boardId: board.id,
      listId: activeId,
      pos: overIndex,
    }).unwrap();

    if (response.ok) {
      dispatch(setList(updatedPositions));
    } else {
      setLists(oldLists);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== 'card') return;
    if (overType !== 'list' && overType !== 'card') return;

    const activeCardListId = active.data.current?.list_id;
    const overCardListId = over.data.current?.list_id;

    // Get the active card's list and index
    const activeCardList = lists.find((list) => list.id === activeCardListId);
    if (!activeCardList) return;
    const activeListCards = activeCardList.cards;

    const activeCardIndex = activeListCards.findIndex(
      (card) => card.id === activeId
    );

    const activeCard = activeListCards[activeCardIndex];

    if (overType === 'card') {
      if (activeCardListId !== overCardListId) {
        const overCardList = lists.find((list) => list.id === overCardListId);
        if (!overCardList) return;
        const overCardIndex = overCardList.cards.findIndex(
          (card) => card.id === overId
        );

        const overListCards = overCardList.cards;

        // Remove the card from the active list
        const newActiveList = {
          ...activeCardList,
          cards: activeListCards.filter((card) => card.id !== activeId),
        };

        // Change the active card list id to the new list id
        const newActiveCard = {
          ...activeCard,
          list_id: overCardListId,
        };

        // Add the active card to the new list
        const newOverList = {
          ...overCardList,
          cards: [...overListCards, newActiveCard],
        };

        newOverList.cards = arrayMove(
          newOverList.cards,
          newOverList.cards.length - 1,
          overCardIndex
        );

        setLists((prevLists) => {
          const newLists = prevLists.map((list) => {
            if (list.id === newActiveList.id) {
              return newActiveList;
            }
            if (list.id === newOverList.id) {
              return newOverList;
            }
            return list;
          });

          dispatch(setList(newLists));
          return newLists;
        });
        return;
      }

      // If the card is in the same list
      if (activeCardListId === overCardListId) {
        const overCardIndex = activeListCards.findIndex(
          (card) => card.id === overId
        );

        const newCards = arrayMove(
          activeListCards,
          activeCardIndex,
          overCardIndex
        );
        const newList = { ...activeCardList, cards: newCards };

        setLists((prevLists) => {
          const newLists = prevLists.map((list) => {
            if (list.id === newList.id) {
              return newList;
            }
            return list;
          });

          dispatch(setList(newLists));
          return newLists;
        });
      }

      return;
    }

    // Move card to another list

    if (activeCardListId === overId) return;
    // Get the over card's list and index
    const overList = lists.find((list) => list.id === overId);
    if (!overList) return;

    const overListCards = overList.cards;

    const newActiveList = {
      ...activeCardList,
      cards: activeListCards.filter((card) => card.id !== activeId),
    };

    const newActiveCard = {
      ...activeCard,
      list_id: overId as string,
    };

    const newOverList = {
      ...overList,
      cards: [...overListCards, newActiveCard],
    };

    newOverList.cards = arrayMove(
      newOverList.cards,
      newOverList.cards.length - 1,
      0 // TODO: fix this..!
    );

    setLists((prevLists) => {
      const newLists = prevLists.map((list) => {
        if (list.id === newActiveList.id) {
          return newActiveList;
        }
        if (list.id === newOverList.id) {
          return newOverList;
        }
        return list;
      });

      dispatch(setList(newLists));

      return newLists;
    });
  };

  const handleAddList = async () => {
    if (!newListName) return;
    try {
      await createList({ boardId: board.id, title: newListName });
    } catch (err) {
      console.log(err);
    }

    setNewListName('');
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
        {lists.map((list) => (
          <List
            key={list.id}
            id={list.id}
            title={list.title}
            cards={list.cards}
            board_id={list.board_id}
          />
        ))}
      </SortableContext>
      <button className="add-list-btn" onClick={() => setShowAddInput(true)}>
        {showAddInput && (
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Name..."
            autoFocus
            onBlur={() => {
              setNewListName('');
              setShowAddInput(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
          />
        )}
        {!showAddInput && <>+ Add list</>}
      </button>
      <DragOverlay>
        {activeList &&
          lists.map(
            (list) =>
              list.id === activeList.id && (
                <List
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  cards={list.cards}
                  board_id={list.board_id}
                />
              )
          )}

        {activeCard && (
          <Card
            id={activeCard.id}
            list_id={activeCard.list_id}
            title={activeCard.title}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default BoardPageLists;
