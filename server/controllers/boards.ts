import { UserResult, UserSession } from './users';
import { ErrorCode, query } from '../config/db';
import { BoardUpdate, NewBoard } from '../routes/api/boards';
import { slug } from '../utils';
import { nanoid } from 'nanoid';
import { Error } from '../server';

/* 

board
{ 
  id: string;
  userId: string;
  slug: string;
  title: string;
  favorited: boolean;
  created_at: Date;
  updated_at: Date;
  
  lists: [
    {
      id: string;
      boardId: string;
      title: string;
      position: int;
      created_at: Date;
      updated_at: Date;
      cards: {
        id: string;
        listId: string;
        title: string;
        position: int;
        created_at: Date;
        updated_at: Date;
      }
    }
  ]
}



*/

export async function getBoards(user: UserResult) {
  const boardQuery = 'SELECT * FROM boards WHERE userId = $1';
  const result = await query(boardQuery, [user.id]);

  console.log(result.rows);
}

export async function createBoard(user: UserResult, title: string) {
  const newBoard: NewBoard = {
    id: nanoid(),
    userId: user.id,
    slug: slug(title),
    title,
  };

  const boardQuery = `
    INSERT INTO boards (id, userId, slug, title) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;

  try {
    const result = await query(boardQuery, [
      newBoard.id,
      newBoard.userId,
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
 * @returns The updated board row(s) from the database.
 * @throws An error if the update fails.
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
    WHERE id = $${keys.length + 1} AND userId = $${keys.length + 2}
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

export async function deleteBoard() {}

export async function createList() {}
