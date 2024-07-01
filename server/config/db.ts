import { Pool, QueryResult } from 'pg';

export enum ErrorCode {
  DUPLICATE = '23505',
}

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

export const query = async (text: string, params?: any[]) => {
  if (!params) {
    return await pool.query(text);
  }

  return await pool.query(text, params);
};
