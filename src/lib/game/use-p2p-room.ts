import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomSnapshot } from "@/lib/campaign/types";
import { P2PRoom, type PeerInfo } from "@/lib/multiplayer/p2p";
import { getClientId } from "./client-id";
import { HostEngine, type AbilityOutcome } from "./host-engine";
import { makeRoomCode } from "./ids";
import {
  parseGuestMessage,
  parseHostMessage,
  type GuestToHost,
  type HostToGuest,
} from "./p2p-protocol";

function useClientIdStable() {
  return useMemo(() => getClientId(), []);
}

/** Host tab: owns HostEngine, fans out personalized snapshots over WebRTC. */
export function useHostRoom(code: string | undefined) {
  const clientId = useClientIdStable();
  const engineRef = useRef<HostEngine | null>(null);
  const p2pRef = useRef<P2PRoom | null>(null);
  const peerMapRef = useRef<Map<string, string>>(new Map()); // peerId -> clientId
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const pushAll = useCallback(() => {
    const engine = engineRef.current;
    const p2p = p2pRef.current;
    if (!engine) return;
    setRoom(engine.snapshotFor(clientId));
    if (!p2p) return;
    for (const peer of p2p.peerList()) {
      if (peer.connectionState !== "connected") continue;
      const guestId = peerMapRef.current.get(peer.id) ?? peer.id;
      const msg: HostToGuest = { t: "snapshot", room: engine.snapshotFor(guestId) };
      p2p.send(msg, peer.id);
    }
  }, [clientId]);

  useEffect(() => {
    if (!code || clientId === "ssr") return;
    const upper = code.toUpperCase();
    const engine = new HostEngine(upper, clientId);
    engineRef.current = engine;
    setRoom(engine.snapshotFor(clientId));

    const unsub = engine.subscribe(() => pushAll());

    const p2p = new P2PRoom({
      room: upper,
      selfId: clientId,
      name: "host",
      onPeersChanged: setPeers,
      onConnected: () => setReady(true),
      onMessage: (from, data) => {
        const msg = parseGuestMessage(data);
        if (!msg) return;
        handleGuest(from, msg);
      },
    });
    p2pRef.current = p2p;
    void p2p.join();

    function handleGuest(peerId: string, msg: GuestToHost) {
      const eng = engineRef.current;
      if (!eng) return;

      if (msg.t === "hello") {
        peerMapRef.current.set(peerId, msg.clientId);
        eng.ensureSeat(msg.clientId, msg.displayName ?? "Игрок");
        const snap: HostToGuest = {
          t: "snapshot",
          room: eng.snapshotFor(msg.clientId),
        };
        p2pRef.current?.send(snap, peerId);
        return;
      }

      const client = "clientId" in msg ? msg.clientId : peerMapRef.current.get(peerId);
      if (!client) return;
      peerMapRef.current.set(peerId, client);

      let actionResult: HostToGuest | null = null;

      switch (msg.t) {
        case "claim": {
          const r = eng.claim(client, msg.characterId);
          actionResult = { t: "actionResult", ok: r.ok, error: r.error };
          break;
        }
        case "start": {
          const r = eng.start(client);
          actionResult = { t: "actionResult", ok: r.ok, error: r.error };
          break;
        }
        case "council": {
          eng.setCouncil(msg.on);
          actionResult = { t: "actionResult", ok: true };
          break;
        }
        case "choose": {
          const r = eng.choose(client, msg.choiceId);
          actionResult = { t: "actionResult", ok: r.ok, error: r.error };
          break;
        }
        case "ability": {
          const r = eng.ability(client, msg.abilityId);
          const out: HostToGuest = {
            t: "abilityResult",
            ok: r.ok,
            visibility: r.visibility,
            note: r.note,
            error: r.error,
            publicEvent: r.publicEvent,
            clue: r.clue,
          };
          p2pRef.current?.send(out, peerId);
          pushAll();
          return;
        }
        case "speak": {
          const r = eng.speak(client, msg.text);
          actionResult = { t: "actionResult", ok: r.ok, error: r.error };
          break;
        }
        case "register": {
          const r = eng.register(client, {
            room3: msg.room3,
            room5: msg.room5,
            room7: msg.room7,
            hiddenSeen: msg.hiddenSeen,
          });
          actionResult = { t: "actionResult", ok: r.ok, error: r.error };
          break;
        }
        case "closePuzzle": {
          eng.closePuzzle();
          actionResult = { t: "actionResult", ok: true };
          break;
        }
        default:
          break;
      }

      if (actionResult) p2pRef.current?.send(actionResult, peerId);
      pushAll();
    }

    return () => {
      unsub();
      p2p.close();
      p2pRef.current = null;
      engineRef.current = null;
    };
  }, [code, clientId, pushAll]);

  const claim = useCallback(
    (characterId: string | null) => {
      const r = engineRef.current?.claim(clientId, characterId) ?? {
        ok: false,
        error: "Нет стола",
      };
      pushAll();
      return r;
    },
    [clientId, pushAll],
  );

  const start = useCallback(() => {
    const r = engineRef.current?.start(clientId) ?? { ok: false, error: "Нет стола" };
    pushAll();
    return r;
  }, [clientId, pushAll]);

  const council = useCallback(
    (on: boolean) => {
      engineRef.current?.setCouncil(on);
      pushAll();
      return { ok: true as const };
    },
    [pushAll],
  );

  const choose = useCallback(
    (choiceId: string) => {
      const r = engineRef.current?.choose(clientId, choiceId) ?? {
        ok: false,
        error: "Нет стола",
      };
      pushAll();
      return r;
    },
    [clientId, pushAll],
  );

  const ability = useCallback(
    (abilityId: string): AbilityOutcome => {
      const r = engineRef.current?.ability(clientId, abilityId) ?? {
        ok: false,
        error: "Нет стола",
      };
      pushAll();
      return r;
    },
    [clientId, pushAll],
  );

  const register = useCallback(
    (payload: {
      room3: string;
      room5: string;
      room7: string;
      hiddenSeen: boolean;
    }) => {
      const r = engineRef.current?.register(clientId, payload) ?? {
        ok: false,
        error: "Нет стола",
      };
      pushAll();
      return r;
    },
    [clientId, pushAll],
  );

  const dismissPuzzle = useCallback(() => {
    engineRef.current?.closePuzzle();
    pushAll();
    return { ok: true as const };
  }, [pushAll]);

  return {
    clientId,
    room,
    peers,
    error,
    isLoading: !room && !error,
    ready,
    claim,
    start,
    council,
    choose,
    ability,
    register,
    dismissPuzzle,
  };
}

