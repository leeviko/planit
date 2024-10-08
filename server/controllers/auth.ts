import { ServerError } from '../server';
import * as db from '../config/db';
import { scryptSync } from 'crypto';
import { UserResult } from './users';
import { Request } from 'express';

type LoginSuccess = {
  ok: true;
  data: UserResult;
};

export async function login(creds: {
  username: string;
  password: string;
}): Promise<LoginSuccess | ServerError> {
  const { username, password } = creds;

  const query = 'SELECT * FROM users WHERE name = $1 LIMIT 1';

  let result;
  try {
    result = await db.query(query, [username]);
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      msg: 'Failed to login. Please try again later.',
    };
  }

  const user = result.rows[0];
  if (!user) {
    return {
      ok: false,
      status: 401,
      msg: 'Wrong username or password.',
    };
  }

  const [salt, storedHash] = user.password.split(':');

  try {
    const result = scryptSync(password, salt, 64);
    const hash = result.toString('hex');
    if (hash !== storedHash) {
      return {
        ok: false,
        status: 401,
        msg: 'Wrong username or password.',
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      msg: 'Failed to login. Please try again later.',
    };
  }

  const userObj: LoginSuccess = {
    ok: true,
    data: {
      id: user.id,
      username: user.name,
      email: user.email,
      admin: user.admin,
      created_at: user.created_at,
    },
  };

  return userObj;
}

export function logout(req: Request) {
  req.session.destroy((err) => {
    if (err) {
      throw {
        ok: false,
        status: 500,
        msg: 'Failed to logout. Please try again later.',
      };
    }
  });
}
