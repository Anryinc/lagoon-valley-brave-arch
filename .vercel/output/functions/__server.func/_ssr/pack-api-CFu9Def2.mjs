import { t as createServerFn } from "./ssr.mjs";
import { c as getSql, l as parsePack, o as defaultPack } from "./pack-D2uxI2bN.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
import { i as object, s as unknown } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pack-api-CFu9Def2.js
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
var getCampaignPack = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("979d4282013718df238a0b6056f449164cd1994564059a7b2b6477f37e499176"));
var saveCampaignPack = createServerFn({ method: "POST" }).validator((input) => object({ pack: unknown() }).parse(input)).handler(createSsrRpc("b3c0608bc9830a4c6481ca5b7467c7f4e825c6b0d436d11be055b08a535f7c6b"));
var resetCampaignPack = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("d283d4d0b9414a463205d9d2e53b0f93ca9796e31d02078314323218929120bf"));
//#endregion
export { saveCampaignPack as i, loadLivePack as n, resetCampaignPack as r, getCampaignPack as t };
