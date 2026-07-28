insert into public.settings (setting_key, setting_value)
values ('league_data_public', 'false')
on conflict (setting_key) do nothing;
