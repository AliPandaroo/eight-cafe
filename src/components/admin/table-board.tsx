"use client"

import { useTransition } from "react"

import { TableSeatedTime } from "@/components/admin/table-seated-time"
import { Grid } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  deleteCafeTableAction,
  freeCafeTableAction,
  occupyCafeTableAction,
} from "@/features/table/actions"
import { cn } from "@/utils/classMerge"
import type { CafeTableRecord } from "@/types/table"

function TableActions({
  table,
  canDelete,
}: {
  table: CafeTableRecord
  canDelete: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {table.seatedAt ? (
        <Button
          variant="ghost"
          className="px-2.5 py-1 text-[11px]"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await freeCafeTableAction(table.id)
            })
          }}
        >
          {pending ? "..." : "خالی شد"}
        </Button>
      ) : (
          <Button
          variant="primary"
          className="px-2.5 py-1 text-[11px]"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await occupyCafeTableAction(table.id)
            })
          }}
        >
          {pending ? "..." : "نشستند"}
        </Button>
      )}
      {canDelete ? (
        <Button
          variant="danger"
          className="px-2.5 py-1 text-[11px]"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await deleteCafeTableAction(table.id)
            })
          }}
        >
          حذف
        </Button>
      ) : null}
    </div>
  )
}

export function TableBoard({
  tables,
  canDelete,
  now,
}: {
  tables: CafeTableRecord[]
  canDelete: boolean
  now: number
}) {
  if (tables.length === 0) {
    return <p className="text-sm text-text/70">هنوز میزی تعریف نشده.</p>
  }

  return (
    <Grid cols={2} gap={3} className="sm:grid-cols-3 md:grid-cols-4">
      {tables.map((table) => {
        const empty = !table.seatedAt

        return (
          <div
            key={table.id}
            className={cn(
              "rounded-[var(--radius)] border p-3",
              empty ? "border-foreground/15" : "border-foreground/40 bg-foreground/5",
            )}
          >
            <p className="text-lg font-semibold">{table.number}</p>
            {table.seatedAt ? (
              <TableSeatedTime seatedAt={table.seatedAt} now={now} />
            ) : (
              <p className="text-[11px] text-text/70">خالی</p>
            )}
            <div className="mt-3">
              <TableActions table={table} canDelete={canDelete} />
            </div>
          </div>
        )
      })}
    </Grid>
  )
}
