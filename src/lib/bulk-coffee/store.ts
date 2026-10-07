import {
  createId,
  db,
  ensureSchema,
  fromBoolean,
  nowIso,
  toBoolean,
} from "@/lib/db/client";
import { fail, ok, type ActionResult } from "@/lib/menu/result";
import type {
  BulkCoffeeSaleRecord,
  BulkCoffeeTypeRecord,
} from "@/types/bulk-coffee";

const DEFAULT_TYPES = [
  "روبو ۱۰۰",
  "عربیکا ۱۰۰",
  "کشت مخصوص ۷۰/۳۰",
  "۸۰/۲۰",
  "۶۰/۴۰",
  "۵۰/۵۰",
  "۳۰/۷۰",
  "۲۰/۸۰",
  "۴۰/۶۰",
];

type TypeRow = {
  id: string;
  name: string;
  pricePerKg: string | number;
  isActive: number | boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type SaleRow = {
  id: string;
  typeId: string | null;
  typeName: string;
  unit: string;
  inputValue: string;
  grams: string | number;
  amount: string | number;
  pricePerKg: string | number;
  createdAt: string;
};

function mapType(row: TypeRow): BulkCoffeeTypeRecord {
  return {
    id: row.id,
    name: row.name,
    pricePerKg: Number(row.pricePerKg) || 0,
    isActive: toBoolean(row.isActive),
    sortOrder: Number(row.sortOrder),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapSale(row: SaleRow): BulkCoffeeSaleRecord {
  return {
    id: row.id,
    typeId: row.typeId,
    typeName: row.typeName,
    unit: row.unit === "toman" ? "toman" : "grams",
    inputValue: String(row.inputValue),
    grams: Number(row.grams) || 0,
    amount: Number(row.amount) || 0,
    pricePerKg: Number(row.pricePerKg) || 0,
    createdAt: row.createdAt,
  };
}

async function seedTypesIfEmpty() {
  const existing = await db.execute(
    "SELECT COUNT(*) AS count FROM BulkCoffeeType",
  );
  const count = Number(existing.rows[0]?.count ?? 0);

  if (count > 0) {
    return;
  }

  const now = nowIso();

  for (const [index, name] of DEFAULT_TYPES.entries()) {
    await db.execute({
      sql: `INSERT INTO BulkCoffeeType
              (id, name, pricePerKg, isActive, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [createId(), name, "0", fromBoolean(true), index, now, now],
    });
  }
}

export async function listBulkCoffeeTypes(): Promise<
  ActionResult<BulkCoffeeTypeRecord[]>
> {
  await ensureSchema();

  try {
    await seedTypesIfEmpty();
    const result = await db.execute(
      `SELECT id, name, pricePerKg, isActive, sortOrder, createdAt, updatedAt
       FROM BulkCoffeeType
       ORDER BY sortOrder ASC, createdAt ASC`,
    );

    return ok((result.rows as unknown as TypeRow[]).map(mapType));
  } catch (error) {
    console.error(error);
    return fail("بارگذاری انواع قهوه ممکن نشد");
  }
}

export async function getBulkCoffeeType(
  id: string,
): Promise<ActionResult<BulkCoffeeTypeRecord>> {
  await ensureSchema();

  try {
    const result = await db.execute({
      sql: `SELECT id, name, pricePerKg, isActive, sortOrder, createdAt, updatedAt
            FROM BulkCoffeeType WHERE id = ?`,
      args: [id],
    });
    const row = result.rows[0] as unknown as TypeRow | undefined;

    if (!row) {
      return fail("نوع قهوه پیدا نشد");
    }

    return ok(mapType(row));
  } catch (error) {
    console.error(error);
    return fail("بارگذاری نوع قهوه ممکن نشد");
  }
}

export async function saveBulkCoffeeType(input: {
  id?: string;
  name: string;
  pricePerKg: number;
  isActive?: boolean;
}): Promise<ActionResult<BulkCoffeeTypeRecord>> {
  await ensureSchema();
  const now = nowIso();

  try {
    if (input.id) {
      const current = await getBulkCoffeeType(input.id);

      if (!current.ok) {
        return current;
      }

      const next: BulkCoffeeTypeRecord = {
        ...current.data,
        name: input.name,
        pricePerKg: input.pricePerKg,
        isActive: input.isActive ?? current.data.isActive,
        updatedAt: now,
      };

      await db.execute({
        sql: `UPDATE BulkCoffeeType
              SET name = ?, pricePerKg = ?, isActive = ?, updatedAt = ?
              WHERE id = ?`,
        args: [
          next.name,
          String(next.pricePerKg),
          fromBoolean(next.isActive),
          next.updatedAt,
          next.id,
        ],
      });

      return ok(next);
    }

    const last = await db.execute(
      "SELECT MAX(sortOrder) AS sortOrder FROM BulkCoffeeType",
    );
    const sortOrder = Number(last.rows[0]?.sortOrder ?? -1) + 1;
    const next: BulkCoffeeTypeRecord = {
      id: createId(),
      name: input.name,
      pricePerKg: input.pricePerKg,
      isActive: input.isActive ?? true,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    await db.execute({
      sql: `INSERT INTO BulkCoffeeType
              (id, name, pricePerKg, isActive, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        next.id,
        next.name,
        String(next.pricePerKg),
        fromBoolean(next.isActive),
        next.sortOrder,
        next.createdAt,
        next.updatedAt,
      ],
    });

    return ok(next);
  } catch (error) {
    console.error(error);
    return fail("ذخیره نوع قهوه ممکن نشد");
  }
}

export async function deleteBulkCoffeeType(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM BulkCoffeeType WHERE id = ?",
      args: [id],
    });

    if (!existing.rows[0]) {
      return fail("نوع قهوه پیدا نشد");
    }

    await db.execute({
      sql: "DELETE FROM BulkCoffeeType WHERE id = ?",
      args: [id],
    });

    return ok({ id });
  } catch (error) {
    console.error(error);
    return fail("حذف نوع قهوه ممکن نشد");
  }
}

