"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { markPrefactorDeliveredAction } from "@/features/prefactor/actions";

export function PrefactorDeliverButton({
  id,
  isDelivered,
}: {
  id: string;
  isDelivered: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className="px-2 py-1 text-[11px]"
      disabled={pending || isDelivered}
      onClick={() => {
        startTransition(async () => {
          await markPrefactorDeliveredAction(id);
        });
      }}
    >
      {pending ? "..." : "تحویل داده شد"}
    </Button>
  );
}
