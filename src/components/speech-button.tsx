import { Mic, MicOff } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

function makeRec(): Rec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

export function SpeechButton({
  disabled,
  onConfirm,
}: {
  disabled?: boolean;
  onConfirm: (text: string) => void;
}) {
  const recRef = useRef<Rec | null>(null);
  const [holding, setHolding] = useState(false);
  const [heard, setHeard] = useState("");
  const [supported, setSupported] = useState(true);

  function start() {
    if (disabled) return;
    const rec = makeRec();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.lang = "ru-RU";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      const t = last?.[0]?.transcript ?? "";
      setHeard(t);
    };
    rec.onend = () => setHolding(false);
    recRef.current = rec;
    setHolding(true);
    rec.start();
  }

  function stop() {
    recRef.current?.stop();
    setHolding(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={holding ? stop : undefined}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-[16px] border text-sm",
          holding
            ? "border-danger bg-danger/15 text-paper"
            : "border-line bg-surface text-ink",
          disabled && "opacity-40",
        )}
      >
        {disabled ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        {disabled
          ? "Мастер не слушает"
          : holding
            ? "Говорите…"
            : "Удерживайте, чтобы сказать"}
      </button>
      {!supported ? (
        <TextFallback onConfirm={onConfirm} disabled={disabled} />
      ) : heard ? (
        <div className="rounded-[16px] border border-line bg-raised p-3">
          <p className="text-[11px] uppercase tracking-wider text-faint">
            Мастер услышал
          </p>
          <p className="mt-1 font-display text-lg text-paper">{heard}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-10 flex-1 rounded-[12px] bg-paper text-sm text-bg"
              onClick={() => {
                onConfirm(heard);
                setHeard("");
              }}
            >
              Подтвердить
            </button>
            <button
              type="button"
              className="h-10 rounded-[12px] border border-line px-3 text-sm text-muted"
              onClick={() => setHeard("")}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <TextFallback onConfirm={onConfirm} disabled={disabled} />
      )}
    </div>
  );
}

function TextFallback({
  onConfirm,
  disabled,
}: {
  onConfirm: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = text.trim();
        if (!t) return;
        onConfirm(t);
        setText("");
      }}
    >
      <input
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        placeholder="Или напишите действие"
        className="h-11 flex-1 rounded-[12px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-faint"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="h-11 rounded-[12px] border border-line px-3 text-sm text-paper disabled:opacity-40"
      >
        Сказать
      </button>
    </form>
  );
}
