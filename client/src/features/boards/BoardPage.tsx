import { useParams } from 'react-router-dom';
import authRoute from '../auth/AuthRoute';
import { useGetBoardQuery } from '../api/apiSlice';
import BoardNavbar from './BoardNavbar';
import List from './List';
import './BoardPage.css';
import { useDispatch } from 'react-redux';
import { List as ListItem, setList, setBoard } from './boardsSlice';
import { useEffect, useMemo, useState } from 'react';
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
import Card from './Card';

export type ActiveList = {
  id: string;
};
export type ActiveCard = {
  id: string;
  list_id: string;
  title: string;
};

const BoardPage = () => {
  const { id } = useParams();
  const { data: board, isLoading } = useGetBoardQuery(id!);
  const [lists, setLists] = useState<ListItem[]>([]);
  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);
  const [activeList, setActiveList] = useState<ActiveList | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!board) return;

    dispatch(setBoard(board));

    setLists(board.lists);
  }, [board, dispatch]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveList(null);
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (active.data.current?.type !== 'list') return;

    const activeIndex = lists.findIndex((list) => list.id === activeId);
    const overIndex = lists.findIndex((list) => list.id === overId);

    const newLists = arrayMove(lists, activeIndex, overIndex);

    setLists(newLists);
    dispatch(setList(newLists));
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

  if (isLoading || !board) return <h1>Loading...</h1>;

  return (
    <div className="board-page">
      <BoardNavbar
        isLoading={isLoading}
        title={board?.title}
        favorited={board?.favorited}
        id={board?.id}
      />
      <div className="board-content">
        <div className="board-lists">
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <SortableContext
              items={listIds}
              strategy={horizontalListSortingStrategy}
            >
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
        </div>
      </div>
    </div>
  );
};

const WrappedBoardPage = authRoute(BoardPage, '/login');
export default WrappedBoardPage;
