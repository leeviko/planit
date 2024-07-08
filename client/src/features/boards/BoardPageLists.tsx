import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Board, Card, List as ListItem, setList } from './boardsSlice';
import CardItem from './Card';
import List from './List';
import {
  useCreateListMutation,
  useDeleteListMutation,
  useUpdateCardMutation,
  useUpdateListMutation,
} from '../api/apiSlice';
import { closeDialog, showDialog, showToast } from '../ui/uiSlice';
import { RootState } from '../../app/store';

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
  pos: number;
};

const BoardPageLists = ({ board }: Props) => {
  const [lists, setLists] = useState<ListItem[]>([]);
  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);
  const [activeList, setActiveList] = useState<ActiveList | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const sensors = useSensors(mouseSensor);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [createList] = useCreateListMutation();
  const [updateList] = useUpdateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [updateCard] = useUpdateCardMutation();
  const dialogConfirmed = useSelector(
    (state: RootState) => state.ui.dialogConfirmed
  );
  const dialog = useSelector((state: RootState) => state.ui.dialog);
  const dispatch = useDispatch();

  useEffect(() => {
    const deleteRequest = async () => {
      try {
        await deleteList({
          boardId: board.id,
          listId: dialog.id,
        }).unwrap();
      } catch (err) {
        console.log(err);
        dispatch(showToast({ msg: 'Failed to delete list', type: 'error' }));
      }
    };
    if (dialogConfirmed && dialog.initiator === 'list') {
      deleteRequest();
      dispatch(closeDialog());
    }
  }, [dialogConfirmed, dispatch, dialog, board.id, deleteList]);

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
        list_id: event.active.data.current.list_id,
        pos: event.active.data.current.pos,
      });
      return;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (activeCard) {
      let card: Card | undefined;
      let cardIndex;

      for (const list of lists) {
        card = list.cards.find((card) => card.id === activeCard.id);

        if (card) {
          cardIndex = list.cards.indexOf(card);
          break;
        }
      }

      if (!card) return;
      try {
        await updateCard({
          boardId: board.id,
          cardId: card.id,
          listId: card.list_id,
          pos: cardIndex,
        }).unwrap();
      } catch (err) {
        console.log(err);
      }
    }

    setActiveList(null);
    setActiveCard(null);

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

    const activeCardFromList = activeListCards[activeCardIndex];

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

        newActiveList.cards = newActiveList.cards.map((card, index) => {
          return { ...card, position: index };
        });

        // Change the active card list id to the new list id
        const newActiveCard = {
          ...activeCardFromList,
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

        newOverList.cards = newOverList.cards.map((card, index) => {
          return { ...card, position: index };
        });

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
      ...activeCardFromList,
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

  const handleDeleteDialog = (id: string) => {
    dispatch(
      showDialog({
        title: 'Delete list',
        description: 'Are you sure you want to delete this list?',
        yes: 'Yes',
        no: 'Cancel',
        id,
        initiator: 'list',
      })
    );
  };

  return (
    <DndContext
      sensors={sensors}
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
            handleDeleteDialog={handleDeleteDialog}
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
          <CardItem
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
