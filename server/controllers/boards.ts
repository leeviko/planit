import { UserResult, UserSession } from './users';
import { ErrorCode, query } from '../config/db';
import { slug } from '../utils';
import { nanoid } from 'nanoid';
import { ServerError } from '../server';
import { List, ListWithCards } from './lists';

export interface Board {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  favorited: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BoardWithLists extends Board {
  lists: ListWithCards[];
}

export interface NewBoard {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  private: boolean;
}

export type BoardUpdate = {
  [key: string]: string | boolean | undefined;
  title?: string;
  favorited?: boolean;
};

/**
 * Get board by id or slug
 * @param key - The field to search by
 * @param value - The value to search for
 * @returns The board
 */
export async function getBoardBy(key: 'id' | 'slug', value: string) {
  const boardQuery = `SELECT * FROM boards WHERE ${key} = $1 LIMIT 1`;
  try {
    const result = await query(boardQuery, [value]);
    return result.rows[0] as Board;
  } catch (err) {
    console.log(err);
    return false;
  }
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
  const boardQuery = `SELECT * FROM boards WHERE user_id = $1`;

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
  title: string,
  isPrivate: boolean
): Promise<CreateBoardSuccess | ServerError> {
  const newBoard: NewBoard = {
    id: nanoid(),
    user_id: user.id,
    slug: slug(title),
    title,
    private: isPrivate,
  };

  const boardQuery = `
    INSERT INTO boards (id, user_id, slug, title, private) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
  `;

  try {
    const result = await query(boardQuery, [
      newBoard.id,
      newBoard.user_id,
      newBoard.slug,
      newBoard.title,
      newBoard.private,
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

/**
 * Get all board lists
 * @param boardId - The board id
 * @returns The lists
 */
export async function getBoardLists(boardId: string) {
  const listsQuery = `SELECT * FROM lists WHERE board_id = $1 ORDER BY position;`;

  try {
    const result = await query(listsQuery, [boardId]);
    return result.rows as List[];
  } catch (err) {
    console.log(err);
    return false;
  }
}
