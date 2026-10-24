import { mockD1Database } from "@variablesoftware/mock-d1";
import {
  drizzle,
  type AnyD1Database,
  type DrizzleD1Database,
} from "drizzle-orm/d1";

import * as schema from "../schemas";

export type MockDatabaseType = DrizzleD1Database<typeof schema> & {
  $client: AnyD1Database;
};

export function createMockDrizzleClient(): MockDatabaseType {
  const client = mockD1Database();

  const db = drizzle(client as unknown as AnyD1Database, { schema });

  return db;
}
