import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

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
      secure: 'auto',
      httpOnly: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use('/api/users', require('./routes/api/users'));

app.listen(port, () => {
  console.log(`⚡ Server is running on port ${port}`);
});
