export type AbilityVisibility = "private" | "public";

export type Ability = {
  id: string;
  name: string;
  summary: string;
  detail: string;
  visibility: AbilityVisibility;
};

export type RosterCharacter = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  pathwayName: string;
  pathwayPlain: string;
  quote: string;
  portrait: string | null;
  fallbackTone: string;
  mark: string;
  abilities: Ability[];
};

export type LocationDef = {
  id: string;
  name: string;
  image: string | null;
};

export type NpcDef = {
  id: string;
  name: string;
  role: string;
  portrait: string | null;
  fallbackTone: string;
};

export type ChoicePublic = {
  id: string;
  label: string;
};

export type CluePublic = {
  id: string;
  title: string;
  body: string;
  source: string;
};

export type PrivateNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type SeatPublic = {
  clientId: string;
  displayName: string;
  characterId: string | null;
};

export type RoomStatus = "lobby" | "playing";

export type RoomSnapshot = {
  code: string;
  isHost: boolean;
  status: RoomStatus;
  council: boolean;
  sceneId: string;
  locationId: string;
  locationName: string;
  speakerId: string | null;
  speakerName: string | null;
  speakerPortrait: string | null;
  speakerTone: string | null;
  narration: string;
  lastPublicEvent: string | null;
  choices: ChoicePublic[];
  seats: SeatPublic[];
  myCharacterId: string | null;
  myNotes: PrivateNote[];
  clues: CluePublic[];
  puzzleId: string | null;
  takenCharacterIds: string[];
  seatedCount: number;
  usedAbilityIds: string[];
};
