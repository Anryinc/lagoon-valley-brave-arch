import { o as __toESM } from "../_runtime.mjs";
import { i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
import { a as string, i as object, t as boolean } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-room-BoalGIlm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var createTable = createServerFn({ method: "POST" }).validator((input) => object({ clientId: string().min(8) }).parse(input)).handler(createSsrRpc("2cf48311b5a2ccc7a7a7f8efacc723899dd7b7c11ba4a3aeca9e34d41953c3d9"));
var joinTable = createServerFn({ method: "POST" }).validator((input) => object({
	code: string().min(4),
	clientId: string().min(8)
}).parse(input)).handler(createSsrRpc("96fd6a010c1e6f2ae1c8aff6ecf40515c1af7781c3d9e190545f3feb6a23b648"));
var getSnapshot = createServerFn({ method: "POST" }).validator((input) => object({
	code: string().min(4),
	clientId: string().min(8)
}).parse(input)).handler(createSsrRpc("6db1106a46fca5a14ec3be313cb2a70293616f3e37993ae0d066f8262b2cf82a"));
var claimCharacter = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	characterId: string().nullable()
}).parse(input)).handler(createSsrRpc("ea354b52744ddbfe76c0a3c80d248bee0897f27bf56631d1780427aff5e85ed9"));
var startCase = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string()
}).parse(input)).handler(createSsrRpc("e064c5d027390403ab08ce1a6aed43acfca58c98c2c602636720854f23eefde0"));
var setCouncil = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	council: boolean()
}).parse(input)).handler(createSsrRpc("6aa701e3f3d7570051a1719784d85869682972f23dc66fc1896c04fe930e7d0a"));
var submitChoice = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	choiceId: string()
}).parse(input)).handler(createSsrRpc("c91b3ed114443ec6c9f35c8d60c9e5eccdb0bea200f476580e477a5e28aca800"));
var useAbility = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	abilityId: string()
}).parse(input)).handler(createSsrRpc("0afaa4c3f93b77fe091a8c14f64aa918fab01e8bd0448fccb6feab3aa4a1f8ef"));
var submitSpeech = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	text: string().min(1).max(400)
}).parse(input)).handler(createSsrRpc("b970f555d25a9cc382e19b769105c1a8492de598713346f4515c006b642a01cf"));
var submitRegisterPuzzle = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	room3: string(),
	room5: string(),
	room7: string(),
	hiddenSeen: boolean()
}).parse(input)).handler(createSsrRpc("d3bca32f97e1b1bbe24a404af655f7f7a764aeb7702abc40467ce4c59718e510"));
var closePuzzle = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string()
}).parse(input)).handler(createSsrRpc("ae31ab8460efd802d80dae932a7b6e638ece8981f52e31a373dcd8affafe59aa"));
var KEY = "cherwood.clientId";
function getClientId() {
	if (typeof window === "undefined") return "ssr";
	let id = sessionStorage.getItem(KEY);
	if (!id) {
		id = crypto.randomUUID();
		sessionStorage.setItem(KEY, id);
	}
	return id;
}
function useClientId() {
	return (0, import_react.useMemo)(() => getClientId(), []);
}
function useRoom(code) {
	const clientId = useClientId();
	const qc = useQueryClient();
	const query = useQuery({
		queryKey: [
			"room",
			code,
			clientId
		],
		enabled: Boolean(code),
		queryFn: async () => {
			const res = await getSnapshot({ data: {
				code,
				clientId
			} });
			if (!res.ok) throw new Error(res.error);
			return res.room;
		},
		refetchInterval: 1100
	});
	const invalidate = () => qc.invalidateQueries({ queryKey: [
		"room",
		code,
		clientId
	] });
	const claim = useMutation({
		mutationFn: (characterId) => claimCharacter({ data: {
			code,
			clientId,
			characterId
		} }),
		onSettled: invalidate
	});
	const start = useMutation({
		mutationFn: () => startCase({ data: {
			code,
			clientId
		} }),
		onSettled: invalidate
	});
	const council = useMutation({
		mutationFn: (on) => setCouncil({ data: {
			code,
			clientId,
			council: on
		} }),
		onSettled: invalidate
	});
	const choose = useMutation({
		mutationFn: (choiceId) => submitChoice({ data: {
			code,
			clientId,
			choiceId
		} }),
		onSettled: invalidate
	});
	const ability = useMutation({
		mutationFn: (abilityId) => useAbility({ data: {
			code,
			clientId,
			abilityId
		} }),
		onSettled: invalidate
	});
	const speak = useMutation({
		mutationFn: (text) => submitSpeech({ data: {
			code,
			clientId,
			text
		} }),
		onSettled: invalidate
	});
	const register = useMutation({
		mutationFn: (payload) => submitRegisterPuzzle({ data: {
			code,
			clientId,
			...payload
		} }),
		onSettled: invalidate
	});
	const dismissPuzzle = useMutation({
		mutationFn: () => closePuzzle({ data: {
			code,
			clientId
		} }),
		onSettled: invalidate
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
		dismissPuzzle
	};
}
function useCreateTable() {
	const clientId = useClientId();
	return useMutation({ mutationFn: () => createTable({ data: { clientId } }) });
}
function useJoinTable() {
	const clientId = useClientId();
	return useMutation({ mutationFn: (code) => joinTable({ data: {
		code,
		clientId
	} }) });
}
//#endregion
export { useRoom as a, useJoinTable as i, joinTable as n, useCreateTable as r, cn as t };
