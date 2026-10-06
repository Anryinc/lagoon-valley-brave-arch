-- Live campaign overlay. Unowned (auth off): the table is the GM's notebook.
create table if not exists campaign_pack (
  id text primary key,
  pack_json text not null,
  updated_at timestamptz not null default now()
);
