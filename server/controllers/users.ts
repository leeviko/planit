import { Request } from 'express';
import * as db from '../config/db';
import { nanoid } from 'nanoid';
import { QueryResult, QueryResultRow } from 'pg';
import { randomBytes, scrypt, scryptSync } from 'crypto';
import { Error } from '../server';

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

export async function registerUser(user: NewUser) {
  const newUser = {
    ...user,
    id: nanoid(),
  };

  const isEmailUnique = await getUserBy('email', newUser.email);
  if (isEmailUnique.length > 0)
    return new Error({ status: 400, msg: 'Email already in use' });

  const isNameUnique = await getUserBy('name', newUser.username);
  if (isNameUnique.length > 0)
    return new Error({ status: 400, msg: 'Username already in use' });

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
    return new Error({
      status: 400,
      msg: 'Failed to register. Please try again later.',
    });
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
    return result.rows[0] as UserResult;
  } catch (err) {
    console.log(err);
    return new Error({
      status: 400,
      msg: 'Failed to register. Please try again later.',
    });
  }
}
