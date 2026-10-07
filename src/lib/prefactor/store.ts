import {
  createId,
  db,
  ensureSchema,
  fromBoolean,
  toBoolean,
} from "@/lib/db/client";
import type { StaffRole } from "@/lib/admin/session";
import { fail, ok, type ActionResult } from "@/lib/menu/result";
import type { PrefactorLineRecord, PrefactorRecord } from "@/types/prefactor";

type PrefactorRow = {
  id: string;
  tableLabel: string;
  createdBy: string;
  isDelivered?: number | boolean | null;
  createdAt: string;
};

type LineRow = {
  id: string;
  prefactorId: string;
  itemId: string;
  name: string;
  unitPrice: string;
  quantity: number;
};

function lineTotal(unitPrice: string, quantity: number) {
  return (Number(unitPrice) || 0) * quantity;
}

function mapPrefactor(
  row: PrefactorRow,
  lines: PrefactorLineRecord[],
): PrefactorRecord {
  const createdBy = row.createdBy === "manager" ? "manager" : "waiter";
  const total = lines.reduce(
    (sum, line) => sum + lineTotal(line.unitPrice, line.quantity),
    0,
  );

  return {
    id: row.id,
    tableLabel: row.tableLabel,
    createdBy,
    isDelivered: toBoolean(row.isDelivered ?? 0),
    createdAt: row.createdAt,
    lines,
    total: String(Math.ceil(total)),
  };
}

export async function createPrefactor(input: {
  tableLabel: string;
  createdBy: StaffRole;
  lines: Array<{
    itemId: string;
    name: string;
    unitPrice: string;
    quantity: number;
  }>;
}): Promise<ActionResult<PrefactorRecord>> {
  await ensureSchema();

  const id = createId();
  const createdAt = new Date().toISOString();
  const lines: PrefactorLineRecord[] = input.lines.map((line) => ({
    id: createId(),
    prefactorId: id,
    itemId: line.itemId,
    name: line.name,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
  }));

  try {
    await db.execute({
      sql: `INSERT INTO Prefactor (id, tableLabel, createdBy, isDelivered, createdAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        id,
        input.tableLabel,
        input.createdBy,
        fromBoolean(false),
        createdAt,
      ],
    });

    for (const line of lines) {
      await db.execute({
        sql: `INSERT INTO PrefactorLine (id, prefactorId, itemId, name, unitPrice, quantity)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          line.id,
          line.prefactorId,
          line.itemId,
          line.name,
          line.unitPrice,
          line.quantity,
        ],
      });
    }

    return ok(
      mapPrefactor(
        {
          id,
          tableLabel: input.tableLabel,
          createdBy: input.createdBy,
          isDelivered: 0,
          createdAt,
        },
        lines,
      ),
    );
  } catch (error) {
    console.error(error);
    return fail("ثبت پیش‌فاکتور ممکن نشد");
  }
}

export async function listPrefactors(range: {
  from: string;
  to: string;
}): Promise<ActionResult<PrefactorRecord[]>> {
  await ensureSchema();

  try {
    const headers = await db.execute({
      sql: `SELECT id, tableLabel, createdBy, isDelivered, createdAt
            FROM Prefactor
            WHERE createdAt >= ? AND createdAt < ?
            ORDER BY createdAt DESC`,
      args: [range.from, range.to],
    });

    const rows = headers.rows as unknown as PrefactorRow[];

    if (rows.length === 0) {
      return ok([]);
    }

    const placeholders = rows.map(() => "?").join(", ");
    const lines = await db.execute({
      sql: `SELECT id, prefactorId, itemId, name, unitPrice, quantity
            FROM PrefactorLine
            WHERE prefactorId IN (${placeholders})`,
      args: rows.map((row) => row.id),
    });

    const grouped = new Map<string, PrefactorLineRecord[]>();

    for (const line of lines.rows as unknown as LineRow[]) {
      const next = grouped.get(line.prefactorId) ?? [];
      next.push({
        id: line.id,
        prefactorId: line.prefactorId,
        itemId: line.itemId,
        name: line.name,
        unitPrice: String(line.unitPrice),
        quantity: Number(line.quantity),
      });
      grouped.set(line.prefactorId, next);
    }

    const ordered = rows
      .map((row) => mapPrefactor(row, grouped.get(row.id) ?? []))
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );

    return ok(ordered);
  } catch (error) {
    console.error(error);
    return fail("بارگذاری پیش‌فاکتورها ممکن نشد");
  }
}

export async function sumPrefactorIncome(range: {
  from: string;
  to: string;
}): Promise<ActionResult<{ total: string; count: number }>> {
  await ensureSchema();

  try {
    const totals = await db.execute({
      sql: `SELECT
              COALESCE(SUM(CAST(PrefactorLine.unitPrice AS REAL) * PrefactorLine.quantity), 0) AS total,
              COUNT(DISTINCT Prefactor.id) AS count
            FROM Prefactor
            LEFT JOIN PrefactorLine ON PrefactorLine.prefactorId = Prefactor.id
            WHERE Prefactor.createdAt >= ? AND Prefactor.createdAt < ?`,
      args: [range.from, range.to],
    });

    const row = totals.rows[0];
    const thousand = Number(row?.total ?? 0);

    return ok({
      total: String(Math.ceil(thousand) * 1000),
      count: Number(row?.count ?? 0),
    });
  } catch (error) {
    console.error(error);
    return fail("جمع دخل ممکن نشد");
  }
}

export async function setPrefactorDelivered(
  id: string,
  isDelivered: boolean,
): Promise<ActionResult<{ id: string; isDelivered: boolean }>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: `SELECT id FROM Prefactor WHERE id = ?`,
      args: [id],
    });

    if (!existing.rows[0]) {
      return fail("پیش‌فاکتور پیدا نشد");
    }

    await db.execute({
      sql: `UPDATE Prefactor SET isDelivered = ? WHERE id = ?`,
      args: [fromBoolean(isDelivered), id],
    });

    return ok({ id, isDelivered });
  } catch (error) {
    console.error(error);
    return fail("به‌روزرسانی تحویل ممکن نشد");
  }
}
