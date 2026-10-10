/** Wire messages between host engine and guest phones over WebRTC reliable channel. */

import type {
  AbilityVisibility,
  CluePublic,
  PrivateNote,
  RoomSnapshot,
} from "@/lib/campaign/types";

export type GuestToHost =
  | { t: "hello"; clientId: string; displayName?: string }
  | { t: "claim"; clientId: string; characterId: string | null }
  | { t: "start"; clientId: string }
  | { t: "council"; clientId: string; on: boolean }
  | { t: "choose"; clientId: string; choiceId: string }
  | { t: "ability"; clientId: string; abilityId: string }
  | { t: "speak"; clientId: string; text: string }
  | {
      t: "register";
      clientId: string;
      room3: string;
      room5: string;
      room7: string;
      hiddenSeen: boolean;
    }
  | { t: "closePuzzle"; clientId: string }
  | { t: "ping" };

export type HostToGuest =
  | { t: "snapshot"; room: RoomSnapshot }
  | {
      t: "abilityResult";
      ok: boolean;
      visibility?: AbilityVisibility;
      note?: Pick<PrivateNote, "title" | "body">;
      error?: string;
      publicEvent?: string;
      clue?: CluePublic;
    }
  | { t: "actionResult"; ok: boolean; error?: string }
  | { t: "hostGone" };

export function parseGuestMessage(raw: unknown): GuestToHost | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as { t?: string };
  if (typeof m.t !== "string") return null;
  return raw as GuestToHost;
}

export function parseHostMessage(raw: unknown): HostToGuest | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as { t?: string };
  if (typeof m.t !== "string") return null;
  return raw as HostToGuest;
}
