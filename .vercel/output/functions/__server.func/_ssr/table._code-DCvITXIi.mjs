import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { n as LOCATION_BY_ID } from "./locations-Dl_Cn8V3.mjs";
import { i as ROSTER_BY_ID } from "./roster-Cd5W4G4t.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
import { d as MicOff, f as Eye, n as Users, t as Volume2 } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-DzFCkCJ_.mjs";
import { a as useRoom, t as cn } from "./use-room-BoalGIlm.mjs";
import { n as GuestRegister, r as Portrait, t as CharacterSelect } from "./guest-register-Ohn-vzDc.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/table._code-DCvITXIi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function playUrl(code) {
	if (typeof window === "undefined") return "";
	return `${window.location.origin}/play/${code}`;
}
function TableQr({ code, size = 168, compact = false }) {
	const [src, setSrc] = (0, import_react.useState)(null);
	const href = playUrl(code);
	(0, import_react.useEffect)(() => {
		if (!href) return;
		let cancelled = false;
		import_lib.toDataURL(href, {
			margin: 1,
			width: Math.max(size, 192) * 2,
			color: {
				dark: "#0c0b0a",
				light: "#d9cbb6"
			},
			errorCorrectionLevel: "M"
		}).then((url) => {
			if (!cancelled) setSrc(url);
		});
		return () => {
			cancelled = true;
		};
	}, [href, size]);
	if (!href) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: cn("flex items-center gap-3 rounded-[18px] border border-line bg-paper/95 text-bg", compact ? "p-2" : "p-3"),
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: `QR-код на телефонный стол ${code}`,
			width: size,
			height: size,
			className: "shrink-0 rounded-[10px]"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 rounded-[10px] bg-paper-dim/40",
			style: {
				width: size,
				height: size
			}
		}), compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "max-w-[9rem] text-[11px] leading-snug text-bg/80",
			children: ["Телефонный стол", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block font-display text-lg tracking-[0.16em]",
				children: code
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-bg/55",
					children: "Сядьте с телефона"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-2xl leading-tight tracking-[0.14em] text-bg",
					children: code
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs leading-relaxed text-bg/70",
					children: "Наведите камеру — откроется личная страница: роль, способности, улики."
				})
			]
		})]
	});
}
var speakText = createServerFn({ method: "POST" }).validator((input) => object({ text: string().min(1).max(900) }).parse(input)).handler(createSsrRpc("1bb57940fd926c77d96684f754e72045af3244bcbd97113ce017358238835023"));
function StageView({ room, clientId, onClaim, onStart, onCouncil, onRegister, onClosePuzzle, onChoose, onAbility, claimError, startError, actionError }) {
	const loc = LOCATION_BY_ID[room.locationId];
	const [voiceOn, setVoiceOn] = (0, import_react.useState)(false);
	const [deskOpen, setDeskOpen] = (0, import_react.useState)(false);
	const [privateNote, setPrivateNote] = (0, import_react.useState)(null);
	const lastSpoken = (0, import_react.useRef)("");
	const me = room.myCharacterId ? ROSTER_BY_ID[room.myCharacterId] : null;
	(0, import_react.useEffect)(() => {
		if (!voiceOn) return;
		if (!room.narration || room.narration === lastSpoken.current) return;
		lastSpoken.current = room.narration;
		let cancelled = false;
		const play = async () => {
			const res = await speakText({ data: { text: room.narration } });
			if (cancelled) return;
			if (res.ok) {
				new Audio(`data:${res.mime};base64,${res.audioBase64}`).play().catch(() => fallbackSpeak(room.narration));
				return;
			}
			fallbackSpeak(room.narration);
		};
		play();
		return () => {
			cancelled = true;
		};
	}, [room.narration, voiceOn]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh overflow-hidden bg-bg text-ink",
		children: [
			loc?.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: loc.image,
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-bg/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-start justify-between gap-4 px-4 py-4 md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.28em] text-brass",
						children: "Червудский свидетель"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl text-paper md:text-4xl",
						children: room.status === "lobby" ? "Стол ещё собирается" : room.locationName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-lg tabular-nums tracking-[0.2em] text-night",
						children: room.code
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-end gap-2",
					children: [
						room.status === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableQr, {
							code: room.code,
							size: 88,
							compact: true
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setVoiceOn((v) => !v),
							className: cn("flex h-11 items-center gap-2 rounded-full border px-3 text-xs uppercase tracking-wider", voiceOn ? "border-night bg-night/20 text-paper" : "border-line text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), voiceOn ? "Голос" : "Без голоса"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onCouncil(!room.council),
							className: cn("flex h-11 items-center gap-2 rounded-full border px-3 text-xs uppercase tracking-wider", room.council ? "border-danger bg-danger/20 text-paper" : "border-line text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }), room.council ? "Идёт совет" : "Совет"]
						}),
						me && room.status === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setDeskOpen((v) => !v),
							className: "flex h-11 items-center gap-2 rounded-full border border-line px-3 text-xs uppercase tracking-wider text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "Личный стол"]
						}) : null
					]
				})]
			}),
			room.council ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 mx-4 mb-3 rounded-[16px] border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-paper md:mx-8",
				children: "Стол совещается. Мастер глухой, пока не снимут «Совет»."
			}) : null,
			room.status === "lobby" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto max-w-5xl px-4 pb-24 md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-col gap-4 rounded-[20px] border border-line bg-bg/70 p-4 md:flex-row md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "Наведите камеру телефона на QR — откроется личный стол."]
							}),
							startError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-danger",
								children: startError
							}) : null,
							room.isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onStart,
								className: "mt-4 h-12 rounded-[16px] bg-paper px-6 text-sm font-medium text-bg disabled:opacity-40",
								disabled: room.seatedCount < 1,
								children: "Начать дело"
							}), room.seatedCount < 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-brass",
								children: "Сначала нажмите карточку в ростере — свою роль. Без роли кнопки в деле будут молчать."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Роль взята. Можно начинать — действия появятся и на сцене, и на телефонах."
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-faint",
								children: "Ждём хоста."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableQr, {
						code: room.code,
						size: 152
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterSelect, {
					takenCharacterIds: room.takenCharacterIds,
					seats: room.seats,
					myCharacterId: room.myCharacterId,
					myClientId: clientId,
					onClaim,
					error: claimError
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 flex min-h-[70dvh] flex-col justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-end gap-4 px-4 pb-6 md:grid-cols-[minmax(0,280px)_1fr] md:px-8",
					children: [room.speakerId && room.speakerId !== "narrator" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
						src: room.speakerPortrait,
						name: room.speakerName ?? "",
						tone: room.speakerTone,
						className: "mx-auto h-[42vh] w-[min(72vw,280px)] rounded-[24px] md:mx-0 md:h-[52vh] md:w-full"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[24px] border border-line/80 bg-bg/78 p-4 md:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.22em] text-brass",
								children: room.speakerName ?? "Хранитель дела"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-display text-xl leading-snug text-paper md:text-2xl",
								children: room.narration
							}),
							room.lastPublicEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 rounded-[14px] border border-night/30 bg-night/10 px-3 py-2 text-sm text-paper",
								children: room.lastPublicEvent
							}) : null,
							actionError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-danger",
								children: actionError
							}) : null,
							room.choices.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-2 md:grid-cols-2",
								children: room.choices.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: room.council,
									onClick: () => onChoose(c.id),
									className: "min-h-11 rounded-[14px] border border-line bg-raised/80 px-3 py-2 text-left text-sm text-ink disabled:opacity-40",
									children: c.label
								}, c.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-muted",
								children: room.sceneId === "ending" ? "Акт I завершён. Можно закрыть стол." : "В этой сцене нет открытых действий — смените комнату или примените способность с телефона."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: room.seats.filter((s) => s.characterId).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-line px-3 py-1 text-xs text-muted",
									children: ROSTER_BY_ID[s.characterId]?.name ?? s.displayName
								}, s.clientId))
							})
						]
					})]
				})
			}),
			room.puzzleId === "register" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 bg-bg/70 p-3 md:p-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-full max-w-lg overflow-hidden rounded-[24px] border border-line bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestRegister, {
						onSolve: onRegister,
						onClose: onClosePuzzle,
						error: actionError
					})
				})
			}) : null,
			deskOpen && me && onAbility ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-line bg-bg/95 p-4 md:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-brass",
							children: "Личный стол"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-paper",
							children: me.name
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDeskOpen(false),
							className: "rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted",
							children: "Закрыть"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: me.pathwayPlain
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex-1 space-y-3 overflow-auto",
						children: [me.abilities.map((ab) => {
							const used = room.usedAbilityIds.includes(ab.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[18px] border border-line bg-surface p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg text-paper",
											children: ab.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase tracking-wider text-faint",
											children: ab.visibility === "private" ? "только вам" : "стол увидит"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted",
										children: ab.detail
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: room.council || used,
										onClick: async () => {
											const res = await onAbility(ab.id);
											if (res.ok && res.note && res.visibility === "private") setPrivateNote(res.note);
										},
										className: "mt-3 h-11 w-full rounded-[14px] bg-paper text-sm text-bg disabled:opacity-40",
										children: used ? "Уже в этой сцене" : "Применить"
									})
								]
							}, ab.id);
						}), room.myNotes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wider text-faint",
								children: "Только вы это видели"
							}), room.myNotes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-[16px] border border-line bg-raised p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-base text-paper",
									children: n.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: n.body
								})]
							}, n.id))]
						}) : null]
					})
				]
			}) : null,
			privateNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 flex items-end bg-bg/70 p-4 sm:items-center sm:justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-[24px] border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-brass",
							children: "Только ваш экран"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl text-paper",
							children: privateNote.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: privateNote.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-5 h-12 w-full rounded-[16px] bg-paper text-sm text-bg",
							onClick: () => setPrivateNote(null),
							children: "Скрыть"
						})
					]
				})
			}) : null
		]
	});
}
function fallbackSpeak(text) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.lang = "ru-RU";
	u.rate = .95;
	window.speechSynthesis.speak(u);
}
function TablePage() {
	const { code } = Route.useParams();
	const roomHook = useRoom(code);
	const { room, clientId, error } = roomHook;
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl text-paper",
				children: "Стол не найден"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm text-night underline",
				children: "На первую страницу"
			})
		]
	});
	if (!room) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-bg font-display text-2xl text-paper",
		children: "Зажигаем лампы…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageView, {
		room,
		clientId,
		onClaim: (id) => roomHook.claim.mutate(id),
		onStart: () => roomHook.start.mutate(),
		onCouncil: (on) => roomHook.council.mutate(on),
		onRegister: (p) => roomHook.register.mutate(p),
		onClosePuzzle: () => roomHook.dismissPuzzle.mutate(),
		onChoose: (id) => roomHook.choose.mutate(id),
		onAbility: async (id) => {
			const res = await roomHook.ability.mutateAsync(id);
			if (!res.ok) return {
				ok: false,
				error: res.error
			};
			return {
				ok: true,
				visibility: res.visibility,
				note: res.note
			};
		},
		claimError: roomHook.claim.data && !roomHook.claim.data.ok ? roomHook.claim.data.error : null,
		startError: roomHook.start.data && !roomHook.start.data.ok ? roomHook.start.data.error : null,
		actionError: (roomHook.choose.data && !roomHook.choose.data.ok ? roomHook.choose.data.error : null) ?? (roomHook.register.data && !roomHook.register.data.ok ? roomHook.register.data.error : null)
	});
}
//#endregion
export { TablePage as component };
