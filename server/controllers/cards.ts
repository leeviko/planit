import { query } from '../config/db';
import { nanoid } from 'nanoid';
import { ServerError } from '../server';
import { arrayMove } from '../utils';
import { getBoardBy } from './boards';
import { getListBoard, getListBy } from './lists';
import { UserResult } from './users';

type NewCard = {
  boardId: string;
  listId: string;
  title: string;
};

type CreateCardSuccess = {
  ok: true;
  data: Card;
};

export interface Card {
  id: string;
  list_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export type CardUpdate = {
  title?: string;
  listId?: string;
  pos?: number;
};

/**
 * Add card to a list
 * @param user - The user performing the action
 * @param values - contains the board and list ids and the card title
 * @returns An error or the new card
 */
export async function createCard(
  user: UserResult,
  values: NewCard
): Promise<CreateCardSuccess | ServerError> {
  const { boardId, listId, title } = values;

  const list = await getListBy('id', listId);
  if (!list || list.board_id !== boardId)
    return { ok: false, status: 404, msg: 'List not found' };

  const board = await getBoardBy('id', list.board_id);
  if (!board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'Board not found' };

  const cardsQuery = 'SELECT list_id FROM cards WHERE list_id = $1';

  const newCard = {
    id: nanoid(),
    listId,
    title,
    position: 0,
  };

  try {
    const listCards = await query(cardsQuery, [listId]);
    newCard.position = listCards.rowCount || 0;
  } catch (err) {
    return {
      ok: false,
      status: 500,
      msg: 'Something went wrong. Please try again later.',
    };
  }

  const cardQuery = `
    INSERT INTO cards (id, list_id, title, position)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  try {
    const result = await query(cardQuery, [
      newCard.id,
      newCard.listId,
      newCard.title,
      newCard.position,
    ]);
    return { ok: true, data: result.rows[0] };
  } catch (err: any) {
    console.log(err);
    return {
      ok: false,
      status: 500,
      msg: 'Failed to create card. Please try again later.',
    };
  }
}

async function getCardBy(key: 'id', value: string) {
  const cardQuery = `SELECT * FROM cards WHERE ${key} = $1 LIMIT 1`;
  try {
    const result = await query(cardQuery, [value]);
    return result.rows[0] as Card;
  } catch (err) {
    console.log(err);
    return false;
  }
}

type UpdateCardSuccess = {
  ok: true;
  msg: string;
};

/**
 * Update card
 * @param user - The user performing the action
 * @param values - values to update
 * @returns An error or the new card
 */
export async function updateCard(
  user: UserResult,
  cardId: string,
  values: CardUpdate
): Promise<UpdateCardSuccess | ServerError> {
  const { title, listId: newListId, pos } = values;

  const card = await getCardBy('id', cardId);

  if (!card) return { ok: false, status: 404, msg: 'Card not found' };

  const board = await getListBoard(card.list_id);
  if (!board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'Board not found' };

  if (pos !== undefined && newListId !== undefined) {
    const newCardIndex = pos;

    if (newListId !== card.list_id) {
      const newListBoard = await getListBoard(newListId);
      if (
        !newListBoard ||
        newListBoard.user_id !== user.id ||
        newListBoard.id !== board.id
      )
        return { ok: false, status: 404, msg: 'Board not found' };

      const prevListId = card.list_id;
      const prevCards = await getListCards(prevListId);
      if (!prevCards) {
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }

      // Change the card list id to the new one
      const moveCardResult = await moveCard(newListId, cardId);
      if (!moveCardResult) {
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }

      const newCards = await getListCards(newListId);
      if (!newCards) {
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }

      const addedCardIndex = newCards.findIndex((c) => c.id === cardId);

      const newCardsOrder = arrayMove(newCards, addedCardIndex, newCardIndex);

      try {
        await moveCards(prevCards);
        await moveCards(newCardsOrder);
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }
    } else {
      const cards = await getListCards(card.list_id);
      if (!cards) {
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }

      const oldCardIndex = cards.findIndex((c) => c.id === cardId);
      const newCardsOrder = arrayMove(cards, oldCardIndex, newCardIndex);

      try {
        await moveCards(newCardsOrder);
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          status: 500,
          msg: 'Something went wrong. Please try again later.',
        };
      }
    }
  }

  if (title) {
    const updateCardQuery = 'UPDATE cards SET title = $1 WHERE id = $2;';
    try {
      const result = await query(updateCardQuery, [title, cardId]);
      if (result.rowCount === 0)
        return { ok: false, status: 404, msg: 'Card not found' };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        status: 500,
        msg: 'Something went wrong. Please try again later.',
      };
    }
  }

  return { ok: true, msg: 'Card updated' };
}

async function getListCards(listId: string) {
  const cardsQuery = `SELECT * FROM cards WHERE list_id = $1 ORDER BY position`;

  try {
    const result = await query(cardsQuery, [listId]);
    return result.rows as Card[];
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Delete card
 * @param cardId - The id of the card
 * @returns boolean
 */
export async function deleteCard(cardId: string) {
  const deleteCardQuery = 'DELETE FROM cards WHERE id = $1;';

  try {
    const result = await query(deleteCardQuery, [cardId]);
    return result.rowCount === 1;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function moveCards(cards: Card[]) {
  let updateQuery = 'UPDATE cards SET position = CASE';

  cards.forEach((card, index) => {
    updateQuery += ` WHEN id = '${card.id}' THEN ${index}`;
  });

  updateQuery += ' END WHERE id IN (';
  updateQuery += cards.map((card) => `'${card.id}'`).join(', ');
  updateQuery += ');';

  try {
    const response = await query(updateQuery);
    return response.rows;
  } catch (err) {
    console.log(err);
    throw {
      ok: false,
      status: 500,
      msg: 'Something went wrong. Please try again later.',
    };
  }
}

async function moveCard(newListId: string, cardId: string) {
  const updateQuery = `UPDATE cards SET list_id = $1 WHERE id = $2;`;
  try {
    const result = await query(updateQuery, [newListId, cardId]);
    return result.rowCount === 1;
  } catch (err) {
    console.log(err);
    throw {
      ok: false,
      status: 500,
      msg: 'Something went wrong. Please try again later.',
    };
  }
}
