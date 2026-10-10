/**
 * Legacy server-poll room hooks kept for Master Studio / optional fallback.
 * Table and phone play now use `@/lib/game/use-p2p-room` (host-authoritative).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  claimCharacter,
  closePuzzle,
  createTable,
  getSnapshot,
  joinTable,
  setCouncil,
  startCase,
  submitChoice,
  submitRegisterPuzzle,
  submitSpeech,
  useAbility,
} from "@/lib/game/api";
import { getClientId } from "./client-id";

export function useClientId() {
  return useMemo(() => getClientId(), []);
}

export function useRoom(code: string | undefined) {
  const clientId = useClientId();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["room", code, clientId],
    enabled: Boolean(code),
    queryFn: async () => {
      const res = await getSnapshot({ data: { code: code!, clientId } });
      if (!res.ok) throw new Error(res.error);
      return res.room;
    },
    refetchInterval: 1100,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["room", code, clientId] });

  const claim = useMutation({
    mutationFn: (characterId: string | null) =>
      claimCharacter({ data: { code: code!, clientId, characterId } }),
    onSettled: invalidate,
  });
  const start = useMutation({
    mutationFn: () => startCase({ data: { code: code!, clientId } }),
    onSettled: invalidate,
  });
  const council = useMutation({
    mutationFn: (on: boolean) =>
      setCouncil({ data: { code: code!, clientId, council: on } }),
    onSettled: invalidate,
  });
  const choose = useMutation({
    mutationFn: (choiceId: string) =>
      submitChoice({ data: { code: code!, clientId, choiceId } }),
    onSettled: invalidate,
  });
  const ability = useMutation({
    mutationFn: (abilityId: string) =>
      useAbility({ data: { code: code!, clientId, abilityId } }),
    onSettled: invalidate,
  });
  const speak = useMutation({
    mutationFn: (text: string) =>
      submitSpeech({ data: { code: code!, clientId, text } }),
    onSettled: invalidate,
  });
  const register = useMutation({
    mutationFn: (payload: {
      room3: string;
      room5: string;
      room7: string;
      hiddenSeen: boolean;
    }) => submitRegisterPuzzle({ data: { code: code!, clientId, ...payload } }),
    onSettled: invalidate,
  });
  const dismissPuzzle = useMutation({
    mutationFn: () => closePuzzle({ data: { code: code!, clientId } }),
    onSettled: invalidate,
  });

  return {
    clientId,
    room: query.data,
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    claim,
    start,
    council,
    choose,
    ability,
    speak,
    register,
    dismissPuzzle,
  };
}

export function useCreateTable() {
  const clientId = useClientId();
  return useMutation({
    mutationFn: () => createTable({ data: { clientId } }),
  });
}

export function useJoinTable() {
  const clientId = useClientId();
  return useMutation({
    mutationFn: (code: string) => joinTable({ data: { code, clientId } }),
  });
}
