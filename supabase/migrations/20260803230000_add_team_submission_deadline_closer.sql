create or replace function public.close_team_registration_if_due()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.settings
  set
    setting_value = 'false',
    updated_at = now()
  where setting_key in ('team_registration_open', 'league_data_public')
    and exists (
      select 1
      from public.settings deadline_setting
      where deadline_setting.setting_key = 'team_submission_deadline'
        and (now() at time zone 'Europe/London')::date > deadline_setting.setting_value::date
    );
end;
$$;

revoke all on function public.close_team_registration_if_due() from public, anon, authenticated;
grant execute on function public.close_team_registration_if_due() to service_role;
