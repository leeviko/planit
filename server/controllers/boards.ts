import { UserResult, UserSession } from './users';
import { ErrorCode, query } from '../config/db';
import {
  Board,
  BoardUpdate,
  ListUpdate,
  Card,
  List,
  NewBoard,
} from '../routes/api/boards';
import { slug } from '../utils';
import { nanoid } from 'nanoid';
import { Error } from '../server';

/**
 * Get board by id or slug
 * @param key - The field to search by
 * @param value - The value to search for
 * @returns The board
 */
export async function getBoardBy(key: 'id' | 'slug', value: string) {
  const boardQuery = `SELECT * FROM boards WHERE ${key} = $1 LIMIT 1`;
  const result = await query(boardQuery, [value]);
  return result.rows[0] as Board;
}

/**
 * Get board with lists by id
 * @param user - The user performing the action
 * @param id - The ID of the board
 * @returns The board or an error
 */
export async function getBoard(user: UserResult, id: string) {
  const boardQuery = `
    SELECT 
      b.*, 
      array_agg(row_to_json(l)) AS lists 
    FROM boards b
    LEFT JOIN (
      SELECT list.*, array_agg(row_to_json(c)) AS cards 
      FROM lists list 
      LEFT JOIN cards c ON list.id = c.list_id GROUP BY list.id
    ) l 
    ON b.id = l.board_id WHERE b.id = $1 AND b.user_id = $2
    GROUP BY b.id
  `;

  try {
    const result = await query(boardQuery, [id, user.id]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to retrieve board. Please try again later.',
    });
  }
}

/**
 * Retrieves all user's boards with their associated lists.
 * @param user - The user performing the action.
 * @returns An error or an array of board objects with their associated lists.
 */
