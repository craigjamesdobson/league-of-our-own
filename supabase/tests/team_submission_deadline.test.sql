begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

update public.settings
set setting_value = case setting_key
  when 'team_registration_open' then 'true'
  when 'league_data_public' then 'true'
  when 'team_submission_deadline' then '2026-08-01'
end
where setting_key in (
  'team_registration_open',
  'league_data_public',
  'team_submission_deadline'
);

select lives_ok(
  $$select public.close_team_registration_if_due()$$,
  'the deadline closer runs successfully after the deadline'
);

select results_eq(
  $$select setting_value from public.settings where setting_key = 'team_registration_open'$$,
  $$values ('false'::text)$$,
  'the deadline closer disables team registration'
);

select results_eq(
  $$select setting_value from public.settings where setting_key = 'league_data_public'$$,
  $$values ('false'::text)$$,
  'the deadline closer keeps submitted teams hidden'
);

select throws_ok(
  $$
    select public.save_team_submission(
      '26-27', false, false, null, null, '{}'::integer[],
      'deadline@example.test', 'Deadline Team', 'Test Owner', 0
    )
  $$,
  'P0001',
  'Team registration is closed',
  'the database save function rejects late submissions'
);

select * from finish();

rollback;
