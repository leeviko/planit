import { query } from '../config/db';
import { nanoid } from 'nanoid';
import { ErrorCode } from '../config/db';
import { ServerError } from '../server';
import { arrayMove } from '../utils';
import { Board, getBoardBy, getBoardLists } from './boards';
import { Card } from './cards';
import { UserResult } from './users';

export type ListUpdate = {
  title?: string;
  pos?: number;
};

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface ListWithCards extends List {
  cards: Card[];
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
  const board = await getBoardBy('id', boardId);
  if (!board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'Board not found' };

  const boardListsQuery = 'SELECT board_id FROM lists WHERE board_id = $1';

  const newList = {
    id: nanoid(),
    boardId,
    title,
    position: 0,
  };

  try {
    const boardLists = await query(boardListsQuery, [boardId]);
    newList.position = boardLists.rowCount || 0;
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
): Promise<{ ok: true; msg: string } | ServerError> {
  const board = await getBoardBy('id', boardId);
  if (!board || board.user_id !== user.id)
    return { ok: false, status: 404, msg: 'List not found' };

  const deleteListQuery = 'DELETE FROM lists WHERE id = $1;';

  try {
    const result = await query(deleteListQuery, [listId]);
    if (result.rowCount === 0)
      return { ok: false, status: 404, msg: 'List not found' };

    return { ok: true, msg: 'List deleted' };
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
export async function getListBy(key: 'id', value: string) {
  const listQuery = `SELECT * FROM lists WHERE ${key} = $1 LIMIT 1`;

  try {
    const result = await query(listQuery, [value]);
    return result.rows[0] as List;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function getListBoard(listId: string) {
  const boardIdQuery = `SELECT board_id FROM lists WHERE id = $1 LIMIT 1;`;

  try {
    const result = await query(boardIdQuery, [listId]);
    if (result.rowCount === 0) return false;
    const boardId = result.rows[0].board_id;

    const boardQuery = `SELECT * FROM boards WHERE id = $1 LIMIT 1;`;
    const boardResult = await query(boardQuery, [boardId]);
    if (boardResult.rowCount === 0) return false;

    return boardResult.rows[0] as Board;
  } catch (err) {
    console.log(err);
    return false;
  }
}
