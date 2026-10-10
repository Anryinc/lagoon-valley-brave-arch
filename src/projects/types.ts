import type { CampaignPack } from "@/lib/campaign/rails";
import type { LocationDef, NpcDef, RosterCharacter } from "@/lib/campaign/types";

export type ProjectStatus = "draft" | "playable";

export type ProjectManifest = {
  id: string;
  title: string;
  subtitle?: string;
  blurb: string;
  /** Longer pitch on landing page */
  description: string;
  coverImage: string;
  tags: string[];
  playersMin: number;
  playersMax: number;
  estimatedMinutes?: number;
  status: ProjectStatus;
  version: string;
};

export type PlayRules = {
  actionPointsPerRound: 1;
  allowWait: true;
  shareCostsAction: true;
  abilityCostsAction: true;
  /** Clues from share enter basket only for same-location players */
  shareClueScope: "same_location";
  shareDisplayOnHub: true;
  resolutionOrder: "simultaneous_moves_first";
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

/**
 * Bundled project as committed in git.
 * P0: campaign pack + manifest. Graph editor lands in P2/P3.
 */
export type ProjectDefinition = {
  manifest: ProjectManifest;
  rules: PlayRules;
  /** Legacy scene rails — used until graph runtime */
  campaign: CampaignPack;
  roster?: RosterCharacter[];
  locations?: LocationDef[];
  npcs?: NpcDef[];
};

export type ProjectSummary = ProjectManifest;
