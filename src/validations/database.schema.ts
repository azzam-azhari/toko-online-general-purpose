import { z } from "zod";

// PostgreSQL accepts UUID values regardless of their version and variant bits.
// Seeded catalog rows intentionally use stable version-zero UUIDs.
export const databaseUuidSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "ID database tidak valid.");
