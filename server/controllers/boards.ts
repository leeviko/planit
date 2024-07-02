import { UserResult, UserSession } from './users';
import { ErrorCode, query } from '../config/db';
import {
  Board,
  BoardUpdate,
  ListUpdate,
  Card,
  List,
  NewBoard,
  BoardWithLists,
} from '../routes/api/boards';
import { arrayMove, slug } from '../utils';
import { nanoid } from 'nanoid';
import { ServerError } from '../server';

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

type GetBoardSuccess = {
  ok: true;
  data: BoardWithLists;
};

/**
 * Get board with lists by id or slug
 * @param user - The user performing the action
 * @param id - The ID or slug of the board
 * @returns The board or an error
 */
export async function getBoard(
  user: UserResult,
  id: string
): Promise<GetBoardSuccess | ServerError> {
  const boardQuery = `
    SELECT 
      b.*, 
      COALESCE(array_agg(row_to_json(l) ORDER BY l.position) FILTER (WHERE l IS NOT NULL), '{}') AS lists 
    FROM boards b
    LEFT JOIN (
      SELECT list.*, COALESCE(array_agg(row_to_json(c) ORDER BY c.position) FILTER (WHERE c IS NOT NULL), '{}') AS cards 
      FROM lists list 
      LEFT JOIN cards c ON list.id = c.list_id GROUP BY list.id
    ) l 
    ON b.id = l.board_id WHERE (b.id = $1 OR b.slug = $1) AND b.user_id = $2
    GROUP BY b.id
  `;

  try {
    const result = await query(boardQuery, [id, user.id]);
    return { ok: true, data: result.rows[0] };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 400,
      msg: 'Failed to retrieve board. Please try again later.',
    };
  }
}

type GetBoardsSuccess = {
  ok: true;
  data: BoardWithLists[];
};

/**
 * Retrieves all user's boards with their associated lists.
 * @param user - The user performing the action.
 * @returns An error or an array of board objects with their associated lists.
 */
export async function getBoards(
  user: UserResult
): Promise<GetBoardsSuccess | ServerError> {
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
    return { ok: true, data: result.rows };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    };
  }
}

type CreateBoardSuccess = {
  ok: true;
  data: Board;
};

/**
 * Creates a new board.
 * @param user - The user performing the action.
 * @param title - The title of the board.
 * @returns An error or the new board.
 */
export async function createBoard(
  user: UserResult,
  title: string
): Promise<CreateBoardSuccess | ServerError> {
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
    return { ok: true, data: result.rows[0] };
  } catch (err: any) {
    console.log(err);
    if (err.code === ErrorCode.DUPLICATE) {
      return {
        ok: false,
        status: 400,
        msg: 'Title already in use',
      };
    }
    return {
      ok: false,
      status: 400,
      msg: 'Failed to create board. Please try again later.',
    };
  }
}

type UpdateBoardSuccess = CreateBoardSuccess;

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
): Promise<UpdateBoardSuccess | ServerError> {
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
    return { ok: true, data: result.rows[0] };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 400,
      msg: 'Failed to update board. Please try again later.',
    };
  }
}

/**
 * Deletes a board
 * @param user - The user performing the action
 * @param boardId - The ID of the board
 * @returns An error or the number of rows deleted
 */
export async function deleteBoard(
  user: UserResult,
  boardId: string
): Promise<{ ok: true } | ServerError> {
  const deleteBoardQuery = 'DELETE FROM boards WHERE id = $1 AND user_id = $2;';

  try {
    const result = await query(deleteBoardQuery, [boardId, user.id]);
    if (result.rowCount === 0) {
      return {
        ok: false,
        status: 404,
        msg: 'Board not found',
      };
    }

    return { ok: true };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 400,
      msg: 'Failed to delete board. Please try again later.',
    };
  }
}

type CreateListSuccess = {
  ok: true;
  data: List;
};

/**
 * Add list to a board
 * @param user - The user performing the action
 * @param boardId - The ID of the board
 * @param title - The title of the list
 * @returns An error or the new list
 */
