alter table public.focus_sessions drop constraint focus_sessions_status_check;
alter table public.focus_sessions add constraint focus_sessions_status_check check (status in ('running', 'completed', 'cancelled', 'paused'));

alter table public.focus_sessions add column paused_at timestamptz;
alter table public.focus_sessions add column remaining_seconds integer;
