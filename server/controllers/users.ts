import { Request } from 'express';
import * as db from '../config/db';
import { nanoid } from 'nanoid';
import { QueryResult, QueryResultRow } from 'pg';
import { randomBytes, scrypt, scryptSync } from 'crypto';
import { ServerError } from '../server';

export type NewUser = {
  username: string;
  email: string;
  password: string;
};

export type UserResult = {
  id: string;
  username: string;
  email: string;
  admin: boolean;
  created_at: Date;
};

export type UserSession = UserResult;

export async function getUserBy(
  key: 'name' | 'email' | 'id',
  value: string
): Promise<QueryResultRow[]> {
  const query = `SELECT name, email, id FROM users WHERE ${key} = $1`;
  const result = await db.query(query, [value]);

  return result.rows;
}

type RegisterSuccess = {
  ok: true;
  data: UserResult;
};

export async function registerUser(
  user: NewUser
): Promise<RegisterSuccess | ServerError> {
  const newUser = {
    ...user,
    id: nanoid(),
  };

  const isEmailUnique = await getUserBy('email', newUser.email);
  if (isEmailUnique.length > 0)
    return { ok: false, status: 400, msg: 'Email already in use' };

  const isNameUnique = await getUserBy('name', newUser.username);
  if (isNameUnique.length > 0)
    return { ok: false, status: 400, msg: 'Username already in use' };

  /**
   * GENERATE PASSWORD
   **/

  const salt = randomBytes(24).toString('hex');
  let hash;

  try {
    const key = scryptSync(newUser.password, salt, 64);
    hash = salt + ':' + key.toString('hex');
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 500,
      msg: 'Failed to register. Please try again later.',
    };
  }

  /**
   * INSERT NEW USER
   **/

  const query = `
    INSERT INTO users (id, name, email, password)
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, admin, created_at
  `;

  try {
    const result = await db.query(query, [
      newUser.id,
      newUser.username,
      newUser.email,
      hash,
    ]);
    const userResult = result.rows[0];

    return {
      ok: true,
      data: {
        id: userResult.id,
        username: userResult.name,
        email: userResult.email,
        admin: userResult.admin,
        created_at: userResult.created_at,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      status: 500,
      msg: 'Failed to register. Please try again later.',
    };
  }
}
