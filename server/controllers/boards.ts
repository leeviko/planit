import { UserResult } from './users';
import * as db from '../config/db';
import { NewBoard } from '../routes/api/boards';
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
  const result = await db.query(boardQuery, [user.id]);

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
  `;

  try {
    const result = await db.query(boardQuery, [newBoard]);
    return result.rows;
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to create board. Please try again later.',
    });
  }
}
