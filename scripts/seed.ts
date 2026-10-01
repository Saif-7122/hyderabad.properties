/** Creates tables and seeds the six demo projects if the database is empty. */
import { getDb } from '../lib/db/client';

getDb()
  .then(() => {
    console.log('Database ready (migrated and seeded if empty).');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
