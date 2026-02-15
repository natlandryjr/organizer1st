"use client";

import { useRef, useCallback } from "react";
import { useZxing } from "react-zxing";

type Props = {
  onScan: (ticketId: string) => void;
};

export function CheckInScanner({ onScan }: Props) {
  const lastScanned = useRef<string | null>(null);
  const cooldownUntil = useRef<number>(0);

  const handleResult = useCallback(
    (result: { getText: () => string }) => {
      const text = result.getText()?.trim();
      if (!text) return;

      const now = Date.now();
      if (now < cooldownUntil.current) return;
      if (lastScanned.current === text) return;

      lastScanned.current = text;
      cooldownUntil.current = now + 2000;

      onScan(text);
    },
    [onScan]
  );

  const { ref } = useZxing({
    onResult: handleResult,
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
  });

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      muted
      playsInline
      autoPlay
    />
  );
}