export async function createList(
  user: UserResult,
  boardId: string,
  title: string
): Promise<CreateListSuccess | ServerError> {
  try {
    const board = await getBoardBy('id', boardId);
    if (!board || board.user_id !== user.id)
      return { ok: false, status: 404, msg: 'Board not found' };
  } catch (err) {
    return {
      ok: false,
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    };
  }

  const boardListsQuery = 'SELECT board_id FROM lists WHERE board_id = $1';

  const newList = {
    id: nanoid(),
    boardId,
    title,
    position: 0,
  };

  try {
    const boardLists = await query(boardListsQuery, [boardId]);
    newList.position = boardLists.rows.length;
  } catch (err) {
    return {
      ok: false,
      status: 400,
      msg: 'Something went wrong. Please try again later.',
    };
  }

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
    return { ok: true, data: result.rows[0] };
  } catch (err: any) {
    console.log(err);
    if (err.code === ErrorCode.DUPLICATE) {
      return { ok: false, status: 400, msg: 'Title already in use' };
    }
    return {
      ok: false,
      status: 400,
      msg: 'Failed to create list. Please try again later.',
    };
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
): Promise<{ ok: true } | ServerError> {
  const { title, pos } = updateValues;
  const list = await getListBy('id', listId);
  const board = await getBoardBy('id', boardId);

  if (!list || list.board_id !== boardId || !board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'List not found' };

  if (pos !== undefined && pos !== list.position) {
    const boardLists = await getBoardLists(boardId);
    if (!boardLists) return { ok: false, status: 404, msg: 'List not found' };

    if (pos < 0 || pos > boardLists.length)
      return { ok: false, status: 400, msg: 'Invalid position' };

    const oldListIndex = boardLists.findIndex((list) => list.id === listId);
    const newListIndex = pos;

    const newLists = arrayMove(boardLists, oldListIndex, newListIndex);

    try {
      await moveLists(newLists);
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        status: 500,
        msg: 'Failed to update list position. Please try again later.',
      };
    }
  }

  if (title) {
    const updateListQuery = 'UPDATE lists SET title = $1 WHERE id = $2';

    try {
      await query(updateListQuery, [title, listId]);
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        status: 500,
        msg: 'Failed to update title. Please try again later.',
      };
    }
  }

  return { ok: true };
}

async function moveLists(lists: List[]) {
  let updateQuery = 'UPDATE lists SET position = CASE';

  lists.forEach((list, index) => {
    updateQuery += ` WHEN id = '${list.id}' THEN ${index}`;
  });

  updateQuery += ' END WHERE id IN (';
  updateQuery += lists.map((list) => `'${list.id}'`).join(', ');
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

/**
 * Delete list
 * @param user - The user performing the action
 * @param listId - The ID of the list
 * @returns An error
 */
export async function deleteList(
  user: UserResult,
  listId: string,
  boardId: string
) {
  const board = await getBoardBy('id', boardId);
  if (!board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'List not found' };

  const deleteListQuery = 'DELETE FROM lists WHERE id = $1;';

  try {
    const result = await query(deleteListQuery, [listId]);
    if (result.rowCount === 0)
      return { ok: false, status: 404, msg: 'List not found' };

    return { ok: true };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 500,
      msg: 'Failed to delete list. Please try again later.',
    };
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

  // TODO: Fix this
  const listQuery = `
    SELECT l.* FROM lists AS l 
      INNER JOIN users ON l.user_id = $1 
    WHERE l.${key} = $2 LIMIT 1`;

  try {
    const result = await query(listQuery, [userId, value]);
    return result.rows[0] as List;
  } catch (err) {
    console.log(err);

    return false;
  }
}

/**
 * Get all board lists
 * @param boardId - The board id
 * @returns The lists
 */
export async function getBoardLists(boardId: string) {
  const listsQuery = `SELECT * FROM lists WHERE board_id = $1`;

  try {
    const result = await query(listsQuery, [boardId]);
    return result.rows as List[];
  } catch (err) {
    console.log(err);
    return false;
  }
}

type NewCard = {
  boardId: string;
  listId: string;
  title: string;
};

type CreateCardSuccess = {
  ok: true;
  data: Card;
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
    return { ok: false, status: 400, msg: 'Invalid values' };

  const board = await getBoardBy('id', list.board_id);

  if (!board || board.user_id !== user.id)
    return { ok: false, status: 400, msg: 'Invalid values' };

  const cardsQuery = 'SELECT list_id FROM cards WHERE list_id = $1';

  const newCard = {
    id: nanoid(),
    listId,
    title,
    position: 0,
  };

  try {
    const listCards = await query(cardsQuery, [listId]);
    newCard.position = listCards.rows.length;
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
