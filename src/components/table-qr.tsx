import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export function playUrl(code: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/play/${code}`;
}

export function TableQr({
  code,
  size = 168,
  compact = false,
}: {
  code: string;
  size?: number;
  compact?: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const href = playUrl(code);

  useEffect(() => {
    if (!href) return;
    let cancelled = false;
    void QRCode.toDataURL(href, {
      margin: 1,
      width: Math.max(size, 192) * 2,
      color: { dark: "#0c0b0a", light: "#d9cbb6" },
      errorCorrectionLevel: "M",
    }).then((url: string) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [href, size]);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-[18px] border border-line bg-paper/95 text-bg",
        compact ? "p-2" : "p-3",
      )}
    >
      {src ? (
        <img
          src={src}
          alt={`QR-код на телефонный стол ${code}`}
          width={size}
          height={size}
          className="shrink-0 rounded-[10px]"
        />
      ) : (
        <div
          className="shrink-0 rounded-[10px] bg-paper-dim/40"
          style={{ width: size, height: size }}
        />
      )}
      {compact ? (
        <p className="max-w-[9rem] text-[11px] leading-snug text-bg/80">
          Телефонный стол
          <span className="mt-1 block font-display text-lg tracking-[0.16em]">{code}</span>
        </p>
      ) : (
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-bg/55">
            Сядьте с телефона
          </p>
          <p className="mt-1 font-display text-2xl leading-tight tracking-[0.14em] text-bg">
            {code}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-bg/70">
            Наведите камеру — откроется личная страница: роль, способности, улики.
          </p>
        </div>
      )}
    </a>
  );
}
