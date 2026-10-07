import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { SCHEMA_SQL } from "@/lib/db/schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return url;
}

function createDb() {
  const url = getDatabaseUrl();

  if (!url.startsWith("file:")) {
    return createClient({ url });
  }

  const dbFile = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "data",
    "dev.db",
  );
  mkdirSync(path.dirname(dbFile), { recursive: true });

  return createClient({
    url: `file:${dbFile.replace(/\\/g, "/")}`,
  });
}

const globalForDb = globalThis as unknown as {
  db: Client | undefined;
  dbReady: Promise<void> | undefined;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

async function addMissingColumns(table: string, columns: [string, string][]) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const names = new Set(info.rows.map((row) => String(row.name)));

  for (const [name, definition] of columns) {
    if (!names.has(name)) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    }
  }
}

export async function ensureSchema() {
  if (!globalForDb.dbReady) {
    globalForDb.dbReady = db.executeMultiple(SCHEMA_SQL).then(() => undefined);
  }

  await globalForDb.dbReady;
  await addMissingColumns("Restaurant", [
    ["profitPercent", "TEXT NOT NULL DEFAULT '0'"],
    ["offerPercent", "TEXT NOT NULL DEFAULT '0'"],
    ["offerScope", "TEXT NOT NULL DEFAULT 'all'"],
    ["offerCategoryId", "TEXT"],
    ["coffeePricePerKg", "TEXT NOT NULL DEFAULT '0'"],
  ]);
  await addMissingColumns("MenuItem", [
    ["coffeeGrams", "TEXT NOT NULL DEFAULT '0'"],
  ]);
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS Prefactor (
      id TEXT PRIMARY KEY,
      tableLabel TEXT NOT NULL DEFAULT '',
      createdBy TEXT NOT NULL,
      isDelivered INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS Prefactor_createdAt
      ON Prefactor (createdAt);
    CREATE TABLE IF NOT EXISTS PrefactorLine (
      id TEXT PRIMARY KEY,
      prefactorId TEXT NOT NULL,
      itemId TEXT NOT NULL,
      name TEXT NOT NULL,
      unitPrice TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (prefactorId) REFERENCES Prefactor(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS PrefactorLine_prefactorId
      ON PrefactorLine (prefactorId);
  `);
  await addMissingColumns("Prefactor", [
    ["isDelivered", "INTEGER NOT NULL DEFAULT 0"],
  ]);
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS Expense (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS Expense_createdAt
      ON Expense (createdAt);
    CREATE TABLE IF NOT EXISTS CafeTable (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      seatedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS CafeTable_number
      ON CafeTable (number);
    CREATE TABLE IF NOT EXISTS MenuItemVariant (
      id TEXT PRIMARY KEY,
      itemId TEXT NOT NULL,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (itemId) REFERENCES MenuItem(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS MenuItemVariant_itemId_sortOrder
      ON MenuItemVariant (itemId, sortOrder);
  `);
  await addMissingColumns("MenuItemVariant", [
    ["coffeeGrams", "TEXT NOT NULL DEFAULT '0'"],
  ]);
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS BulkCoffeeType (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pricePerKg TEXT NOT NULL DEFAULT '0',
      isActive INTEGER NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS BulkCoffeeType_sortOrder
      ON BulkCoffeeType (sortOrder);
    CREATE TABLE IF NOT EXISTS BulkCoffeeSale (
      id TEXT PRIMARY KEY,
      typeId TEXT,
      typeName TEXT NOT NULL,
      unit TEXT NOT NULL,
      inputValue TEXT NOT NULL,
      grams TEXT NOT NULL,
      amount TEXT NOT NULL,
      pricePerKg TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (typeId) REFERENCES BulkCoffeeType(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS BulkCoffeeSale_createdAt
      ON BulkCoffeeSale (createdAt);
  `);
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId() {
  return crypto.randomUUID();
}

export function toBoolean(value: number | boolean) {
  return Boolean(value);
}

export function fromBoolean(value: boolean) {
  return value ? 1 : 0;
}
