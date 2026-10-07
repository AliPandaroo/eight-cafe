import { TableBoard } from "@/components/admin/tables/board";
import { TableForm } from "@/components/admin/tables/form";
import { Stack } from "@/components/layout";
import { requireStaff } from "@/lib/admin/session";
import { formatInteger } from "@/lib/format";
import { listCafeTables } from "@/lib/table/store";

export default async function AdminTablesPage() {
  const session = await requireStaff();
  const tables = await listCafeTables();
  const items = tables.ok ? tables.data : [];
  const emptyCount = items.filter((table) => !table.seatedAt).length;

  return (
    <Stack gap={6} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">میزها</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          با «نشستند» ساعت الان ثبت می‌شود. سفارش روی میز هم همان میز را اشغال
          می‌کند. بیرون‌بر میز نیست.
        </p>
        <p className="text-sm text-text/70">
          {formatInteger(emptyCount)} میز خالی از {formatInteger(items.length)}
        </p>
      </Stack>

      {session.role === "manager" ? (
        <div className="max-w-sm rounded-(--radius) border border-foreground/15 p-3">
          <TableForm />
        </div>
      ) : null}

      {!tables.ok ? (
        <p className="text-sm text-red-200">{tables.error}</p>
      ) : null}

      <TableBoard
        tables={items}
        canDelete={session.role === "manager"}
        now={new Date().getTime()}
      />
    </Stack>
  );
}
