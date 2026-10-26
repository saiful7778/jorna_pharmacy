import {
  createClient,
  type Client,
  type InValue,
  type ResultSet,
} from "@libsql/client";
import {
  drizzle,
  type AnyD1Database,
  type DrizzleD1Database,
} from "drizzle-orm/d1";

import * as schema from "../schemas";

export type MockDatabaseType = DrizzleD1Database<typeof schema> & {
  $client: AnyD1Database;
};

function toRowObjects(result: ResultSet) {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((column, i) => [column, row[i]]))
  );
}

function toRowArrays(result: ResultSet) {
  return result.rows.map((row) => result.columns.map((_column, i) => row[i]));
}

function toD1Result(result: ResultSet) {
  return {
    results: toRowObjects(result),
    success: true,
    meta: {
      duration: 0,
      size_after: 0,
      rows_read: result.rows.length,
      rows_written: result.rowsAffected,
      last_row_id: Number(result.lastInsertRowid ?? 0),
      changed_db: result.rowsAffected > 0,
      changes: result.rowsAffected,
    },
  };
}

function createStatement(client: Client, sql: string) {
  let args: Array<InValue> = [];

  const statement = {
    sql,
    get args() {
      return args;
    },
    bind(...values: Array<InValue>) {
      args = values;
      return statement;
    },
    async all() {
      return toD1Result(await client.execute({ sql, args }));
    },
    async run() {
      return toD1Result(await client.execute({ sql, args }));
    },
    async first(column?: string) {
      const [row] = toRowObjects(await client.execute({ sql, args }));

      if (!row) return null;

      return column ? row[column] : row;
    },
    async raw() {
      return toRowArrays(await client.execute({ sql, args }));
    },
  };

  return statement;
}

/**
 * Adapts a libsql client to the subset of the D1Database API that
 * drizzle-orm's D1 driver uses. Backed by a real in-memory SQLite database.
 */
function createD1Database(client: Client): AnyD1Database {
  const prepare = (sql: string) => createStatement(client, sql);

  return {
    prepare,
    async batch(statements: Array<ReturnType<typeof prepare>>) {
      const results = await client.batch(
        statements.map(({ sql, args }) => ({ sql, args: [...args] })),
        "write"
      );

      return results.map(toD1Result);
    },
    async exec(query: string) {
      await client.executeMultiple(query);

      return { count: 0, duration: 0 };
    },
  } as unknown as AnyD1Database;
}

export function createMockDrizzleClient(): MockDatabaseType {
  const client = createClient({ url: ":memory:" });

  const db = drizzle(createD1Database(client), { schema });

  return db;
}
