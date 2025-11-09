/**
 * Database connection and client setup
 * 
 * This file exports the database client and connection utilities
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
// Using connection pooling for better performance
const client = postgres(databaseUrl, {
  max: 10, // Maximum number of connections in the pool
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from "./schema";

