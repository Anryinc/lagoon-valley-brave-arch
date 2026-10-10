# Host-authoritative P2P — план

## Цель

Большой экран = **хост** (источник правды в памяти вкладки).
Телефоны = гости по WebRTC data channel.
Игровая БД на сервере **не нужна** для сессии.
Сервер только для **signaling** (roster + SDP/ICE), пока mesh не собрался.

## Файлы

| Файл | Роль |
|------|------|
| `src/lib/game/host-engine.ts` | Состояние стола в памяти, applyChoice/ability/claim |
| `src/lib/game/p2p-protocol.ts` | Сообщения host↔guest |
| `src/lib/game/use-p2p-room.ts` | Хуки хоста и гостя поверх P2PRoom |
| `src/lib/multiplayer/signaling.server.ts` | Relay SDP/ICE (эфемерные таблицы) |
| `src/routes/api/rtc.ts` | `GET/POST /api/rtc` |
| `src/routes/index.tsx` | Создание кода стола локально |
| `src/routes/table.$code.tsx` | Хост: engine + StageView |
| `src/routes/play.$code.tsx` | Гость: P2P + PlayerTable |
| `src/lib/game/use-room.ts` | Обёртка: p2p path (старый server poll отключается) |

## Протокол (кратко)

- Guest → Host: `hello`, `claim`, `start`, `choose`, `ability`, `speak`, `register`, `council`, `closePuzzle`
- Host → Guest (персонально): `snapshot` (RoomSnapshot под clientId)
- Host → Guest: `abilityResult` (private note)

## Ограничения v1

- Сессия живёт, пока открыта вкладка хоста
- Free-text речь: fuzzy match по choices + fallback narration (без server AI)
- Signaling всё ещё требует любой backend с `/api/rtc` (не игровая БД)
