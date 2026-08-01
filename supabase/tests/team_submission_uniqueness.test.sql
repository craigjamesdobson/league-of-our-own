begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

insert into public.drafted_teams (
  team_name,
  team_owner,
  team_email,
  allowed_transfers,
  active_season,
  total_team_value
)
values
  ('Seasonal Wanderers', 'Alex', 'alex@example.test', false, '25-26', 80);

select lives_ok(
  $$
    insert into public.drafted_teams (
      team_name,
      team_owner,
      team_email,
      allowed_transfers,
      active_season,
      total_team_value
    )
    values ('Seasonal Wanderers', 'Alex', 'alex@example.test', false, '26-27', 80)
  $$,
  'an entrant can reuse their email and team name in another season'
);

select throws_ok(
  $$
    insert into public.drafted_teams (
      team_name,
      team_owner,
      team_email,
      allowed_transfers,
      active_season,
      total_team_value
    )
    values ('Different Team', 'Alex', '  ALEX@EXAMPLE.TEST  ', false, '25-26', 80)
  $$,
  '23505',
  'duplicate key value violates unique constraint "drafted_teams_season_email_unique"',
  'email ownership is case-insensitive and whitespace-insensitive within a season'
);

select throws_ok(
  $$
    insert into public.drafted_teams (
      team_name,
      team_owner,
      team_email,
      allowed_transfers,
      active_season,
      total_team_value
    )
    values ('  SEASONAL WANDERERS  ', 'Blair', 'blair@example.test', false, '25-26', 80)
  $$,
  '23505',
  'duplicate key value violates unique constraint "drafted_teams_season_name_unique"',
  'team names are case-insensitive and whitespace-insensitive within a season'
);

select * from finish();

rollback;
