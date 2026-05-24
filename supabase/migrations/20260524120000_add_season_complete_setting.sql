insert into public.settings (setting_key, setting_value)
values ('season_complete', 'false')
on conflict (setting_key) do nothing;