export async function getBoards(user: UserResult) {
  const boardQuery = `
    SELECT 
      b.*, 
      array_agg(row_to_json(l)) AS lists 
    FROM boards b
    LEFT JOIN (
      SELECT list.*, array_agg(row_to_json(c)) AS cards 
      FROM lists list 
      LEFT JOIN cards c ON list.id = c.list_id GROUP BY list.id
    ) l 
    ON b.id = l.board_id WHERE b.user_id = $1
    GROUP BY b.id
  `;

  try {
    const result = await query(boardQuery, [user.id]);
    return result.rows;
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * Creates a new board.
 * @param user - The user performing the action.
 * @param title - The title of the board.
 * @returns An error or the new board.
 */
export async function createBoard(user: UserResult, title: string) {
  const newBoard: NewBoard = {
    id: nanoid(),
    user_id: user.id,
    slug: slug(title),
    title,
  };

  const boardQuery = `
    INSERT INTO boards (id, user_id, slug, title) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;

  try {
    const result = await query(boardQuery, [
      newBoard.id,
      newBoard.user_id,
      newBoard.slug,
      newBoard.title,
    ]);
    return result.rows;
  } catch (err: any) {
    console.log(err);
    if (err.code === ErrorCode.DUPLICATE) {
      return new Error({
        status: 400,
        msg: 'Title already in use',
      });
    }
    return new Error({
      status: 400,
      msg: 'Failed to create board. Please try again later.',
    });
  }
}

/**
 * Updates a board with the provided data.
 * @param user - The user performing the update.
 * @param boardId - The ID of the board to update.
 * @param updateData - The data to update the board with.
 * @returns The updated board or an error.
 */
export async function updateBoard(
  user: UserSession,
  boardId: string,
  updateData: BoardUpdate
) {
  const keys = Object.keys(updateData).filter(
    (key) => updateData[key] !== undefined && updateData[key] !== ''
  );
  const data: BoardUpdate = Object.fromEntries(
    keys.map((key) => [key, updateData[key]])
  );

  // Construct the update query string
  const updateQuery = `
    UPDATE boards 
    SET ${keys.map((key, index) => `${key} = $${index + 1}`).join(', ')}
    WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
    RETURNING *
  `;

  try {
    const result = await query(updateQuery, [
      ...Object.values(data),
      boardId,
      user.id,
    ]);
    return result.rows;
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to update board. Please try again later.',
    });
  }
}

/**
 * Deletes a board
 * @param user - The user performing the action
 * @param boardId - The ID of the board
 * @returns An error or the number of rows deleted
 */
export async function deleteBoard(user: UserResult, boardId: string) {
  const board = await getBoardBy('id', boardId);

  if (!board) return new Error({ status: 404, msg: 'Board not found' });
  if (board.user_id !== user.id)
    return new Error({ status: 404, msg: 'Board not found' });

  const deleteBoardQuery = 'DELETE FROM boards WHERE id = $1';

  try {
    const result = await query(deleteBoardQuery, [boardId]);
    return result.rowCount;
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to delete board. Please try again later.',
    });
  }
}

/**
 * Add list to a board
 * @param user - The user performing the action
 * @param boardId - The ID of the board
 * @param title - The title of the list
 * @returns An error or the new list
 */
export async function addList(
  user: UserResult,
  boardId: string,
  title: string
) {
  let board;
  try {
    board = await getBoardBy('id', boardId);
  } catch (err) {
    return new Error({
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    });
  }

  if (!board) return new Error({ status: 400, msg: 'Invalid values' });
  if (board.user_id !== user.id)
    return new Error({ status: 400, msg: 'Invalid values' });

  const boardListsQuery = 'SELECT board_id FROM lists WHERE board_id = $1';
  let boardLists;

  try {
    boardLists = await query(boardListsQuery, [boardId]);
  } catch (err) {
    return new Error({
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    });
  }

  const newList = {
    id: nanoid(),
    boardId,
    title,
    position: boardLists.rows.length,
  };

  const listQuery = `
    INSERT INTO lists (id, board_id, title, position)
    VALUES ($1, $2, $3, $4)
    RETURNING * 
  `;

  try {
    const result = await query(listQuery, [
      newList.id,
      newList.boardId,
      newList.title,
      newList.position,
    ]);
    return result.rows;
  } catch (err: any) {
    console.log(err);
    if (err.code === ErrorCode.DUPLICATE) {
      return new Error({ status: 400, msg: 'Title already in use' });
    }
    return new Error({
      status: 400,
      msg: 'Failed to create list. Please try again later.',
    });
  }
}
/**
 * Update list
 * @param user - The user performing the action
 * @param boardId - The ID of the board
 * @param listId - The ID of the list
 * @param updateValues - Values to update
 * @returns The updated list or an error
 */
export async function updateList(
  user: UserResult,
  boardId: string,
  listId: string,
  updateValues: ListUpdate
) {}

/**
 * Delete list
 * @param user - The user performing the action
 * @param listId - The ID of the list
 * @returns An error
 */
export async function deleteList(user: UserResult, listId: string) {
  const list = await getListBy('id', listId, true, user.id);
  if (!list) return new Error({ status: 404, msg: 'List not found' });

  if (list.board_id !== user.id) {
    return new Error({ status: 404, msg: 'List not found' });
  }
}

/**
 * Get list by id or slug
 * @param key - The field to search by
 * @param value - The value to search for
 * @returns The list
 */
export async function getListBy(
  key: 'id',
  value: string,
  includeUser = false,
  userId = ''
) {
  if (!includeUser) {
    const listQuery = `SELECT * FROM lists WHERE ${key} = $1 LIMIT 1`;
    const result = await query(listQuery, [value]);
    return result.rows[0] as List;
  }

  const listQuery = `
    SELECT l.* FROM lists AS l 
      INNER JOIN users ON l.user_id = users.id 
    WHERE l.${key} = $1 LIMIT 1`;

  try {
    const result = await query(listQuery, [value]);
    return result.rows[0] as List;
  } catch (err) {
    console.log(err);
  }
}

type CardReq = {
  boardId: string;
  listId: string;
  title: string;
};

/**
 * Add card to a list
 * @param user - The user performing the action
 * @param values - contains the board and list ids and the card title
 * @returns An error or the new card
 */
export async function addCard(user: UserResult, values: CardReq) {
  const { boardId, listId, title } = values;

  const list = await getListBy('id', listId);
  if (!list) return new Error({ status: 400, msg: 'Invalid values' });

  if (list.board_id !== boardId)
    return new Error({ status: 400, msg: 'Invalid values' });

  const board = await getBoardBy('id', list.board_id);

  if (!board) return new Error({ status: 400, msg: 'Invalid values' });
  if (board.user_id !== user.id)
    return new Error({ status: 400, msg: 'Invalid values' });

  const cardsQuery = 'SELECT list_id FROM cards WHERE list_id = $1';
  let listCards;

  try {
    listCards = await query(cardsQuery, [listId]);
  } catch (err) {
    return new Error({
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    });
  }

  const newCard = {
    id: nanoid(),
    listId,
    title,
    position: listCards.rows.length,
  };

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
    return result.rows;
  } catch (err: any) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to create card. Please try again later.',
    });
  }
}
