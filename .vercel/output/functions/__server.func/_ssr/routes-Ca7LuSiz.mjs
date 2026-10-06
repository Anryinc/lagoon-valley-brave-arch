import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as LOCATIONS } from "./locations-Dl_Cn8V3.mjs";
import { t as NPCS } from "./roster-Cd5W4G4t.mjs";
import { a as cloneDefaultPack, r as auditPack, s as emptyScene } from "./pack-D2uxI2bN.mjs";
import { i as saveCampaignPack, r as resetCampaignPack, t as getCampaignPack } from "./pack-api-CFu9Def2.mjs";
import { c as Save, i as Undo2, l as Plus, m as ArrowRight, o as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useJoinTable, r as useCreateTable, t as cn } from "./use-room-BoalGIlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ca7LuSiz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MasterStudio() {
	const qc = useQueryClient();
	const query = useQuery({
		queryKey: ["campaign-pack"],
		queryFn: async () => {
			return (await getCampaignPack({ data: {} })).pack;
		}
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(null);
	const pack = draft ?? query.data ?? cloneDefaultPack();
	const issues = (0, import_react.useMemo)(() => auditPack(pack), [pack]);
	const sceneId = selected && pack.scenes[selected] ? selected : pack.startScene;
	const scene = pack.scenes[sceneId];
	const save = useMutation({
		mutationFn: () => saveCampaignPack({ data: { pack } }),
		onSuccess: (res) => {
			if (!res.ok) {
				setStatus(res.error);
				return;
			}
			setStatus("Сохранено. Новые столы пойдут по этому потоку.");
			qc.invalidateQueries({ queryKey: ["campaign-pack"] });
		}
	});
	const reset = useMutation({
		mutationFn: () => resetCampaignPack({ data: {} }),
		onSuccess: (res) => {
			if (!res.ok) return;
			setDraft(res.pack);
			setSelected(res.pack.startScene);
			setStatus("Вернули канонический Акт I.");
			qc.invalidateQueries({ queryKey: ["campaign-pack"] });
		}
	});
	const updateScene = (id, patch) => {
		setDraft({
			...pack,
			scenes: {
				...pack.scenes,
				[id]: {
					...pack.scenes[id],
					...patch,
					id
				}
			}
		});
	};
	const updateChoice = (index, patch) => {
		const choices = scene.choices.map((c, i) => i === index ? {
			...c,
			...patch
		} : c);
		updateScene(sceneId, { choices });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 px-4 py-6 md:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.28em] text-brass",
						children: "Кабинет хранителя"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl text-paper",
						children: "Поток дела"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
						children: "Сцены, развилки и тупики Акта I. Сохранённый пакет подхватывают новые столы. Идущее дело не переписывается на лету."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => save.mutate(),
						className: "flex h-11 items-center gap-2 rounded-[14px] bg-paper px-4 text-sm text-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Сохранить поток"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => reset.mutate(),
						className: "flex h-11 items-center gap-2 rounded-[14px] border border-line px-4 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), "Вернуть канон"]
					})]
				})]
			}),
			status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-night",
				children: status
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueList, {
				issues,
				onSelect: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "rounded-[20px] border border-line bg-surface/80 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-1 text-[11px] uppercase tracking-[0.2em] text-faint",
							children: "Сцены"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 space-y-1",
							children: Object.values(pack.scenes).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(s.id),
								className: cn("flex w-full items-start justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm", s.id === sceneId ? "bg-raised text-paper" : "text-muted hover:bg-raised/50"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-base text-paper",
									children: labelOf(s)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-faint",
									children: s.id
								})] }), pack.startScene === s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] uppercase tracking-wider text-brass",
									children: "старт"
								}) : null]
							}) }, s.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddScene, {
							existing: Object.keys(pack.scenes),
							onAdd: (id) => {
								setDraft({
									...pack,
									scenes: {
										...pack.scenes,
										[id]: emptyScene(id)
									}
								});
								setSelected(id);
							}
						})
					]
				}), scene ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-[20px] border border-line bg-bg/70 p-4 md:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Локация", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: scene.locationId,
									onChange: (e) => updateScene(sceneId, { locationId: e.target.value }),
									className: "mt-1 h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-ink",
									children: LOCATIONS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: l.id,
										children: l.name
									}, l.id))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Голос", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: scene.speakerId ?? "narrator",
									onChange: (e) => updateScene(sceneId, { speakerId: e.target.value }),
									className: "mt-1 h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-ink",
									children: NPCS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n.id,
										children: n.name
									}, n.id))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-sm text-muted",
							children: ["Текст сцены", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: scene.narration,
								onChange: (e) => updateScene(sceneId, { narration: e.target.value }),
								rows: 7,
								className: "mt-1 w-full rounded-[16px] border border-line bg-surface px-3 py-2 font-display text-lg leading-snug text-paper"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: pack.startScene === sceneId,
									onChange: (e) => {
										if (e.target.checked) setDraft({
											...pack,
											startScene: sceneId
										});
									}
								}), "Начинать дело с этой сцены"]
							}), sceneId !== pack.startScene ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									const next = { ...pack.scenes };
									delete next[sceneId];
									setDraft({
										...pack,
										scenes: next
									});
									setSelected(pack.startScene);
								},
								className: "flex items-center gap-1 text-xs uppercase tracking-wider text-danger",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Удалить сцену"]
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutArrows, { scene }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl text-paper",
								children: "Действия"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => updateScene(sceneId, { choices: [...scene.choices, {
									id: `c_${Math.random().toString(36).slice(2, 7)}`,
									label: "Новое действие",
									stayNarration: "Что происходит, если выбрать это."
								}] }),
								className: "flex h-10 items-center gap-1 rounded-full border border-line px-3 text-xs uppercase tracking-wider text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Добавить"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 space-y-3",
							children: scene.choices.map((choice, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-[16px] border border-line bg-surface p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: choice.label,
										onChange: (e) => updateChoice(index, { label: e.target.value }),
										className: "h-11 w-full rounded-[12px] border border-line bg-bg px-3 text-sm text-paper"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 grid gap-2 md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-faint",
												children: ["Ведёт в сцену", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: choice.nextSceneId ?? "",
													onChange: (e) => updateChoice(index, { nextSceneId: e.target.value || void 0 }),
													className: "mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "",
														children: "остаться здесь"
													}), Object.keys(pack.scenes).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: id,
														children: id
													}, id))]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-faint",
												children: ["Спрятать, если флаг", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: choice.hideIfFlag ?? "",
													onChange: (e) => updateChoice(index, { hideIfFlag: e.target.value || void 0 }),
													className: "mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink",
													placeholder: "heard_widow"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-faint",
												children: ["Нужен флаг", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: choice.requiresFlag ?? "",
													onChange: (e) => updateChoice(index, { requiresFlag: e.target.value || void 0 }),
													className: "mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink",
													placeholder: "saw_pipe"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-faint",
												children: ["Любой из флагов (через запятую)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: (choice.requiresAnyFlags ?? []).join(", "),
													onChange: (e) => updateChoice(index, { requiresAnyFlags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }),
													className: "mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink",
													placeholder: "register_solved, saw_curtain"
												})]
											})
										]
									}),
									!choice.nextSceneId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: choice.stayNarration ?? "",
										onChange: (e) => updateChoice(index, { stayNarration: e.target.value }),
										rows: 3,
										className: "mt-2 w-full rounded-[12px] border border-line bg-bg px-3 py-2 text-sm text-ink",
										placeholder: "Текст, если остаёмся в сцене"
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-2 block text-xs text-faint",
										children: ["Поставить флаги (через запятую)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: (choice.setFlags ?? []).join(", "),
											onChange: (e) => updateChoice(index, { setFlags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }),
											className: "mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => updateScene(sceneId, { choices: scene.choices.filter((_, i) => i !== index) }),
										className: "mt-2 text-xs uppercase tracking-wider text-danger",
										children: "Убрать действие"
									})
								]
							}, choice.id))
						})
					]
				}) : null]
			})
		]
	});
}
function labelOf(scene) {
	return LOCATIONS.find((l) => l.id === scene.locationId)?.name ?? scene.id;
}
function OutArrows({ scene }) {
	const next = scene.choices.filter((c) => c.nextSceneId);
	if (next.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-faint",
		children: "Из этой сцены нет перехода — проверьте, не тупик ли это."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 flex flex-wrap gap-2",
		children: next.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-muted",
			children: [
				c.label,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" }),
				c.nextSceneId
			]
		}, c.id))
	});
}
function IssueList({ issues, onSelect }) {
	if (issues.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-[16px] border border-line bg-surface/70 px-4 py-3 text-sm text-muted",
		children: "Поток цел: все переходы существуют, старт достижим."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 rounded-[16px] border border-line bg-surface/70 p-3",
		children: issues.map((issue, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => issue.sceneId && onSelect(issue.sceneId),
			className: cn("text-left text-sm", issue.level === "error" ? "text-danger" : "text-brass"),
			children: [issue.level === "error" ? "Стоп. " : "Заметка. ", issue.message]
		}) }, `${issue.message}-${i}`))
	});
}
function AddScene({ existing, onAdd }) {
	const [id, setId] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			const slug = id.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "");
			if (!slug || existing.includes(slug)) return;
			onAdd(slug);
			setId("");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: id,
			onChange: (e) => setId(e.target.value),
			placeholder: "id сцены",
			className: "h-10 flex-1 rounded-[12px] border border-line bg-bg px-3 text-sm text-paper"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "submit",
			className: "flex h-10 items-center gap-1 rounded-[12px] border border-line px-3 text-xs uppercase tracking-wider text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Сцена"]
		})]
	});
}
function Home() {
	const [tab, setTab] = (0, import_react.useState)("table");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "relative z-20 flex justify-center gap-2 px-4 pt-4",
			children: [["table", "Стол"], ["master", "Мастер"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: cn("h-10 rounded-full border px-4 text-xs uppercase tracking-[0.18em]", tab === id ? "border-paper bg-paper text-bg" : "border-line bg-bg/40 text-muted"),
				children: label
			}, id))
		}), tab === "master" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MasterStudio, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableLanding, {})]
	});
}
function TableLanding() {
	const navigate = useNavigate();
	const create = useCreateTable();
	const join = useJoinTable();
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-[calc(100dvh-3.5rem)] overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/locations/street.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col justify-end px-5 pb-10 pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.32em] text-brass",
						children: "Бекленд · 1349 · Червуд-боро"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-5xl leading-[0.95] text-paper md:text-6xl",
						children: "Червудский свидетель"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-sm leading-relaxed text-muted",
						children: "Детектив за одним столом в мире Повелителя тайн. Большой экран — сцена. Телефон — ваша роль, личные способности и то, что нельзя показывать остальным."
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: create.isPending,
							onClick: async () => {
								setError(null);
								const res = await create.mutateAsync();
								if (!res.ok) {
									setError(res.error);
									return;
								}
								navigate({
									to: "/table/$code",
									params: { code: res.code }
								});
							},
							className: "h-12 rounded-[18px] bg-paper text-sm font-medium text-bg disabled:opacity-40",
							children: "Открыть стол на этом экране"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex gap-2",
							onSubmit: async (e) => {
								e.preventDefault();
								setError(null);
								const c = code.trim().toUpperCase();
								if (c.length < 4) return;
								const res = await join.mutateAsync(c);
								if (!res.ok) {
									setError(res.error);
									return;
								}
								navigate({
									to: "/play/$code",
									params: { code: res.code }
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: code,
								onChange: (e) => setCode(e.target.value.toUpperCase()),
								placeholder: "Код стола",
								className: "h-12 flex-1 rounded-[18px] border border-line bg-bg/70 px-4 font-display text-xl tracking-[0.2em] text-paper placeholder:text-faint",
								autoCapitalize: "characters",
								autoComplete: "off",
								suppressHydrationWarning: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "h-12 rounded-[18px] border border-line px-4 text-sm text-paper",
								children: "Сесть"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-xs leading-relaxed text-faint",
						children: "Хост открывает стол на ноутбуке или телевизоре — там сразу появится QR. Остальные наводят камеру и попадают на телефонную страницу. Вкладка «Мастер» — кабинет: сцены, развилки, тупики."
					})
				]
			})
		]
	});
}
//#endregion
export { Home as component };
