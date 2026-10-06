import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { a as cloneDefaultPack, c as getSql, l as parsePack, o as defaultPack, r as auditPack } from "./pack-D2uxI2bN.mjs";
import { i as object, s as unknown } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pack-api-BdXgZZDf.js
async function loadLivePack() {
	const sql = await getSql();
	try {
		const rows = await sql`
      select pack_json from campaign_pack where id = 'live'
    `;
		if (rows[0]?.pack_json) {
			const parsed = parsePack(JSON.parse(rows[0].pack_json));
			if (parsed) return parsed;
		}
	} catch {}
	return defaultPack();
}
var getCampaignPack_createServerFn_handler = createServerRpc({
	id: "979d4282013718df238a0b6056f449164cd1994564059a7b2b6477f37e499176",
	name: "getCampaignPack",
	filename: "src/lib/game/pack-api.ts"
}, (opts) => getCampaignPack.__executeServer(opts));
var getCampaignPack = createServerFn({ method: "POST" }).validator(() => ({})).handler(getCampaignPack_createServerFn_handler, async () => {
	const pack = await loadLivePack();
	return {
		ok: true,
		pack,
		issues: auditPack(pack),
		usingDefault: false
	};
});
var saveCampaignPack_createServerFn_handler = createServerRpc({
	id: "b3c0608bc9830a4c6481ca5b7467c7f4e825c6b0d436d11be055b08a535f7c6b",
	name: "saveCampaignPack",
	filename: "src/lib/game/pack-api.ts"
}, (opts) => saveCampaignPack.__executeServer(opts));
var saveCampaignPack = createServerFn({ method: "POST" }).validator((input) => object({ pack: unknown() }).parse(input)).handler(saveCampaignPack_createServerFn_handler, async ({ data }) => {
	const pack = parsePack(data.pack);
	if (!pack) return {
		ok: false,
		error: "Пакет сцены не читается. Проверьте стартовую сцену и поля."
	};
	const issues = auditPack(pack);
	if (issues.some((i) => i.level === "error")) return {
		ok: false,
		error: issues.find((i) => i.level === "error")?.message ?? "В потоке есть ошибка.",
		issues
	};
	await (await getSql())`
      insert into campaign_pack (id, pack_json, updated_at)
      values ('live', ${JSON.stringify(pack)}, now())
      on conflict (id) do update set pack_json = excluded.pack_json, updated_at = now()
    `;
	return {
		ok: true,
		issues
	};
});
var resetCampaignPack_createServerFn_handler = createServerRpc({
	id: "d283d4d0b9414a463205d9d2e53b0f93ca9796e31d02078314323218929120bf",
	name: "resetCampaignPack",
	filename: "src/lib/game/pack-api.ts"
}, (opts) => resetCampaignPack.__executeServer(opts));
var resetCampaignPack = createServerFn({ method: "POST" }).validator(() => ({})).handler(resetCampaignPack_createServerFn_handler, async () => {
	const pack = cloneDefaultPack();
	await (await getSql())`
    insert into campaign_pack (id, pack_json, updated_at)
    values ('live', ${JSON.stringify(pack)}, now())
    on conflict (id) do update set pack_json = excluded.pack_json, updated_at = now()
  `;
	return {
		ok: true,
		pack,
		issues: auditPack(pack)
	};
});
//#endregion
export { getCampaignPack_createServerFn_handler, resetCampaignPack_createServerFn_handler, saveCampaignPack_createServerFn_handler };
