insert into public.settings (setting_key, setting_value)
values
  ('active_season', '25-26'),
  ('current_gameweek', '1'),
  ('site_open', 'false'),
  ('team_registration_open', 'false')
on conflict (setting_key) do nothing;
