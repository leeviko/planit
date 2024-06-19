import { config } from 'dotenv';
import migrate, { RunnerOption } from 'node-pg-migrate';

config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

const migrateConfig: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL!,
  migrationsTable: 'migrations',
  dir: 'migrations',
  direction: 'up',
};

migrate(migrateConfig)
  .then((res) => {
    if (res.length > 0) console.log('✅ Migration successful!');
  })
  .catch((err) => {
    console.log('⚠️ Migration failed!', err);
  });
