import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ROSTER_BY_ID } from "./roster-Cd5W4G4t.mjs";
import { d as MicOff, f as Eye, p as BookOpen, r as User, s as ScrollText, u as Mic } from "../_libs/lucide-react.mjs";
import { r as Route$1 } from "./router-DzFCkCJ_.mjs";
import { a as useRoom, n as joinTable, t as cn } from "./use-room-BoalGIlm.mjs";
import { n as GuestRegister, r as Portrait, t as CharacterSelect } from "./guest-register-Ohn-vzDc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play._code-CLyU6jHO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function makeRec() {
	const w = window;
	const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
	if (!Ctor) return null;
	return new Ctor();
}
function SpeechButton({ disabled, onConfirm }) {
	const recRef = (0, import_react.useRef)(null);
	const [holding, setHolding] = (0, import_react.useState)(false);
	const [heard, setHeard] = (0, import_react.useState)("");
	const [supported, setSupported] = (0, import_react.useState)(true);
	function start() {
		if (disabled) return;
		const rec = makeRec();
		if (!rec) {
			setSupported(false);
			return;
		}
		rec.lang = "ru-RU";
		rec.continuous = false;
		rec.interimResults = true;
		rec.onresult = (ev) => {
			const t = ev.results[ev.results.length - 1]?.[0]?.transcript ?? "";
			setHeard(t);
		};
		rec.onend = () => setHolding(false);
		recRef.current = rec;
		setHolding(true);
		rec.start();
	}
	function stop() {
		recRef.current?.stop();
		setHolding(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			disabled,
			onPointerDown: start,
			onPointerUp: stop,
			onPointerLeave: holding ? stop : void 0,
			className: cn("flex h-12 items-center justify-center gap-2 rounded-[16px] border text-sm", holding ? "border-danger bg-danger/15 text-paper" : "border-line bg-surface text-ink", disabled && "opacity-40"),
			children: [disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), disabled ? "Мастер не слушает" : holding ? "Говорите…" : "Удерживайте, чтобы сказать"]
		}), !supported ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextFallback, {
			onConfirm,
			disabled
		}) : heard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-[16px] border border-line bg-raised p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-wider text-faint",
					children: "Мастер услышал"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-lg text-paper",
					children: heard
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-10 flex-1 rounded-[12px] bg-paper text-sm text-bg",
						onClick: () => {
							onConfirm(heard);
							setHeard("");
						},
						children: "Подтвердить"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-10 rounded-[12px] border border-line px-3 text-sm text-muted",
						onClick: () => setHeard(""),
						children: "Отмена"
					})]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextFallback, {
			onConfirm,
			disabled
		})]
	});
}
function TextFallback({ onConfirm, disabled }) {
	const [text, setText] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			const t = text.trim();
			if (!t) return;
			onConfirm(t);
			setText("");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: text,
			disabled,
			onChange: (e) => setText(e.target.value),
			placeholder: "Или напишите действие",
			className: "h-11 flex-1 rounded-[12px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-faint"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "submit",
			disabled: disabled || !text.trim(),
			className: "h-11 rounded-[12px] border border-line px-3 text-sm text-paper disabled:opacity-40",
			children: "Сказать"
		})]
	});
}
function PlayerTable({ room, clientId, onClaim, onCouncil, onChoose, onAbility, onSpeak, onRegister, onClosePuzzle, claimError, actionError, abilityBusy }) {
	const [tab, setTab] = (0, import_react.useState)("act");
	const [privateNote, setPrivateNote] = (0, import_react.useState)(null);
	const me = room.myCharacterId ? ROSTER_BY_ID[room.myCharacterId] : null;
	(0, import_react.useEffect)(() => {
		if (room.status === "playing") setTab("act");
	}, [room.status]);
	if (room.status === "lobby" || !me) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-dvh max-w-lg bg-bg px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				room,
				onCouncil
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterSelect, {
				takenCharacterIds: room.takenCharacterIds,
				seats: room.seats,
				myCharacterId: room.myCharacterId,
				myClientId: clientId,
				locked: room.status === "playing",
				onClaim,
				error: claimError
			}),
			me ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Ждём, пока хост откроет дело."
			}) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-lg flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				room,
				onCouncil
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
					src: me.portrait,
					name: me.name,
					tone: me.fallbackTone,
					className: "h-16 w-12 rounded-[12px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl leading-tight text-paper",
						children: me.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-brass",
						children: me.pathwayName
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex-1 px-4 pb-28",
				children: [
					tab === "act" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.2em] text-faint",
								children: room.locationName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl leading-snug text-paper",
								children: room.narration
							}),
							room.lastPublicEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-night",
								children: room.lastPublicEvent
							}) : null,
							actionError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: actionError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col gap-2",
								children: room.choices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-[16px] border border-line bg-surface px-4 py-3 text-sm text-muted",
									children: room.sceneId === "ending" ? "Акт I завершён. Книгу можно закрыть." : "Сейчас нет открытых действий. Попробуйте способность или подождите реплику стола."
								}) : room.choices.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: room.council,
									onClick: () => onChoose(c.id),
									className: "min-h-12 rounded-[16px] border border-line bg-surface px-4 py-3 text-left text-sm text-ink disabled:opacity-40",
									children: c.label
								}, c.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeechButton, {
								disabled: room.council,
								onConfirm: onSpeak
							})
						]
					}) : null,
					tab === "skill" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted",
							children: me.pathwayPlain
						}), me.abilities.map((ab) => {
							const used = room.usedAbilityIds.includes(ab.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[20px] border border-line bg-surface p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl text-paper",
											children: ab.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint",
											children: ab.visibility === "private" ? "только вам" : "стол увидит"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted",
										children: ab.detail
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: room.council || abilityBusy || used,
										onClick: async () => {
											const res = await onAbility(ab.id);
											if (res.ok && res.note && res.visibility === "private") setPrivateNote(res.note);
										},
										className: "mt-3 h-11 w-full rounded-[14px] bg-paper text-sm text-bg disabled:opacity-40",
										children: used ? "Уже применяли в этой сцене" : room.council ? "Сначала закончите совет" : "Применить с телефона"
									})
								]
							}, ab.id);
						})]
					}) : null,
					tab === "clues" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						children: room.clues.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Пока пусто. Смотрите, спрашивайте, применяйте способности."
						}) : room.clues.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-[20px] border border-line bg-surface p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] uppercase tracking-wider text-brass",
									children: c.source
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-xl text-paper",
									children: c.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: c.body
								})
							]
						}, c.id))
					}) : null,
					tab === "dossier" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl text-paper",
								children: me.occupation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm italic text-muted",
								children: [
									"«",
									me.quote,
									"»"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: me.pathwayPlain
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wider text-faint",
								children: "Личные заметки"
							}),
							room.myNotes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Способности оставят след здесь — только на этом телефоне."
							}) : room.myNotes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-[20px] border border-line bg-raised p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg text-paper",
									children: n.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: n.body
								})]
							}, n.id))
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 mx-auto flex max-w-lg border-t border-line bg-bg/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
				children: [
					[
						"act",
						"Дело",
						ScrollText
					],
					[
						"skill",
						"Сила",
						Eye
					],
					[
						"clues",
						"Улики",
						BookOpen
					],
					[
						"dossier",
						"Досье",
						User
					]
				].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("flex h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider", tab === id ? "text-paper" : "text-faint"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
				}, id))
			}),
			privateNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-30 flex items-end bg-bg/70 p-3 sm:items-center sm:justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-[24px] border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-brass",
							children: "Только ваш телефон"
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
			}) : null,
			room.puzzleId === "register" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestRegister, {
					onSolve: onRegister,
					onClose: onClosePuzzle,
					error: actionError
				})
			}) : null
		]
	});
}
function Header({ room, onCouncil }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-start justify-between gap-3 px-4 pb-4 pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.24em] text-brass",
			children: "Червудский свидетель"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg tabular-nums tracking-[0.18em] text-night",
			children: room.code
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onCouncil(!room.council),
			className: cn("flex h-11 items-center gap-2 rounded-full border px-3 text-xs uppercase tracking-wider", room.council ? "border-danger bg-danger/20 text-paper" : "border-line text-muted"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }), room.council ? "Идёт совет" : "Совет"]
		})]
	});
}
function PlayPage() {
	const { code } = Route$1.useParams();
	const roomHook = useRoom(code);
	const { room, clientId, error } = roomHook;
	(0, import_react.useEffect)(() => {
		if (!clientId || clientId === "ssr") return;
		joinTable({ data: {
			code,
			clientId
		} });
	}, [code, clientId]);
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
		children: "Садимся за стол…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerTable, {
		room,
		clientId,
		onClaim: (id) => roomHook.claim.mutate(id),
		onCouncil: (on) => roomHook.council.mutate(on),
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
		onSpeak: (text) => roomHook.speak.mutate(text),
		onRegister: (p) => roomHook.register.mutate(p),
		onClosePuzzle: () => roomHook.dismissPuzzle.mutate(),
		claimError: roomHook.claim.data && !roomHook.claim.data.ok ? roomHook.claim.data.error : null,
		actionError: (roomHook.choose.data && !roomHook.choose.data.ok ? roomHook.choose.data.error : null) || (roomHook.ability.data && !roomHook.ability.data.ok ? roomHook.ability.data.error : null) || (roomHook.speak.data && !roomHook.speak.data.ok ? roomHook.speak.data.error : null) || (roomHook.register.data && !roomHook.register.data.ok ? roomHook.register.data.error : null),
		abilityBusy: roomHook.ability.isPending
	});
}
//#endregion
export { PlayPage as component };