/** Phone tab: joins host mesh, applies remote snapshots. */
export function useGuestRoom(code: string | undefined) {
  const clientId = useClientIdStable();
  const p2pRef = useRef<P2PRoom | null>(null);
  const hostPeerRef = useRef<string | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastActionError, setLastActionError] = useState<string | null>(null);
  const [lastAbility, setLastAbility] = useState<AbilityOutcome | null>(null);
  const pendingAbility = useRef<{
    resolve: (v: AbilityOutcome) => void;
  } | null>(null);

  const send = useCallback((msg: GuestToHost) => {
    const p2p = p2pRef.current;
    const host = hostPeerRef.current;
    if (!p2p || !host) {
      // Host peer not known yet — broadcast; host will accept
      p2p?.send(msg);
      return;
    }
    p2p.send(msg, host);
  }, []);

  useEffect(() => {
    if (!code || clientId === "ssr") return;
    const upper = code.toUpperCase();
    let cancelled = false;

    const p2p = new P2PRoom({
      room: upper,
      selfId: clientId,
      name: "guest",
      onPeersChanged: (list) => {
        // Prefer a connected peer; any peer in room is the host mesh
        const connected = list.find((p) => p.connectionState === "connected");
        if (connected) hostPeerRef.current = connected.id;
        else if (list[0]) hostPeerRef.current = list[0].id;
      },
      onConnected: () => {
        send({ t: "hello", clientId, displayName: "Игрок" });
      },
      onMessage: (from, data) => {
        hostPeerRef.current = from;
        const msg = parseHostMessage(data);
        if (!msg) return;
        if (msg.t === "snapshot") {
          setRoom(msg.room);
          setError(null);
        } else if (msg.t === "actionResult") {
          if (!msg.ok) setLastActionError(msg.error ?? "Ошибка");
          else setLastActionError(null);
        } else if (msg.t === "abilityResult") {
          const out: AbilityOutcome = {
            ok: msg.ok,
            visibility: msg.visibility,
            note: msg.note,
            error: msg.error,
            publicEvent: msg.publicEvent,
            clue: msg.clue,
          };
          setLastAbility(out);
          pendingAbility.current?.resolve(out);
          pendingAbility.current = null;
        } else if (msg.t === "hostGone") {
          setError("Хост закрыл стол");
        }
      },
    });
    p2pRef.current = p2p;
    void p2p.join().then(() => {
      if (cancelled) return;
      // Retry hello once mesh may have formed
      setTimeout(() => {
        if (!cancelled) send({ t: "hello", clientId, displayName: "Игрок" });
      }, 800);
    });

    const hangTimer = setTimeout(() => {
      if (!cancelled && !room) {
        setError((e) => e ?? "Ждём хоста… Откройте стол на большом экране с тем же кодом.");
      }
    }, 12_000);

    return () => {
      cancelled = true;
      clearTimeout(hangTimer);
      p2p.close();
      p2pRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, clientId, send]);

  const claim = useCallback(
    (characterId: string | null) => {
      send({ t: "claim", clientId, characterId });
      return { ok: true as const };
    },
    [clientId, send],
  );

  const council = useCallback(
    (on: boolean) => {
      send({ t: "council", clientId, on });
      return { ok: true as const };
    },
    [clientId, send],
  );

  const choose = useCallback(
    (choiceId: string) => {
      send({ t: "choose", clientId, choiceId });
      return { ok: true as const };
    },
    [clientId, send],
  );

  const ability = useCallback(
    (abilityId: string) => {
      return new Promise<AbilityOutcome>((resolve) => {
        pendingAbility.current = { resolve };
        send({ t: "ability", clientId, abilityId });
        setTimeout(() => {
          if (pendingAbility.current) {
            pendingAbility.current.resolve({
              ok: false,
              error: "Нет ответа от хоста",
            });
            pendingAbility.current = null;
          }
        }, 8000);
      });
    },
    [clientId, send],
  );

  const speak = useCallback(
    (text: string) => {
      send({ t: "speak", clientId, text });
      return { ok: true as const };
    },
    [clientId, send],
  );

  const register = useCallback(
    (payload: {
      room3: string;
      room5: string;
      room7: string;
      hiddenSeen: boolean;
    }) => {
      send({ t: "register", clientId, ...payload });
      return { ok: true as const };
    },
    [clientId, send],
  );

  const dismissPuzzle = useCallback(() => {
    send({ t: "closePuzzle", clientId });
    return { ok: true as const };
  }, [clientId, send]);

  return {
    clientId,
    room,
    error,
    isLoading: !room && !error,
    lastActionError,
    lastAbility,
    claim,
    council,
    choose,
    ability,
    speak,
    register,
    dismissPuzzle,
  };
}

export function createLocalTableCode() {
  return makeRoomCode();
}
