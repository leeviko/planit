import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import cors from 'cors';
import morgan from 'morgan';

export type ServerError = {
  ok: false;
  status: number;
  msg: string;
};

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(morgan('dev'));

app.set('trust proxy', 1);

const redisClient = createClient({ url: process.env.REDIS_URL });
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
app.use('/api/cards', require('./routes/api/cards'));
app.use('/api/lists', require('./routes/api/lists'));

app.listen(port, () => {
  console.log(`⚡ Server is running on port ${port}`);
});
