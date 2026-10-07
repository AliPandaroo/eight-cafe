"use client";

import { useRef } from "react";
import { useQRCode } from "next-qrcode";

import { Grid, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";

function QrCard({ title, href }: { title: string; href: string }) {
  const { Canvas } = useQRCode();
  const frameRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = frameRef.current?.querySelector("canvas");

    if (!canvas) {
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${title}.png`;
    link.click();
  }

  return (
    <div className="rounded-(--radius) border border-foreground/15 p-3">
      <Stack gap={2}>
        <p className="text-sm">{title}</p>
        <p
          className="box-content line-clamp-1 text-[10px] break-all text-text/55"
          dir="ltr"
        >
          {href}
        </p>
        <div
          ref={frameRef}
          className="mx-auto mt-4 overflow-hidden rounded-(--radius) bg-white p-2"
        >
          <Canvas
            text={href}
            options={{
              errorCorrectionLevel: "M",
              margin: 2,
              width: 180,
              color: {
                dark: "#202020FF",
                light: "#FFFFFFFF",
              },
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="self-center px-2.5 py-1 text-[11px]"
          onClick={download}
        >
          دانلود
        </Button>
      </Stack>
    </div>
  );
}

export function SettingsQrCodes({ origin }: { origin: string }) {
  if (!origin) {
    return null;
  }

  const codes = [
    { title: "منو", href: `${origin}/` },
    { title: "ورود گارسون", href: `${origin}/admin/login?role=waiter` },
    { title: "ورود مدیر", href: `${origin}/admin/login?role=manager` },
    {
      title: "لوکیشن",
      href: "https://neshan.org/maps/places/QbWDrXYBJeX_#c37.287-49.575-16z-0p",
    },
  ];

  return (
    <Stack
      gap={3}
      className="max-w-5xl rounded-(--radius) border border-foreground/15 p-3"
    >
      <Stack gap={1}>
        <h2 className="text-sm font-semibold">کد QR</h2>
        <p className="text-justify text-xs text-text/70">
          این کدها منقضی نمی‌شوند. روی میز یا در ورودی چاپ کنید.
        </p>
      </Stack>
      <Grid cols={1} gap={3} className="md:grid-cols-4">
        {codes.map((code) => (
          <QrCard key={code.href} title={code.title} href={code.href} />
        ))}
      </Grid>
    </Stack>
  );
}
