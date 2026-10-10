import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MasterStudio } from "@/components/master-studio";
import { createLocalTableCode } from "@/lib/game/use-p2p-room";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [tab, setTab] = useState<"table" | "master">("table");

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <nav className="relative z-20 flex justify-center gap-2 px-4 pt-4">
        {(
          [
            ["table", "Стол"],
            ["master", "Мастер"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-10 rounded-full border px-4 text-xs uppercase tracking-[0.18em]",
              tab === id
                ? "border-paper bg-paper text-bg"
                : "border-line bg-bg/40 text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "master" ? <MasterStudio /> : <TableLanding />}
    </div>
  );
}

function TableLanding() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden">
      <img
        src="/art/locations/street.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col justify-end px-5 pb-10 pt-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brass">
          Бекленд · 1349 · Червуд-боро
        </p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-paper md:text-6xl">
          Червудский свидетель
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Детектив за одним столом в мире Повелителя тайн. Большой экран — хост
          сцены (состояние в этой вкладке). Телефоны подключаются по WebRTC:
          роль, способности и то, что нельзя показывать остальным.
        </p>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              const next = createLocalTableCode();
              void navigate({ to: "/table/$code", params: { code: next } });
            }}
            className="h-12 rounded-[18px] bg-paper text-sm font-medium text-bg"
          >
            Открыть стол на этом экране
          </button>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              const c = code.trim().toUpperCase();
              if (c.length < 4) {
                setError("Введите код стола с большого экрана");
                return;
              }
              void navigate({ to: "/play/$code", params: { code: c } });
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Код стола"
              className="h-12 flex-1 rounded-[18px] border border-line bg-bg/70 px-4 font-display text-xl tracking-[0.2em] text-paper placeholder:text-faint"
              autoCapitalize="characters"
              autoComplete="off"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="h-12 rounded-[18px] border border-line px-4 text-sm text-paper"
            >
              Сесть
            </button>
          </form>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-faint">
          Хост открывает стол на ноутбуке или телевизоре — там QR и код. Остальные
          наводят камеру или вводят код. Пока вкладка хоста открыта, стол жив; БД
          на конкретном компе не нужна.
        </p>
      </div>
    </main>
  );
}
