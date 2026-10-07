export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Restaurant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  profitPercent TEXT NOT NULL DEFAULT '0',
  offerPercent TEXT NOT NULL DEFAULT '0',
  offerScope TEXT NOT NULL DEFAULT 'all',
  offerCategoryId TEXT,
  coffeePricePerKg TEXT NOT NULL DEFAULT '0',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Category (
  id TEXT PRIMARY KEY,
  restaurantId TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (restaurantId) REFERENCES Restaurant(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS Category_restaurantId_slug
  ON Category (restaurantId, slug);

CREATE INDEX IF NOT EXISTS Category_restaurantId_sortOrder
  ON Category (restaurantId, sortOrder);

CREATE TABLE IF NOT EXISTS MenuItem (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL,
  coffeeGrams TEXT NOT NULL DEFAULT '0',
  imageUrl TEXT,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS MenuItem_categoryId_sortOrder
  ON MenuItem (categoryId, sortOrder);

CREATE TABLE IF NOT EXISTS MenuItemVariant (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  coffeeGrams TEXT NOT NULL DEFAULT '0',
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (itemId) REFERENCES MenuItem(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS MenuItemVariant_itemId_sortOrder
  ON MenuItemVariant (itemId, sortOrder);

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
`;
