-- Apply to the NEW US project after 202610300001. No Turkish users/data.
begin;
create table public.us_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null default '' check(length(nickname)<=30),
 show_ranking boolean not null default false,
 hide_avatar boolean not null default true,
 check(not show_ranking or length(trim(nickname))>0)
);
alter table public.us_profiles enable row level security;
grant select,insert,update on public.us_profiles to authenticated;
create policy us_profile_self on public.us_profiles for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create table public.us_attempts (
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id text not null,
 release_id uuid not null references public.us_content_releases(id),
 state text not null, profile text not null,
 mode text not null check(mode in ('practice','exam','mistakes','favorites','daily')),
 correct integer not null, answered integer not null, total integer not null,
 completed_at timestamptz not null default now(),
 primary key(user_id,session_id)
);
alter table public.us_attempts enable row level security;
grant select on public.us_attempts to authenticated;
create policy us_attempts_self on public.us_attempts for select to authenticated using(auth.uid()=user_id);
-- Only this function can write scores. Recompute them from reviewed release data.
create function public.us_record_attempt(p_session_id text,p_release_id uuid,p_mode text,p_question_ids text[],p_answers jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare r public.us_content_releases; q jsonb; answer_text text; n integer:=0; good integer:=0; answered integer:=0;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if exists(select 1 from public.us_attempts where user_id=auth.uid() and session_id=p_session_id) then return;end if;
 if p_mode not in ('practice','exam','mistakes','favorites','daily') or cardinality(p_question_ids)<1 or cardinality(p_question_ids)>200 or jsonb_typeof(p_answers)<>'object' then raise exception 'Invalid attempt';end if;
 select * into r from public.us_content_releases where id=p_release_id and status in ('published','withdrawn');
 if not found then raise exception 'Unknown release';end if;
 if (select count(distinct value) from unnest(p_question_ids) value)<>cardinality(p_question_ids) then raise exception 'Duplicate questions';end if;
 for q in select value from jsonb_array_elements(r.payload->'questions') where value->>'id'=any(p_question_ids) loop
  n:=n+1;answer_text:=p_answers->>(q->>'id');
  if answer_text is not null then
   if answer_text !~ '^\d{1,3}$' or answer_text::integer>=jsonb_array_length(q->'options') then raise exception 'Invalid answer';end if;
   answered:=answered+1;if answer_text::integer=(q->>'correctIndex')::integer then good:=good+1;end if;
  end if;
 end loop;
 if n<>cardinality(p_question_ids) or answered=0 then raise exception 'Incomplete attempt';end if;
 insert into public.us_attempts(user_id,session_id,release_id,state,profile,mode,correct,answered,total) values(auth.uid(),p_session_id,p_release_id,r.state,r.profile,p_mode,good,answered,n) on conflict do nothing;
end $$;
revoke all on function public.us_record_attempt(text,uuid,text,text[],jsonb) from public;
grant execute on function public.us_record_attempt(text,uuid,text,text[],jsonb) to authenticated;
create function public.us_leaderboard(p_state text,p_profile text,p_metric text default 'success',p_month_offset integer default 0)
returns table(user_id uuid,nickname text,average_score numeric,total_solved bigint,exams_completed bigint)
language sql stable security definer set search_path=public as $$
 select a.user_id,p.nickname,round(sum(a.correct)::numeric/nullif(sum(a.total),0)*100,1),sum(a.answered),count(*)
 from public.us_attempts a join public.us_profiles p on p.user_id=a.user_id
 where auth.uid() is not null and p.show_ranking and a.state=p_state and a.profile=p_profile
 and p_month_offset in (0,1) and p_metric in ('success','activity')
 and a.completed_at>=(date_trunc('month',now() at time zone 'UTC') at time zone 'UTC')-make_interval(months=>p_month_offset)
 and a.completed_at<(date_trunc('month',now() at time zone 'UTC') at time zone 'UTC')+make_interval(months=>1-p_month_offset)
 group by a.user_id,p.nickname
 order by case when p_metric='success' then sum(a.correct)::numeric/nullif(sum(a.total),0) else sum(a.answered)::numeric end desc,a.user_id
 limit 100;
$$;
revoke all on function public.us_leaderboard(text,text,text,integer) from public;
grant execute on function public.us_leaderboard(text,text,text,integer) to authenticated;
commit;
