/** Platform-level project types. Content lives under content/projects/ (git). */

export type ProjectStatus = "draft" | "playable";

export type ProjectManifest = {
  id: string;
  title: string;
  subtitle?: string;
  blurb: string;
  coverImage: string;
  tags: string[];
  playersMin: number;
  playersMax: number;
  estimatedMinutes?: number;
  status: ProjectStatus;
  version: string;
  /** Starting location for personal play (P1+). */
  entryLocationId?: string;
};

/** Locked play rules from the agreed TZ. */
export type PlayRules = {
  actionPointsPerRound: 1;
  allowWait: true;
  shareCostsAction: true;
  abilityCostsAction: true;
  /** Clue enters inventory only for players in the same location. */
  shareClueScope: "same_location";
  /** Hub PC may still display the share payload. */
  shareDisplayOnHub: true;
  resolutionOrder: "simultaneous_moves_first";
  /** No timer — round advances when every seat submitted an intent. */
  timerSeconds: null;
  visibilityDefault: "private";
};

export const DEFAULT_PLAY_RULES: PlayRules = {
  actionPointsPerRound: 1,
  allowWait: true,
  shareCostsAction: true,
  abilityCostsAction: true,
  shareClueScope: "same_location",
  shareDisplayOnHub: true,
  resolutionOrder: "simultaneous_moves_first",
  timerSeconds: null,
  visibilityDefault: "private",
};
