import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as ROSTER } from "./roster-Cd5W4G4t.mjs";
import { t as cn } from "./use-room-BoalGIlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guest-register-Ohn-vzDc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Portrait({ src, name, tone, className, mark }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-surface", !src && `bg-gradient-to-b ${tone ?? "from-[#1a1814] to-[#0c0b0a]"}`, className),
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: name,
			className: "h-full w-full object-cover object-[center_18%]"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full flex-col justify-end p-3",
			children: [mark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-auto font-display text-[11px] uppercase tracking-[0.22em] text-brass",
				children: mark
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl leading-tight text-paper",
				children: name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/10" })]
	});
}
function CharacterSelect({ takenCharacterIds, seats, myCharacterId, myClientId, locked, onClaim, busy, error }) {
	const remaining = Math.max(0, 4 - takenCharacterIds.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl text-paper",
					children: "Ростер бюро"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm leading-relaxed text-muted",
					children: "Трое или четверо. Чужую роль взять нельзя. Способности написаны человеческим языком — лор новеллы знать не нужно."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "shrink-0 font-display text-sm tabular-nums text-night",
					children: [
						takenCharacterIds.length,
						"/",
						4
					]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: ROSTER.map((ch) => {
					const takenBy = seats.find((s) => s.characterId === ch.id && s.clientId !== myClientId);
					const mine = myCharacterId === ch.id;
					const blocked = Boolean(takenBy) || locked && !mine;
					const partyFull = !mine && !takenBy && remaining === 0 && takenCharacterIds.length >= 4;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: (blocked || partyFull || busy || locked) && !mine,
						onClick: () => onClaim(mine ? null : ch.id),
						className: cn("flex overflow-hidden rounded-[20px] border text-left transition-colors", mine ? "border-night bg-raised" : blocked ? "border-line/60 bg-surface/60 opacity-55" : "border-line bg-surface hover:border-brass/70"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
							src: ch.portrait,
							name: ch.name,
							tone: ch.fallbackTone,
							mark: ch.mark,
							className: "h-[220px] w-[118px] shrink-0 rounded-none sm:h-[240px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 flex-col gap-1 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg leading-tight text-paper",
										children: ch.name
									}), mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-night/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-night",
										children: "ваша"
									}) : takenBy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint",
										children: "занято"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] uppercase tracking-[0.14em] text-brass",
									children: [
										ch.pathwayName,
										" · ",
										ch.occupation
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-3 text-xs leading-relaxed text-muted",
									children: ch.pathwayPlain
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 space-y-1",
									children: ch.abilities.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-[11px] leading-snug text-ink/85",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-paper",
												children: [a.name, "."]
											}),
											" ",
											a.summary,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-faint",
												children: a.visibility === "private" ? "Результат только на вашем телефоне." : "Стол увидит, что вы сделали."
											})
										]
									}, a.id))
								}),
								takenBy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-auto pt-1 text-xs text-faint",
									children: ["Уже взял ", takenBy.displayName]
								}) : mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-auto pt-1 text-xs text-night",
									children: "Нажмите, чтобы отпустить"
								}) : partyFull ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-auto pt-1 text-xs text-faint",
									children: "Стол полный"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-auto pt-1 text-xs text-faint",
									children: "Нажмите, чтобы сесть"
								})
							]
						})]
					}, ch.id);
				})
			})
		]
	});
}
var NAMES = [
	{
		id: "voss",
		label: "А. Восс"
	},
	{
		id: "pell",
		label: "Г. Пелл"
	},
	{
		id: "mills",
		label: "Э. Миллс"
	},
	{
		id: "grange",
		label: "Х. Грейндж"
	}
];
function GuestRegister({ onSolve, onClose, busy, error }) {
	const [lamp, setLamp] = (0, import_react.useState)("gas");
	const [room3, setRoom3] = (0, import_react.useState)("");
	const [room5, setRoom5] = (0, import_react.useState)("");
	const [room7, setRoom7] = (0, import_react.useState)("");
	const hiddenSeen = lamp === "night";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-bg/92 text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3 border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-paper",
				children: "Реестр «Серебряной чайки»"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-md text-sm text-muted",
				children: "Обычная лампа показывает то, что хозяйка хочет. Другой свет — то, что писали поверх."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted",
				children: "Закрыть"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-4 overflow-auto p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLamp("gas"),
						className: cn("rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider", lamp === "gas" ? "border-brass bg-brass/20 text-paper" : "border-line text-muted"),
						children: "Газовая лампа"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLamp("night"),
						className: cn("rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider", lamp === "night" ? "border-night bg-night/20 text-paper" : "border-line text-muted"),
						children: "Синий свет"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("rounded-[20px] border p-4 font-display shadow-inner", lamp === "night" ? "border-night/40 bg-[#121820] text-paper" : "border-brass/30 bg-[#d9cbb6] text-[#2a241c]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm uppercase tracking-[0.2em] opacity-70",
						children: "Пансион · жильцы осени"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3 text-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["к. 3 — ", lamp === "night" ? "Э. Миллс, ночь на фабрике" : "…………"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["к. 5 — ", lamp === "night" ? "Г. Пелл (оплачено)" : "Г. Пелл"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["к. 7 — ", lamp === "night" ? "А. Восс — передано в книгу" : "А. Восс"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("italic", lamp === "night" ? "text-night" : "opacity-40"),
								children: lamp === "night" ? "Пятница. Подвал. Тихий гость. Имя пробуют пером." : "поля выцвели"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Сопоставьте комнаты с именами, как вы поняли по дому и книге."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3",
					children: [
						{
							num: "3",
							value: room3,
							set: setRoom3
						},
						{
							num: "5",
							value: room5,
							set: setRoom5
						},
						{
							num: "7",
							value: room7,
							set: setRoom7
						}
					].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "w-16 font-display text-paper",
							children: ["к. ", row.num]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: row.value,
							onChange: (e) => row.set(e.target.value),
							className: "h-11 flex-1 rounded-[12px] border border-line bg-surface px-3 text-sm text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "не знаю"
							}), NAMES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: n.id,
								children: n.label
							}, n.id))]
						})]
					}, row.num))
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || !room3 || !room5 || !room7,
					onClick: () => onSolve({
						room3,
						room5,
						room7,
						hiddenSeen
					}),
					className: "h-12 rounded-[16px] bg-paper text-sm font-medium text-bg disabled:opacity-40",
					children: "Сверить книгу"
				})
			]
		})]
	});
}
//#endregion
export { GuestRegister as n, Portrait as r, CharacterSelect as t };
