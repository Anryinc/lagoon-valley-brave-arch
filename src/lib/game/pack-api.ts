import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { defaultPack, type CampaignPack } from "@/lib/campaign/rails";
import { auditPack, cloneDefaultPack, parsePack } from "@/lib/campaign/pack";

export async function loadLivePack(): Promise<CampaignPack> {
  const sql = await getSql();
  try {
    const rows = await sql<{ pack_json: string }>`
      select pack_json from campaign_pack where id = 'live'
    `;
    if (rows[0]?.pack_json) {
      const parsed = parsePack(JSON.parse(rows[0].pack_json));
      if (parsed) return parsed;
    }
  } catch {
    // Table missing on a fresh boot before migrate — fall back to rails.
  }
  return defaultPack();
}

export const getCampaignPack = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
  const pack = await loadLivePack();
  return {
    ok: true as const,
    pack,
    issues: auditPack(pack),
    usingDefault: false,
  };
});

export const saveCampaignPack = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ pack: z.unknown() }).parse(input))
  .handler(async ({ data }) => {
    const pack = parsePack(data.pack);
    if (!pack) return { ok: false as const, error: "Пакет сцены не читается. Проверьте стартовую сцену и поля." };
    const issues = auditPack(pack);
    if (issues.some((i) => i.level === "error")) {
      return {
        ok: false as const,
        error: issues.find((i) => i.level === "error")?.message ?? "В потоке есть ошибка.",
        issues,
      };
    }
    const sql = await getSql();
    const json = JSON.stringify(pack);
    await sql`
      insert into campaign_pack (id, pack_json, updated_at)
      values ('live', ${json}, now())
      on conflict (id) do update set pack_json = excluded.pack_json, updated_at = now()
    `;
    return { ok: true as const, issues };
  });

export const resetCampaignPack = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
  const pack = cloneDefaultPack();
  const sql = await getSql();
  const json = JSON.stringify(pack);
  await sql`
    insert into campaign_pack (id, pack_json, updated_at)
    values ('live', ${json}, now())
    on conflict (id) do update set pack_json = excluded.pack_json, updated_at = now()
  `;
  return { ok: true as const, pack, issues: auditPack(pack) };
});