export async function createBulkCoffeeSale(input: {
  typeId: string | null;
  typeName: string;
  unit: "grams" | "toman";
  inputValue: string;
  grams: number;
  amount: number;
  pricePerKg: number;
}): Promise<ActionResult<BulkCoffeeSaleRecord>> {
  await ensureSchema();

  const sale: BulkCoffeeSaleRecord = {
    id: createId(),
    typeId: input.typeId,
    typeName: input.typeName,
    unit: input.unit,
    inputValue: input.inputValue,
    grams: input.grams,
    amount: input.amount,
    pricePerKg: input.pricePerKg,
    createdAt: new Date().toISOString(),
  };

  try {
    await db.execute({
      sql: `INSERT INTO BulkCoffeeSale
              (id, typeId, typeName, unit, inputValue, grams, amount, pricePerKg, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sale.id,
        sale.typeId,
        sale.typeName,
        sale.unit,
        sale.inputValue,
        String(sale.grams),
        String(sale.amount),
        String(sale.pricePerKg),
        sale.createdAt,
      ],
    });

    return ok(sale);
  } catch (error) {
    console.error(error);
    return fail("ثبت فروش فله ممکن نشد");
  }
}

export async function listBulkCoffeeSales(range: {
  from: string;
  to: string;
}): Promise<ActionResult<BulkCoffeeSaleRecord[]>> {
  await ensureSchema();

  try {
    const result = await db.execute({
      sql: `SELECT id, typeId, typeName, unit, inputValue, grams, amount, pricePerKg, createdAt
            FROM BulkCoffeeSale
            WHERE createdAt >= ? AND createdAt < ?
            ORDER BY createdAt DESC`,
      args: [range.from, range.to],
    });

    return ok((result.rows as unknown as SaleRow[]).map(mapSale));
  } catch (error) {
    console.error(error);
    return fail("بارگذاری فروش فله ممکن نشد");
  }
}

export async function deleteBulkCoffeeSale(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM BulkCoffeeSale WHERE id = ?",
      args: [id],
    });

    if (!existing.rows[0]) {
      return fail("فروش پیدا نشد");
    }

    await db.execute({
      sql: "DELETE FROM BulkCoffeeSale WHERE id = ?",
      args: [id],
    });

    return ok({ id });
  } catch (error) {
    console.error(error);
    return fail("حذف فروش فله ممکن نشد");
  }
}

export function sumBulkCoffeeAmount(sales: BulkCoffeeSaleRecord[]) {
  return sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
}
