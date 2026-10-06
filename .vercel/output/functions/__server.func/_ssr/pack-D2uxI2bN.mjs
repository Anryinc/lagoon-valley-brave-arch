import { n as LOCATION_BY_ID } from "./locations-Dl_Cn8V3.mjs";
import { i as ROSTER_BY_ID, n as NPC_BY_ID } from "./roster-Cd5W4G4t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pack-D2uxI2bN.js
var _0002_tables_default = "-- Shared campaign tables. Unowned rows keyed by room code (auth off).\ncreate table if not exists rooms (\n  code text primary key,\n  host_client_id text not null,\n  status text not null default 'lobby',\n  council boolean not null default false,\n  scene_id text not null default 'lobby',\n  location_id text not null default 'street',\n  speaker_id text,\n  narration text not null default '',\n  choices_json text not null default '[]',\n  flags_json text not null default '{}',\n  public_log_json text not null default '[]',\n  clues_json text not null default '[]',\n  puzzle_id text,\n  last_public_event text,\n  updated_at timestamptz not null default now(),\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists seats (\n  id text primary key,\n  room_code text not null references rooms(code),\n  client_id text not null,\n  display_name text not null,\n  character_id text,\n  last_seen timestamptz not null default now(),\n  unique (room_code, client_id)\n);\n\ncreate unique index if not exists seats_character_lock\n  on seats (room_code, character_id)\n  where character_id is not null;\n\ncreate table if not exists private_notes (\n  id text primary key,\n  room_code text not null,\n  client_id text not null,\n  title text not null,\n  body text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists private_notes_owner_idx\n  on private_notes (room_code, client_id, created_at desc);\n";
var _0003_campaign_pack_default = "-- Live campaign overlay. Unowned (auth off): the table is the GM's notebook.\ncreate table if not exists campaign_pack (\n  id text primary key,\n  pack_json text not null,\n  updated_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_tables.sql": _0002_tables_default,
			"/migrations/0003_campaign_pack.sql": _0003_campaign_pack_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var CLUES = {
	widow_story: {
		id: "widow_story",
		title: "Муж, который забыл жену",
		body: "Артур Восс утром не узнал Клару. Затем вышел в туман и не вернулся. Комната 7 всё ещё числится за ним.",
		source: "Клара Восс"
	},
	sleepless_window: {
		id: "sleepless_window",
		title: "Окно, которое не гасло",
		body: "Окно комнаты 7 не спало всю ночь: копоть на стекле изнутри, фитиль выжжен до нуля.",
		source: "Наблюдение с улицы"
	},
	pell_empty: {
		id: "pell_empty",
		title: "Жилец без середины",
		body: "Гарольд Пелл ходит, платит и здоровается. Внутри нет того, кто помнит своё имя дольше минуты.",
		source: "Коридор"
	},
	ink_stain: {
		id: "ink_stain",
		title: "Чернила не для писем",
		body: "На столе в комнате 7 чернильное пятно. Запах — не канцелярия: металл, зола и что-то сладкое, как дешёвое вино.",
		source: "Комната 7"
	},
	torn_page: {
		id: "torn_page",
		title: "Вырванная страница",
		body: "Из дешёвой тетради вырван лист. По обрывку видно расчерченные графы, как в книге постояльцев.",
		source: "Комната 7"
	},
	temperance: {
		id: "temperance",
		title: "Общество трезвости",
		body: "Листовка: «Пятница. Подвал. Тихий гость приветствуется.» Оборот пуст для обычного глаза.",
		source: "Комната 7 / реестр"
	},
	hidden_ink: {
		id: "hidden_ink",
		title: "Исчезающие имена",
		body: "Синий свет проявляет в реестре строку, которой нет при лампе: сеанс в подвале и имя, которого хозяйка не произносит.",
		source: "Реестр гостей"
	}
};
var DEFAULT_ABILITY = {
	title: "Ничего ясного",
	body: "Этой способности здесь не за что зацепиться. Попробуйте в другой комнате или после нового разговора."
};
var SCENES = {
	street: {
		id: "street",
		locationId: "street",
		speakerId: "clara",
		narration: "Червуд-боро, октябрь, час, когда газовые фонари уже важнее солнца. Туман стоит стеной. Над дверью четырёхэтажного кирпичного дома качается вывеска — чайка, давно не серебряная. Под фонарём женщина в чёрном держит сложенное письмо так, будто это единственная твёрдая вещь в городе. «Вы из бюро? — голос ровный, глаз нет. — Мой муж сегодня утром спросил, как меня зовут. Потом надел пальто и ушёл в туман. Комната седьмая. Хозяйка говорит, он просто запил.»",
		choices: [
			{
				id: "talk_widow",
				label: "Выслушать вдову здесь, на улице",
				stayNarration: "Клара кивает, как человек, которому уже нечего терять при свидетелях. «Артур — машинист паровой компании. Тихий. Не пил. Вчера вечером пошёл на “собрание трезвости”, которое хвалила хозяйка. Утром он смотрел на меня, как на чужую женщину в своей постели. Потом извинился. Перед кем — не поняла.» Она протягивает письмо: почерк мужа, две строки, оборванные на полуслове. «Войдите. Я не хочу стоять под этим окном.»",
				staySpeakerId: "clara",
				setFlags: ["heard_widow"],
				hideIfFlag: "heard_widow",
				clue: CLUES.widow_story
			},
			{
				id: "watch_house",
				label: "Осмотреть фасад, не входя",
				stayNarration: "Дом держится. Водостоки ржавые, ступени вытерты тысячами ног. В окнах второго этажа темно — кроме одного, на углу, где стекло изнутри покрыто копотью, будто фитиль чадил до утра. Вывеска скрипит. Из щели двери тянет сыростью и дешёвым чаем.",
				staySpeakerId: "narrator",
				setFlags: ["saw_facade"],
				hideIfFlag: "saw_facade",
				clue: CLUES.sleepless_window
			},
			{
				id: "enter",
				label: "Войти в пансион",
				nextSceneId: "parlor"
			},
			{
				id: "linger",
				label: "Постоять под вывеской ещё минуту",
				stayNarration: "Клара не уходит. Туман наползает на ступени. Окно на углу всё так же мутное. Улица больше ничего не скажет, пока вы не переступите порог.",
				staySpeakerId: "clara"
			}
		],
		abilityResults: {
			night_sight: {
				title: "Окно, которое не спало",
				body: "Комната на углу второго этажа горела всю ночь. Копоть на стекле изнутри — фитиль выжгли до нуля. По подоконнику кто-то ходил: след ладони, потом его пытались стереть. С улицы этого не видно без вашего зрения.",
				clue: CLUES.sleepless_window
			},
			spirit_sight: {
				title: "Дыра в доме",
				body: "Дом стоит. Внутри него — нет. На уровне второго этажа, угол, ощущение вырванного зуба: из кого-то недавно вынули кусок, и дом это запомнил. С подвала тянет не плесенью, а пустой вежливостью."
			},
			storm_bones: {
				title: "Погода врёт",
				body: "Туман обычный, лоэнский. Под ним — нет. Кости ноют так, как на палубе перед штормом, которого нет на карте. Беда уже в доме, не на улице."
			},
			clipping: {
				title: "Заметка, которую не перепечатали",
				body: "На прошлой неделе утренний выпуск коротко писал: «Жилец Червуда забывает имя жены — врач советует меньше джина». Редактор снял продолжение без объяснений. Адрес в заметке — этот дом."
			},
			read_face: {
				title: "Вдова не играет",
				body: "Клара не врёт и почти не надеется. Страх у неё не театральный: она боится не смерти мужа, а того, что он всё ещё ходит. Когда она смотрит на верхнее окно, зрачки сужаются — там для неё уже чужой дом."
			}
		},
		defaultAbility: DEFAULT_ABILITY
	},
	parlor: {
		id: "parlor",
		locationId: "parlor",
		speakerId: "hattie",
		narration: "Гостиная пахнет сырыми обоями и дешёвым чаем. Газовая люстра шипит. Хозяйка пансиона — Хэтти Грейндж — стоит у бюро с ключами на поясе, как судья маленького королевства. «Найтхоков мне не надо. И репортёров. Восс ушёл сам. Пелл простужен. Реестр — моя книга, не ваша. Если нужна комната — платите. Если нужна правда — её здесь на всех не хватит.»",
		choices: [
			{
				id: "ask_hattie",
				label: "Расспросить хозяйку о жильцах",
				stayNarration: "Хэтти говорит быстро, как человек, который уже репетировал. «Восс. Пелл. Миллс на фабрике до ночи. Я. Больше никто. Трезвость? Благотворительная встреча в пятницу, внизу, чай без рома. Церковь Ночи уже спрашивала. Я сказала: алкоголь. Они обрадовались, что не их юрисдикция.» Пальцы на ключах белеют, когда она произносит слово «внизу».",
				staySpeakerId: "hattie",
				setFlags: ["asked_hattie"],
				hideIfFlag: "asked_hattie"
			},
			{
				id: "ask_register",
				label: "Потребовать реестр гостей",
				stayNarration: "Хэтти долго смотрит, потом кладёт на стол толстую книгу в засаленной коже. «Не унесёте. Смотрите здесь.» Чернила местами бледнее бумаги. Страницы пахнут не только железом чернил.",
				staySpeakerId: "hattie",
				opensPuzzle: "register",
				setFlags: ["has_register"],
				hideIfFlag: "has_register"
			},
			{
				id: "open_register",
				label: "Снова открыть реестр",
				stayNarration: "Книга снова на бюро. Хэтти не спорит. «Смотрите. Только не уносите.»",
				staySpeakerId: "hattie",
				opensPuzzle: "register",
				requiresFlag: "has_register",
				hideIfFlag: "register_solved"
			},
			{
				id: "curtain",
				label: "Отодвинуть штору у узкой двери",
				stayNarration: "За шторой — лестница вниз. Холод и сладковатые чернила, как в плохом сне о кабинете. Дверь внизу закрыта. Хэтти делает вид, что не видит, куда вы смотрите. «Это погреб. Картошка. Вы за картошкой пришли?»",
				staySpeakerId: "hattie",
				setFlags: ["saw_curtain"],
				hideIfFlag: "saw_curtain"
			},
			{
				id: "upstairs",
				label: "Подняться на второй этаж",
				nextSceneId: "hallway"
			},
			{
				id: "to_basement",
				label: "Спуститься к подвалу",
				nextSceneId: "basement",
				requiresAnyFlags: [
					"register_solved",
					"saw_pipe",
					"saw_curtain",
					"asked_hattie"
				]
			}
		],
		abilityResults: {
			read_face: {
				title: "Хэтти держит чужой секрет",
				body: "Она врёт не о Воссе — о пятнице. Когда говорит «чай без рома», уголок рта идёт вниз: она знает, что в подвале не чай. Страх не перед вами. Страх перед тем, кто велел ей так говорить."
			},
			hold_gaze: {
				title: "Чужой почерк в хозяйке",
				body: "Под раздражением — чужая спокойная рука. Хэтти не загипнотизирована насовсем: ей внушили одну фразу и оставили жить. Фраза: «Реестр не отдавать ночью». Голова у вас тяжелеет, во рту вкус меди.",
				setFlags: ["hattie_suggested"]
			},
			press_pass: {
				title: "Корочка открывает рот",
				body: "«Backlund Morning Post». Хэтти бледнеет так, как не бледнела от угрозы Церкви. «Не пишите адрес. Жильцы разъедутся. Хорошо. Книга на столе. Пять минут.»",
				publicEvent: "Джулиан кладёт на бюро удостоверение прессы. Хозяйка, споткнувшись о скандал, кладёт реестр на стол.",
				opensPuzzle: "register",
				setFlags: ["has_register"]
			},
			spirit_sight: {
				title: "След на ковре",
				body: "От двери к бюро — слабый липкий след, не грязь. По нему ходили люди, у которых внутри уже меньше, чем должно быть. След ведёт не наверх. К узкой двери за шторой, вниз."
			}
		},
		defaultAbility: DEFAULT_ABILITY
	},
	hallway: {
		id: "hallway",
		locationId: "hallway",
		speakerId: "pell",
		narration: "Коридор второго этажа уже, чем память о нём. Одна газовая форсунка. Ковровая дорожка вытерта до ниток. Из комнаты 5 выходит мужчина в аккуратном костюме. Улыбается вовремя. «Добрый вечер. Вы на сеанс? Я Пелл. Я…» Он моргает. «Простите, как вас зовут? И меня, кстати, тоже. Шутка. Гарольд Пелл. Комната пятая. Я живу здесь давно. Кажется.»",
		choices: [
			{
				id: "talk_pell",
				label: "Заговорить с Пеллом",
				stayNarration: "Пелл охотно отвечает и теряет нить на третьем предложении. Жену зовёт то Мэй, то никак. Про Восса: «Он писал в книгу. Имя. Своё. Потом не своё.» Смеётся пусто. «В пятницу внизу тихо. Тихий гость. Мне сказали, я уже почти готов.» Он поправляет галстук идеально. Глаза не участвуют.",
				staySpeakerId: "pell",
				clue: CLUES.pell_empty,
				setFlags: ["met_pell"],
				hideIfFlag: "met_pell"
			},
			{
				id: "room7",
				label: "Войти в комнату 7",
				nextSceneId: "room7"
			},
			{
				id: "back_parlor",
				label: "Вернуться в гостиную",
				nextSceneId: "parlor"
			}
		],
		abilityResults: {
			spirit_sight: {
				title: "Человек с вынутой серединой",
				body: "Пелл стоит. Там, где должно быть «я», — аккуратная дыра. Не смерть. Изъятие. Края раны свежие, как у страницы, которую вырвали сегодня ночью. Он ещё ходит, потому что дыру чем-то подпёрли: вежливостью, галстуком, чужой инструкцией.",
				clue: CLUES.pell_empty
			},
			read_face: {
				title: "Улыбка без хозяина",
				body: "Микровыражений почти нет. Лицо выполняет программу: улыбка, пауза, извинение. Когда он говорит «тихий гость», на секунду вспыхивает чужой страх — не его. Потом снова пусто."
			},
			what_remains: {
				title: "Не труп, но уже не целый",
				body: "Он тёплый. Для вашей чувствительности — нет. От него веет, как от тела, которое уже подписали в журнале морга, но забыли унести. Кусок автобиографии вынут живьём.",
				clue: CLUES.pell_empty
			},
			night_sight: {
				title: "Следы бессонной ходьбы",
				body: "Пелл не спал. И не только он. Между комнатой 5 и 7 пол натёрт носками: туда-сюда, всю ночь, как маятник. Под форсункой — копоть пальца, на высоте человека, который стоял и слушал дверь 7."
			}
		},
		defaultAbility: DEFAULT_ABILITY
	},
	room7: {
		id: "room7",
		locationId: "room7",
		speakerId: "narrator",
		narration: "Комната 7 не разгромлена. Это хуже. Кровать застелена чужими руками. На столе опрокинута чернильница: пятно чёрное, запах — металл, зола и сладкое дешёвое вино. Из дешёвой тетради вырвана страница. На подоконнике копоть. Под кроватью — сложенная листовка: «Общество трезвости. Пятница. Тихий гость приветствуется.»",
		choices: [
			{
				id: "search_desk",
				label: "Осмотреть стол",
				stayNarration: "Чернила не канцелярские. Ими писали имя — одно и то же — пока рука не разучилась. На промокашке зеркально: «Артур», потом «Ар…», потом росчерк, который уже не буква. Рядом обрывок графлёной бумаги: как из книги постояльцев.",
				staySpeakerId: "narrator",
				clue: CLUES.ink_stain,
				setFlags: ["saw_ink"],
				hideIfFlag: "saw_ink"
			},
			{
				id: "search_bed",
				label: "Осмотреть кровать и листовку",
				stayNarration: "Листовка на дешёвой бумаге. Лицевая сторона — трезвость и чай. На обороте пусто, пока не наклонить к лампе: намёк на клетку, как для имени. Под подушкой нет денег. Есть волос — не Артура: длинный, седой, хозяйкин. Она заправляла постель после него.",
				staySpeakerId: "narrator",
				clue: CLUES.temperance,
				setFlags: ["saw_leaflet"],
				hideIfFlag: "saw_leaflet"
			},
			{
				id: "follow_pipe",
				label: "Спуститься по каналу трубы",
				nextSceneId: "basement",
				requiresFlag: "saw_pipe"
			},
			{
				id: "back_hall",
				label: "Выйти в коридор",
				nextSceneId: "hallway"
			}
		],
		abilityResults: {
			perfect_memory: {
				title: "Страница, которой нет",
				body: "Вы восстанавливаете вырванный лист. Это не дневник. Это копия граф из книги постояльцев: номер комнаты, имя, «гость / не гость». Строка Восса вычеркнута дважды. Под ней чужим почерком: «передано в книгу». Какую — в этом листе не сказано. Но слово «книгу» написано с маленькой буквы, как про предмет, не про контору.",
				clue: CLUES.torn_page
			},
			read_sigil: {
				title: "Чернила с формулой",
				body: "Это не чернила писца. В составе — зола, вино и капля того, что тайные общества называют «подписью духа». Ими пишут имя, чтобы имя стало съёмным. Символ на донышке чернильницы: глаз без зрачка. Психологические Алхимики не ставят его на витрину, но в своих тетрадях — да.",
				clue: CLUES.ink_stain
			},
			cold_hands: {
				title: "Смерти не было. Ухода — да.",
				body: "В этой комнате никто не умирал. Но из неё ушло нечто большее, чем человек. Холод — вокруг чернильного пятна, не вокруг кровати. Здесь вынимали не жизнь. Память о том, кем он был."
			},
			night_sight: {
				title: "Фитиль до нуля",
				body: "Лампа горела досуха. Восс не спал. Он писал. Потом ходил от стола к двери и обратно, пока не вышел. На косяке, с внутренней стороны, ногтем процарапано «Клара» — и зачёркнуто так, будто рука уже не понимала, зачем это слово."
			},
			read_machine: {
				title: "Панель у плинтуса",
				body: "Под столом плинтус снят и поставлен обратно на два гвоздя вместо четырёх. За ним узкий канал парового отопления, который на общем стояке дома не должен иметь ответвления. Труба уходит вниз, в подвал, мимо кухни.",
				setFlags: ["saw_pipe"]
			}
		},
		defaultAbility: DEFAULT_ABILITY
	},
	basement: {
		id: "basement",
		locationId: "basement",
		speakerId: "narrator",
		narration: "За шторой в гостиной — узкая лестница. Внизу железная оковка на дубовой двери. От щели тянет холодом и сладковатыми чернилами, как в комнате 7, только гуще. На двери мел: чайка, перечёркнутая линией. Засов снаружи. Кто-то запирает не воров. Гостей.",
		choices: [
			{
				id: "listen",
				label: "Прислушаться к двери",
				stayNarration: "За дверью нет шагов. Есть бумага: кто-то перелистывает книгу. Медленно. Иногда перо. Иногда — тихий выдох, как у человека, которому на секунду вернули имя и сразу забрали. Хэтти сверху кричит, что чай остывает. Голос её слишком громкий для пустой гостиной.",
				staySpeakerId: "narrator",
				setFlags: ["heard_basement"],
				hideIfFlag: "heard_basement"
			},
			{
				id: "end_look",
				label: "Осмотреть засов и мел",
				stayNarration: "Засов простой. Мел свежий. Под чайкой — еле видная строка, уже стёртая: имя одного из вас, написанное неуверенно, как проба пера. Кто-то уже пробует, как вы звучите на бумаге.",
				staySpeakerId: "narrator",
				setFlags: ["saw_chalk"],
				hideIfFlag: "saw_chalk",
				publicEvent: "На двери подвала стёртая проба пера: кто-то примерял имя со стола."
			},
			{
				id: "try_force",
				label: "Сломать засов",
				nextSceneId: "ending",
				setFlags: ["door_forced", "act1_cliff"],
				publicEvent: "Засов не выдержал. За дверью — пустой круг стульев и книга, которая не хочет быть прочитанной сегодня.",
				hideIfFlag: "door_forced"
			},
			{
				id: "end_night",
				label: "Отойти от двери и закрыть первую ночь",
				nextSceneId: "ending",
				setFlags: ["act1_done"]
			},
			{
				id: "back_up",
				label: "Подняться обратно",
				nextSceneId: "parlor"
			}
		],
		abilityResults: {
			force_door: {
				title: "Дверь не спорит с плечом",
				body: "Засов трещит и уходит. За дверью — низкая комната, одна лампа, круг стульев и пюпитр. На пюпитре лежит книга в светлой коже. Она открыта на пустой графе. Перо ещё влажное. В комнате никого. Только запах, как от чернильницы Восса. Книга захлопывается сама — или кажется, что сама. Дальше — следующий акт.",
				publicEvent: "Каспар высаживает дверь плечом. За ней пустой круг стульев и книга, которая не хочет быть прочитанной сегодня. Акт I кончается на пороге.",
				setFlags: ["act1_cliff", "door_forced"],
				nextSceneId: "ending"
			},
			kick_door: {
				title: "Грохот в подвале",
				body: "Дверь сдаётся. Круг стульев. Пюпитр. Книга в светлой коже, открытая на пустой строке. Никого. Перо влажное. На полях — проба вашего общего дела: несколько букв, которые складываются в имя одного из сидящих за столом. Книгу сейчас лучше не трогать голыми руками. Это конец первого акта.",
				publicEvent: "Рен выбивает дверь. Пустой подвал, книга на пюпитре, влажное перо. Акт I обрывается, не давая прочитать страницу до конца.",
				setFlags: ["act1_cliff", "door_forced"],
				nextSceneId: "ending"
			},
			spirit_sight: {
				title: "Книга за дверью",
				body: "За дубом — не комната. Рот. Книга сидит в нём, как язык. Она сыта не до конца. Ей нужно ещё несколько имён, и одно из них уже «на вкус» совпадает с кем-то из вас. Открывать дверь сейчас — входить в чужой рот добровольно. Можно подождать утра. Можно не ждать."
			},
			storm_bones: {
				title: "Шторм за тонкой дверью",
				body: "Кости гудят, как перед ударом волны о нос. За дверью не вода. Давление. Если войти без подготовки, кого-то из вас «выпишет» так же, как Восса. Дверь можно сломать. Это не значит, что нужно."
			}
		},
		defaultAbility: DEFAULT_ABILITY
	},
	ending: {
		id: "ending",
		locationId: "basement",
		speakerId: "narrator",
		narration: "Первая ночь в Червуде кончается. Книга в подвале ещё захлопнута — или только что захлопнулась у вас на глазах. Имена за столом пока целы. Следующий акт начнётся, когда кто-то снова откроет дверь. Или когда книга откроет её сама.",
		choices: [{
			id: "close_book",
			label: "Закрыть книгу на этой ночи",
			stayNarration: "Стол гасит лампы. Дело не раскрыто до дна — и это правильно: Акт I должен оставлять зуд. Восс не найден. Пелл ещё ходит. Подвал помнит ваши имена. Можно разойтись. Можно открыть стол заново завтра.",
			staySpeakerId: "narrator",
			setFlags: ["act1_closed"],
			hideIfFlag: "act1_closed"
		}],
		abilityResults: {},
		defaultAbility: {
			title: "Не сейчас",
			body: "Первая ночь уже сказала своё. Способность здесь ничего не сдвинет — только запомнит, что вы ещё не ушли."
		}
	}
};
var START_SCENE = "street";
function defaultPack() {
	return {
		startScene: START_SCENE,
		scenes: SCENES
	};
}
function packScenes(pack) {
	return pack?.scenes ?? SCENES;
}
function fallbackScene(pack) {
	const scenes = packScenes(pack);
	return scenes[pack?.startScene ?? "street"] ?? scenes.street ?? SCENES.street;
}
function presentScene(sceneId, flags, pack) {
	const scene = packScenes(pack)[sceneId] ?? fallbackScene(pack);
	const loc = LOCATION_BY_ID[scene.locationId];
	const speaker = scene.speakerId ? NPC_BY_ID[scene.speakerId] : null;
	const choices = scene.choices.filter((c) => {
		if (c.requiresFlag && !flags[c.requiresFlag]) return false;
		if (c.requiresAnyFlags?.length && !c.requiresAnyFlags.some((f) => flags[f])) return false;
		if (c.hideIfFlag && flags[c.hideIfFlag]) return false;
		return true;
	}).map((c) => ({
		id: c.id,
		label: c.label
	}));
	return {
		sceneId: scene.id,
		locationId: scene.locationId,
		locationName: loc?.name ?? scene.locationId,
		speakerId: scene.speakerId,
		speakerName: speaker?.name ?? null,
		speakerPortrait: speaker?.portrait ?? null,
		speakerTone: speaker?.fallbackTone ?? null,
		narration: scene.narration,
		choices,
		puzzleId: null
	};
}
function applyChoice(sceneId, choiceId, flags, pack) {
	const scene = packScenes(pack)[sceneId] ?? fallbackScene(pack);
	const choice = scene.choices.find((c) => c.id === choiceId);
	if (!choice) return {
		flags,
		presentation: {
			...presentScene(sceneId, flags, pack),
			narration: scene.narration
		}
	};
	const nextFlags = { ...flags };
	for (const f of choice.setFlags ?? []) nextFlags[f] = true;
	if (choice.nextSceneId) {
		const presentation = presentScene(choice.nextSceneId, nextFlags, pack);
		return {
			flags: nextFlags,
			clue: choice.clue,
			publicEvent: choice.publicEvent,
			puzzleId: choice.opensPuzzle ?? null,
			presentation
		};
	}
	const base = presentScene(sceneId, nextFlags, pack);
	return {
		flags: nextFlags,
		clue: choice.clue,
		publicEvent: choice.publicEvent,
		puzzleId: choice.opensPuzzle ?? null,
		presentation: {
			...base,
			speakerId: choice.staySpeakerId === void 0 ? base.speakerId : choice.staySpeakerId,
			speakerName: choice.staySpeakerId === void 0 ? base.speakerName : choice.staySpeakerId ? NPC_BY_ID[choice.staySpeakerId]?.name ?? null : null,
			narration: choice.stayNarration ?? base.narration,
			puzzleId: choice.opensPuzzle ?? base.puzzleId
		}
	};
}
function applyAbility(sceneId, abilityId, characterId, flags, pack) {
	const scene = packScenes(pack)[sceneId] ?? fallbackScene(pack);
	const character = ROSTER_BY_ID[characterId];
	const ability = character?.abilities.find((a) => a.id === abilityId);
	const scripted = scene.abilityResults[abilityId] ?? {
		...scene.defaultAbility,
		body: ability ? `${scene.defaultAbility.body}` : scene.defaultAbility.body
	};
	const nextFlags = { ...flags };
	for (const f of scripted.setFlags ?? []) nextFlags[f] = true;
	const usedKey = `used:${sceneId}:${characterId}:${abilityId}`;
	nextFlags[usedKey] = true;
	return {
		result: scripted,
		flags: nextFlags,
		visibility: ability?.visibility ?? "private",
		characterName: character?.name ?? "Следователь",
		abilityName: ability?.name ?? "Способность",
		puzzleId: scripted.opensPuzzle,
		nextSceneId: scripted.nextSceneId
	};
}
var REGISTER_SOLUTION = {
	room3: "mills",
	room5: "pell",
	room7: "voss",
	hiddenSeen: true
};
function checkRegisterPuzzle(input) {
	const ok = input.room3 === REGISTER_SOLUTION.room3 && input.room5 === REGISTER_SOLUTION.room5 && input.room7 === REGISTER_SOLUTION.room7 && input.hiddenSeen;
	return {
		ok,
		hint: ok ? null : input.hiddenSeen ? "Синий свет уже проявил строку. Сверьте комнаты с жильцами, о которых говорили." : "Обычная лампа врёт. Нужен другой свет."
	};
}
function cloneDefaultPack() {
	return structuredClone({
		startScene: START_SCENE,
		scenes: SCENES
	});
}
function parsePack(raw) {
	if (!raw || typeof raw !== "object") return null;
	const data = raw;
	if (typeof data.startScene !== "string" || !data.scenes || typeof data.scenes !== "object") return null;
	const scenes = {};
	for (const [id, scene] of Object.entries(data.scenes)) {
		const parsed = parseScene(id, scene);
		if (!parsed) return null;
		scenes[id] = parsed;
	}
	if (!scenes[data.startScene]) return null;
	return {
		startScene: data.startScene,
		scenes
	};
}
function parseScene(id, raw) {
	if (!raw || typeof raw !== "object") return null;
	const s = raw;
	if (typeof s.narration !== "string") return null;
	const choices = Array.isArray(s.choices) ? s.choices.map((c, i) => parseChoice(c, i)).filter((c) => Boolean(c)) : [];
	return {
		id,
		locationId: typeof s.locationId === "string" ? s.locationId : "street",
		speakerId: typeof s.speakerId === "string" ? s.speakerId : null,
		narration: s.narration,
		choices,
		abilityResults: s.abilityResults && typeof s.abilityResults === "object" ? s.abilityResults : {},
		defaultAbility: s.defaultAbility && typeof s.defaultAbility === "object" ? s.defaultAbility : DEFAULT_ABILITY
	};
}
function parseChoice(raw, index) {
	if (!raw || typeof raw !== "object") return null;
	const c = raw;
	const label = typeof c.label === "string" ? c.label : "";
	if (!label) return null;
	return {
		id: typeof c.id === "string" && c.id ? c.id : `choice_${index}`,
		label,
		nextSceneId: typeof c.nextSceneId === "string" ? c.nextSceneId : void 0,
		stayNarration: typeof c.stayNarration === "string" ? c.stayNarration : void 0,
		staySpeakerId: c.staySpeakerId === null ? null : typeof c.staySpeakerId === "string" ? c.staySpeakerId : void 0,
		setFlags: Array.isArray(c.setFlags) ? c.setFlags.filter((f) => typeof f === "string") : void 0,
		publicEvent: typeof c.publicEvent === "string" ? c.publicEvent : void 0,
		opensPuzzle: typeof c.opensPuzzle === "string" ? c.opensPuzzle : c.opensPuzzle === null ? null : void 0,
		requiresFlag: typeof c.requiresFlag === "string" ? c.requiresFlag : void 0,
		requiresAnyFlags: Array.isArray(c.requiresAnyFlags) ? c.requiresAnyFlags.filter((f) => typeof f === "string") : void 0,
		hideIfFlag: typeof c.hideIfFlag === "string" ? c.hideIfFlag : void 0,
		clue: c.clue && typeof c.clue === "object" ? c.clue : void 0
	};
}
function emptyScene(id) {
	return {
		id,
		locationId: "street",
		speakerId: "narrator",
		narration: "Новая сцена. Напишите, что видит стол.",
		choices: [],
		abilityResults: {},
		defaultAbility: DEFAULT_ABILITY
	};
}
function auditPack(pack) {
	const issues = [];
	const { scenes, startScene } = pack;
	if (!scenes[startScene]) {
		issues.push({
			level: "error",
			message: `Стартовая сцена «${startScene}» не существует.`
		});
		return issues;
	}
	const reachable = /* @__PURE__ */ new Set();
	const queue = [startScene];
	while (queue.length) {
		const id = queue.shift();
		if (reachable.has(id)) continue;
		reachable.add(id);
		const scene = scenes[id];
		if (!scene) continue;
		for (const choice of scene.choices) if (choice.nextSceneId) queue.push(choice.nextSceneId);
		for (const result of Object.values(scene.abilityResults)) if (result.nextSceneId) queue.push(result.nextSceneId);
	}
	for (const [id, scene] of Object.entries(scenes)) {
		const choiceIds = /* @__PURE__ */ new Set();
		for (const choice of scene.choices) {
			if (choiceIds.has(choice.id)) issues.push({
				level: "error",
				sceneId: id,
				message: `Два действия с id «${choice.id}».`
			});
			choiceIds.add(choice.id);
			if (choice.nextSceneId && !scenes[choice.nextSceneId]) issues.push({
				level: "error",
				sceneId: id,
				message: `«${choice.label}» ведёт в несуществующую сцену «${choice.nextSceneId}».`
			});
			if (!choice.nextSceneId && !choice.stayNarration && !choice.opensPuzzle) issues.push({
				level: "warn",
				sceneId: id,
				message: `«${choice.label}» никуда не ведёт и не меняет текст.`
			});
		}
		for (const [abilityId, result] of Object.entries(scene.abilityResults)) if (result.nextSceneId && !scenes[result.nextSceneId]) issues.push({
			level: "error",
			sceneId: id,
			message: `Способность ${abilityId} ведёт в «${result.nextSceneId}», которой нет.`
		});
		const outgoing = scene.choices.filter((c) => c.nextSceneId).length;
		const abilityOut = Object.values(scene.abilityResults).some((r) => r.nextSceneId);
		if (outgoing === 0 && !abilityOut && id !== "ending") issues.push({
			level: "warn",
			sceneId: id,
			message: "Тупик: из сцены нельзя уйти выбором."
		});
		if (!reachable.has(id) && id !== startScene) issues.push({
			level: "warn",
			sceneId: id,
			message: "Сцена недостижима со старта."
		});
	}
	return issues;
}
//#endregion
export { cloneDefaultPack as a, getSql as c, checkRegisterPuzzle as i, parsePack as l, applyChoice as n, defaultPack as o, auditPack as r, emptyScene as s, applyAbility as t, presentScene as u };
