create or replace function public.save_team_submission(
  p_active_season text,
  p_allow_communication boolean,
  p_allowed_transfers boolean,
  p_contact_number text,
  p_edit_key uuid,
  p_player_ids integer[],
  p_team_email text,
  p_team_name text,
  p_team_owner text,
  p_total_team_value numeric
)
returns public.drafted_teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_team public.drafted_teams;
begin
  if exists (
    select 1
    from public.settings
    where setting_key = 'team_registration_open'
      and setting_value <> 'true'
  ) or exists (
    select 1
    from public.settings
    where setting_key = 'team_submission_deadline'
      and (now() at time zone 'Europe/London')::date > setting_value::date
  ) then
    raise exception 'Team registration is closed';
  end if;

  if p_edit_key is null then
    insert into public.drafted_teams (
      active_season,
      allow_communication,
      allowed_transfers,
      contact_number,
      team_email,
      team_name,
      team_owner,
      total_team_value
    )
    values (
      p_active_season,
      p_allow_communication,
      p_allowed_transfers,
      p_contact_number,
      p_team_email,
      p_team_name,
      p_team_owner,
      p_total_team_value
    )
    returning * into saved_team;
  else
    update public.drafted_teams
    set
      allow_communication = p_allow_communication,
      allowed_transfers = p_allowed_transfers,
      contact_number = p_contact_number,
      edited_count = coalesce(edited_count, 0) + 1,
      team_email = p_team_email,
      team_name = p_team_name,
      team_owner = p_team_owner,
      total_team_value = p_total_team_value
    where key = p_edit_key
      and active_season = p_active_season
    returning * into saved_team;

    if saved_team.drafted_team_id is null then
      raise exception 'No editable team found';
    end if;

    delete from public.drafted_players
    where drafted_team = saved_team.drafted_team_id;
  end if;

  insert into public.drafted_players (drafted_team, drafted_player)
  select saved_team.drafted_team_id, player_id
  from unnest(p_player_ids) as player_id;

  return saved_team;
end;
$$;

revoke all on function public.save_team_submission(
  text,
  boolean,
  boolean,
  text,
  uuid,
  integer[],
  text,
  text,
  text,
  numeric
) from public, anon, authenticated;

grant execute on function public.save_team_submission(
  text,
  boolean,
  boolean,
  text,
  uuid,
  integer[],
  text,
  text,
  text,
  numeric
) to service_role;
