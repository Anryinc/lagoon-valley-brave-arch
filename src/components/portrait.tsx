import { cn } from "@/lib/utils";

export function Portrait({
  src,
  name,
  tone,
  className,
  mark,
}: {
  src: string | null;
  name: string;
  tone?: string | null;
  className?: string;
  mark?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        !src && `bg-gradient-to-b ${tone ?? "from-[#1a1814] to-[#0c0b0a]"}`,
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover object-[center_18%]"
        />
      ) : (
        <div className="flex h-full flex-col justify-end p-3">
          {mark ? (
            <p className="mb-auto font-display text-[11px] uppercase tracking-[0.22em] text-brass">
              {mark}
            </p>
          ) : null}
          <p className="font-display text-xl leading-tight text-paper">{name}</p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/10" />
    </div>
  );
}
