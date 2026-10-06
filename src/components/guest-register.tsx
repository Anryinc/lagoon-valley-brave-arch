import { useState } from "react";
import { cn } from "@/lib/utils";

const NAMES = [
  { id: "voss", label: "А. Восс" },
  { id: "pell", label: "Г. Пелл" },
  { id: "mills", label: "Э. Миллс" },
  { id: "grange", label: "Х. Грейндж" },
];

export function GuestRegister({
  onSolve,
  onClose,
  busy,
  error,
}: {
  onSolve: (payload: {
    room3: string;
    room5: string;
    room7: string;
    hiddenSeen: boolean;
  }) => void;
  onClose: () => void;
  busy?: boolean;
  error?: string | null;
}) {
  const [lamp, setLamp] = useState<"gas" | "night">("gas");
  const [room3, setRoom3] = useState("");
  const [room5, setRoom5] = useState("");
  const [room7, setRoom7] = useState("");
  const hiddenSeen = lamp === "night";

  return (
    <div className="flex h-full flex-col bg-bg/92 text-ink">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="font-display text-2xl text-paper">Реестр «Серебряной чайки»</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            Обычная лампа показывает то, что хозяйка хочет. Другой свет — то, что
            писали поверх.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted"
        >
          Закрыть
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLamp("gas")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider",
              lamp === "gas"
                ? "border-brass bg-brass/20 text-paper"
                : "border-line text-muted",
            )}
          >
            Газовая лампа
          </button>
          <button
            type="button"
            onClick={() => setLamp("night")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider",
              lamp === "night"
                ? "border-night bg-night/20 text-paper"
                : "border-line text-muted",
            )}
          >
            Синий свет
          </button>
        </div>

        <div
          className={cn(
            "rounded-[20px] border p-4 font-display shadow-inner",
            lamp === "night"
              ? "border-night/40 bg-[#121820] text-paper"
              : "border-brass/30 bg-[#d9cbb6] text-[#2a241c]",
          )}
        >
          <p className="text-sm uppercase tracking-[0.2em] opacity-70">
            Пансион · жильцы осени
          </p>
          <div className="mt-4 space-y-3 text-lg">
            <p>к. 3 — {lamp === "night" ? "Э. Миллс, ночь на фабрике" : "…………"}</p>
            <p>к. 5 — {lamp === "night" ? "Г. Пелл (оплачено)" : "Г. Пелл"}</p>
            <p>к. 7 — {lamp === "night" ? "А. Восс — передано в книгу" : "А. Восс"}</p>
            <p className={cn("italic", lamp === "night" ? "text-night" : "opacity-40")}>
              {lamp === "night"
                ? "Пятница. Подвал. Тихий гость. Имя пробуют пером."
                : "поля выцвели"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted">
          Сопоставьте комнаты с именами, как вы поняли по дому и книге.
        </p>
        <div className="grid gap-3">
          {(
            [
              { num: "3", value: room3, set: setRoom3 },
              { num: "5", value: room5, set: setRoom5 },
              { num: "7", value: room7, set: setRoom7 },
            ] as const
          ).map((row) => (
            <label key={row.num} className="flex items-center gap-3">
              <span className="w-16 font-display text-paper">к. {row.num}</span>
              <select
                value={row.value}
                onChange={(e) => row.set(e.target.value)}
                className="h-11 flex-1 rounded-[12px] border border-line bg-surface px-3 text-sm text-ink"
              >
                <option value="">не знаю</option>
                {NAMES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="button"
          disabled={busy || !room3 || !room5 || !room7}
          onClick={() =>
            onSolve({
              room3,
              room5,
              room7,
              hiddenSeen,
            })
          }
          className="h-12 rounded-[16px] bg-paper text-sm font-medium text-bg disabled:opacity-40"
        >
          Сверить книгу
        </button>
      </div>
    </div>
  );
}
