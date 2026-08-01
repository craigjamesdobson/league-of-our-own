do $$
begin
  if exists (
    select 1
    from public.drafted_teams
    group by active_season, lower(btrim(team_email))
    having count(*) > 1
  ) then
    raise exception 'Cannot enforce one team per email and season: duplicate team emails already exist';
  end if;

  if exists (
    select 1
    from public.drafted_teams
    group by active_season, lower(btrim(team_name))
    having count(*) > 1
  ) then
    raise exception 'Cannot enforce unique team names per season: duplicate team names already exist';
  end if;
end;
$$;

update public.drafted_teams
set
  team_email = lower(btrim(team_email)),
  team_name = btrim(team_name);

create unique index drafted_teams_season_email_unique
on public.drafted_teams (active_season, lower(btrim(team_email)));

create unique index drafted_teams_season_name_unique
on public.drafted_teams (active_season, lower(btrim(team_name)));
