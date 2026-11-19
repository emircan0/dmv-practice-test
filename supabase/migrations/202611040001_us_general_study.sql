-- General study is explicitly reviewed for both age groups, never inferred from
-- an adult/teen package. Keep published releases and historical results intact.
begin;
alter table public.us_content_releases
  drop constraint us_content_releases_profile_check;
alter table public.us_content_releases
  add constraint us_content_releases_profile_check
  check (profile in ('general-first', 'adult-first', 'teen-first'));
commit;
