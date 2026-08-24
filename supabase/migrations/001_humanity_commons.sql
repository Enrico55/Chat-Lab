create extension if not exists pgcrypto;

create table if not exists public.hc_records (
  id text primary key,
  type text not null check (type in ('claim','evidence','critique','proposal','measurement','model_output','decision','supersession')),
  tags text[] not null default '{}',
  content_hash text not null unique,
  record jsonb not null,
  submitter_ip text,
  moderation_state text not null default 'visible' check (moderation_state in ('visible','limited','quarantined','removed_local')),
  ingested_at timestamptz not null default now()
);

create index if not exists hc_records_type_idx on public.hc_records(type);
create index if not exists hc_records_tags_idx on public.hc_records using gin(tags);
create index if not exists hc_records_ingested_idx on public.hc_records(ingested_at desc);
create index if not exists hc_records_record_idx on public.hc_records using gin(record jsonb_path_ops);

alter table public.hc_records enable row level security;

revoke all on public.hc_records from anon, authenticated;
grant select on public.hc_records to anon, authenticated;

create policy if not exists "public can read non-local-removed records"
on public.hc_records for select
to anon, authenticated
using (moderation_state <> 'removed_local');

comment on table public.hc_records is 'Append-oriented Humanity Commons public record store. Writes are performed only by server-side service credentials.';
