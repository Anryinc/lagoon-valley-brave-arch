-- Shared campaign tables. Unowned rows keyed by room code (auth off).
create table if not exists rooms (
  code text primary key,
  host_client_id text not null,
  status text not null default 'lobby',
  council boolean not null default false,
  scene_id text not null default 'lobby',
  location_id text not null default 'street',
  speaker_id text,
  narration text not null default '',
  choices_json text not null default '[]',
  flags_json text not null default '{}',
  public_log_json text not null default '[]',
  clues_json text not null default '[]',
  puzzle_id text,
  last_public_event text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists seats (
  id text primary key,
  room_code text not null references rooms(code),
  client_id text not null,
  display_name text not null,
  character_id text,
  last_seen timestamptz not null default now(),
  unique (room_code, client_id)
);

create unique index if not exists seats_character_lock
  on seats (room_code, character_id)
  where character_id is not null;

create table if not exists private_notes (
  id text primary key,
  room_code text not null,
  client_id text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists private_notes_owner_idx
  on private_notes (room_code, client_id, created_at desc);
