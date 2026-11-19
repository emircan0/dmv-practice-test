-- Apply only to the new US Supabase project. No Turkish data or users are imported.
-- The client reads reviewed immutable releases; it has no publishing privileges.
begin;
create table public.us_content_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null check (length(trim(version)) > 0),
  state text not null check (state in ('AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY')),
  vehicle text not null default 'car' check (vehicle='car'),
  profile text not null check (profile in ('adult-first','teen-first')),
  language text not null default 'en' check (language='en'),
  status text not null default 'draft' check (status in ('draft','review','published','withdrawn')),
  payload jsonb not null default '{"rule":null,"questions":[],"lessons":[]}'::jsonb,
  reviewer text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(state,vehicle,profile,language,version),
  check (jsonb_typeof(payload)='object'),
  check (jsonb_typeof(payload->'questions')='array'),
  check (jsonb_typeof(payload->'lessons')='array'),
  check (status <> 'published' or (reviewer is not null and length(trim(reviewer))>0 and reviewed_at is not null and published_at is not null))
);
create index us_releases_lookup on public.us_content_releases(state,profile,vehicle,language,published_at desc) where status='published';
alter table public.us_content_releases enable row level security;
revoke all on public.us_content_releases from anon, authenticated;
grant select on public.us_content_releases to anon, authenticated;
create policy us_releases_public_read on public.us_content_releases for select to anon, authenticated using (status='published' and published_at<=now());
-- Published release contents and identifying fields cannot be edited. Withdraw and
-- publish a new version instead; saved attempts retain their question/rule snapshot.
create function public.us_release_immutable() returns trigger language plpgsql set search_path=public as $$
begin
 if old.status in ('published','withdrawn') and
   (new.payload is distinct from old.payload or new.version is distinct from old.version or new.state is distinct from old.state or
    new.profile is distinct from old.profile or new.vehicle is distinct from old.vehicle or new.language is distinct from old.language or
    new.published_at is distinct from old.published_at or new.reviewed_at is distinct from old.reviewed_at or new.reviewer is distinct from old.reviewer or
    new.status not in ('published','withdrawn')) then
   raise exception 'Published content is immutable. Create a new release.';
 end if;
 return new;
end $$;
create trigger us_release_immutable before update on public.us_content_releases for each row execute function public.us_release_immutable();
commit;
