import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// enableChangeListener permite listas reativas via useLiveQuery (atualização automática).
export const sqlite = openDatabaseSync('atelie.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
