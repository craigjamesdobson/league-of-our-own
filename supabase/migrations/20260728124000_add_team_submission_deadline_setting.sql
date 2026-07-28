insert into public.settings (setting_key, setting_value)
values ('team_submission_deadline', '2026-08-20')
on conflict (setting_key) do nothing;
