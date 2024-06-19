import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import cors from 'cors';

export type TError = {
  status: number;
  msg: string;
};

export class Error {
  status;
  msg;
  constructor({ status, msg }: TError) {
    this.status = status;
    this.msg = msg;
  }
}

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const redisClient = createClient();
redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);

  process.exit(1);
});

const redisStore = new RedisStore({
  client: redisClient,
});

app.use(
  session({
    name: 'user_sid',
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
    },
  })
);

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/boards', require('./routes/api/boards'));

app.listen(port, () => {
  console.log(`⚡ Server is running on port ${port}`);
});
