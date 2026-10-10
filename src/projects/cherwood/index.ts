import { defaultPack } from "@/lib/campaign/rails";
import { DEFAULT_PLAY_RULES, type ProjectDefinition } from "../types";
import { cherwoodManifest } from "./manifest";

export const cherwoodProject: ProjectDefinition = {
  manifest: cherwoodManifest,
  rules: DEFAULT_PLAY_RULES,
  campaign: defaultPack(),
};

export { cherwoodManifest };
