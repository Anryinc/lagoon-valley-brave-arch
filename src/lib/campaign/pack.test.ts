import assert from "node:assert/strict";
import test from "node:test";
import { applyChoice, defaultPack, presentScene } from "./rails.ts";
import { auditPack, cloneDefaultPack } from "./pack.ts";

test("default act I has no flow errors", () => {
  const issues = auditPack(cloneDefaultPack());
  assert.equal(
    issues.filter((i) => i.level === "error").length,
    0,
    issues.map((i) => i.message).join("; "),
  );
});

test("street choices are clickable and enter reaches parlor then hallway", () => {
  const pack = defaultPack();
  const street = presentScene("street", {}, pack);
  assert.ok(street.choices.some((c) => c.id === "enter"));
  assert.ok(street.choices.some((c) => c.id === "talk_widow"));
  const afterEnter = applyChoice("street", "enter", {}, pack);
  assert.equal(afterEnter.presentation.sceneId, "parlor");
  const afterUp = applyChoice("parlor", "upstairs", afterEnter.flags, pack);
  assert.equal(afterUp.presentation.sceneId, "hallway");
  const afterRoom = applyChoice("hallway", "room7", afterUp.flags, pack);
  assert.equal(afterRoom.presentation.sceneId, "room7");
});

test("basement unlocks after talking to Hattie, ending exists", () => {
  const pack = defaultPack();
  const asked = applyChoice("parlor", "ask_hattie", {}, pack);
  assert.ok(asked.presentation.choices.some((c) => c.id === "to_basement"));
  const down = applyChoice("parlor", "to_basement", asked.flags, pack);
  assert.equal(down.presentation.sceneId, "basement");
  const end = applyChoice("basement", "end_night", down.flags, pack);
  assert.equal(end.presentation.sceneId, "ending");
  assert.ok(end.presentation.choices.length >= 1);
});
