import { createId, db, ensureSchema, nowIso } from "@/lib/db/client";
import { fail, ok, type ActionResult } from "@/lib/menu/result";
import { parseTableNumber } from "@/lib/prefactor/table";
import type { CafeTableRecord } from "@/types/table";

type TableRow = {
  id: string;
  number: number;
  seatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapTable(row: TableRow): CafeTableRecord {
  return {
    id: row.id,
    number: Number(row.number),
    seatedAt: row.seatedAt || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCafeTables(): Promise<
  ActionResult<CafeTableRecord[]>
> {
  await ensureSchema();

  try {
    const result = await db.execute({
      sql: `SELECT id, number, seatedAt, createdAt, updatedAt
            FROM CafeTable
            ORDER BY number ASC`,
    });

    return ok((result.rows as unknown as TableRow[]).map(mapTable));
  } catch (error) {
    console.error(error);
    return fail("بارگذاری میزها ممکن نشد");
  }
}

export async function createCafeTable(
  number: number,
): Promise<ActionResult<CafeTableRecord>> {
  await ensureSchema();

  const now = nowIso();
  const table: CafeTableRecord = {
    id: createId(),
    number,
    seatedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.execute({
      sql: `INSERT INTO CafeTable (id, number, seatedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        table.id,
        table.number,
        table.seatedAt,
        table.createdAt,
        table.updatedAt,
      ],
    });

    return ok(table);
  } catch (error) {
    console.error(error);
    return fail("این شماره میز از قبل هست");
  }
}

export async function occupyCafeTable(
  id: string,
): Promise<ActionResult<CafeTableRecord>> {
  return setSeatedAt(id, nowIso());
}

export async function freeCafeTable(
  id: string,
): Promise<ActionResult<CafeTableRecord>> {
  return setSeatedAt(id, null);
}

async function setSeatedAt(
  id: string,
  seatedAt: string | null,
): Promise<ActionResult<CafeTableRecord>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: `SELECT id, number, seatedAt, createdAt, updatedAt
            FROM CafeTable WHERE id = ?`,
      args: [id],
    });
    const row = existing.rows[0] as unknown as TableRow | undefined;

    if (!row) {
      return fail("میز پیدا نشد");
    }

    const updatedAt = nowIso();

    await db.execute({
      sql: `UPDATE CafeTable SET seatedAt = ?, updatedAt = ? WHERE id = ?`,
      args: [seatedAt, updatedAt, id],
    });

    return ok(mapTable({ ...row, seatedAt, updatedAt }));
  } catch (error) {
    console.error(error);
    return fail("به‌روزرسانی میز ممکن نشد");
  }
}

export async function occupyCafeTableByNumber(
  tableLabel: string,
): Promise<ActionResult<CafeTableRecord | null>> {
  const number = parseTableNumber(tableLabel);

  if (number === null || number < 1) {
    return ok(null);
  }

  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: `SELECT id, number, seatedAt, createdAt, updatedAt
            FROM CafeTable WHERE number = ?`,
      args: [number],
    });
    const row = existing.rows[0] as unknown as TableRow | undefined;

    if (row) {
      if (row.seatedAt) {
        return ok(mapTable(row));
      }

      return setSeatedAt(row.id, nowIso());
    }

    const now = nowIso();
    const table: CafeTableRecord = {
      id: createId(),
      number,
      seatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.execute({
      sql: `INSERT INTO CafeTable (id, number, seatedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        table.id,
        table.number,
        table.seatedAt,
        table.createdAt,
        table.updatedAt,
      ],
    });

    return ok(table);
  } catch (error) {
    console.error(error);
    return fail("ثبت اشغال میز ممکن نشد");
  }
}

export async function deleteCafeTable(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM CafeTable WHERE id = ?",
      args: [id],
    });

    if (!existing.rows[0]) {
      return fail("میز پیدا نشد");
    }

    await db.execute({
      sql: "DELETE FROM CafeTable WHERE id = ?",
      args: [id],
    });

    return ok({ id });
  } catch (error) {
    console.error(error);
    return fail("حذف میز ممکن نشد");
  }
}
