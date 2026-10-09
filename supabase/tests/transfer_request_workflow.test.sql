begin;

create extension if not exists pgtap with schema extensions;
select plan(47);

-- Isolated fixtures and all mutations roll back, including application settings.
update public.settings
set setting_value = case setting_key
  when 'active_season' then '26-27'
  when 'current_gameweek' then '7'
end
where setting_key in ('active_season', 'current_gameweek');

insert into public.teams (id, name, short_name)
values (-910001, 'Transfer Test Club', 'TTC');

insert into public.players (
  player_id, code, team, web_name, element_type, now_cost, cost_change_start_fall, status
)
values
  (-910001, -910001, -910001, 'Outgoing A', 2, 400, 0, 'a'),
  (-910002, -910002, -910001, 'Outgoing B', 2, 450, 0, 'a'),
  (-910003, -910003, -910001, 'Incoming A', 2, 350, 0, 'a'),
  (-910004, -910004, -910001, 'Incoming B', 2, 400, 0, 'a'),
  (-910005, -910005, -910001, 'Unavailable', 2, 350, 0, 'u'),
  (-910006, -910006, -910001, 'Wrong Position', 3, 350, 0, 'a'),
  (-910007, -910007, -910001, 'Too Expensive', 2, 1000, 0, 'a'),
  (-910008, -910008, -910001, 'Edited Incoming', 2, 300, 0, 'a'),
  (-910009, -910009, -910001, 'Higher Incoming', 2, 500, 0, 'a');

insert into public.drafted_teams (
  drafted_team_id, team_name, team_owner, team_email, allowed_transfers,
  active_season, total_team_value, key
)
values (
  -910001, 'Transfer Workflow Test', 'Test Manager', 'transfer-workflow@example.test',
  true, '26-27', 85, '91000100-0000-4000-8000-000000000001'
);

insert into public.drafted_players (drafted_player_id, drafted_team, drafted_player)
values (-910001, -910001, -910001), (-910002, -910001, -910002);

create temporary table workflow_requests (scenario text primary key, request_id bigint);

-- Helpers keep test calls readable while exercising the real installed RPCs.
create function pg_temp.transfer_item(slot integer, outgoing integer, incoming integer)
returns jsonb language sql as $$
  select jsonb_build_object(
    'transfer_number', slot, 'drafted_player_id', outgoing, 'player_id', incoming,
    'player_out', (select web_name from public.players where player_id = outgoing),
    'player_in', (select web_name from public.players where player_id = incoming)
  );
$$;

create function pg_temp.save_request(
  items jsonb,
  request_id bigint default null,
  team_key uuid default '91000100-0000-4000-8000-000000000001'
)
returns public.transfer_requests language sql as $$
  select public.save_transfer_request(
    '26-27', -910001, 'Transfer Workflow Test', team_key,
    'Test Manager', 'transfer-workflow@example.test',
    (select setting_value::integer + 1 from public.settings where setting_key = 'current_gameweek'),
    items, request_id
  );
$$;

select is(
  (select setting_value from public.settings where setting_key = 'online_transfer_requests_enabled'),
  'false', 'the online transfer workflow is disabled by default'
);

select ok(
  not has_function_privilege('authenticated', 'public.require_online_transfer_requests_enabled()', 'EXECUTE')
    and not has_function_privilege('service_role', 'public.require_online_transfer_requests_enabled()', 'EXECUTE'),
  'the feature gate helper cannot be invoked directly by application clients'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910003)))$$,
  'P0001', 'Online transfer requests are not currently available', 'disabled online requests cannot be saved'
);

select throws_ok($$select public.approve_transfer_request(-1)$$,
  'P0001', 'Online transfer requests are not currently available', 'disabled online requests cannot be approved');

select throws_ok($$select public.reject_transfer_request(-1)$$,
  'P0001', 'Online transfer requests are not currently available', 'disabled online requests cannot be rejected');

select throws_ok($$select public.cancel_transfer_request(-1, '91000100-0000-4000-8000-000000000001')$$,
  'P0001', 'Online transfer requests are not currently available', 'disabled online requests cannot be cancelled');

select throws_ok($$select public.cancel_transfer_request_item(-1, 1, '91000100-0000-4000-8000-000000000001')$$,
  'P0001', 'Online transfer requests are not currently available', 'disabled online request items cannot be cancelled');

set local role authenticated;

select lives_ok($$
  insert into public.drafted_transfers (drafted_player, player_id, transfer_week)
  values (-910001, -910003, 8)
$$, 'the existing manual transfer tools still write live transfers while online requests are disabled');

reset role;

delete from public.drafted_transfers where drafted_player in (-910001, -910002);

-- Enable the deferred workflow only inside this rolled-back test transaction.
update public.settings set setting_value = 'true' where setting_key = 'online_transfer_requests_enabled';

select ok(
  not has_table_privilege('anon', 'public.transfer_requests', 'SELECT')
    and not has_table_privilege('anon', 'public.transfer_request_items', 'SELECT'),
  'anonymous clients cannot read pending requests or their items'
);

select ok(
  not has_function_privilege('anon', 'public.approve_transfer_request(bigint)', 'EXECUTE')
    and not has_function_privilege('authenticated',
      'public.save_transfer_request(text,integer,text,uuid,text,text,integer,jsonb,bigint)', 'EXECUTE'),
  'public approval and direct authenticated request persistence are denied'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910003)),
    null, '91000100-0000-4000-8000-000000000002')$$,
  'P0001', 'No eligible transfer team found', 'an incorrect team key cannot create a request'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(
    pg_temp.transfer_item(1, -910001, -910003), pg_temp.transfer_item(2, -910002, -910004),
    pg_temp.transfer_item(3, -910001, -910008)))$$,
  'P0001', 'A transfer request must contain one or two transfers',
  'a request cannot contain more than two transfers'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(
    pg_temp.transfer_item(1, -910001, -910003), pg_temp.transfer_item(2, -910001, -910004)))$$,
  'P0001', 'A player can only be included once in a transfer request',
  'the same outgoing squad slot cannot be requested twice'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910005)))$$,
  'P0001', 'Incoming players are unavailable for the season', 'unavailable incoming players are denied'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910006)))$$,
  'P0001', 'Incoming players must play in the same position as the outgoing player',
  'a replacement in another position is denied'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910002)))$$,
  'P0001', 'Incoming players must not already be in the selected team',
  'a player already in the live squad cannot be requested'
);

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910007)))$$,
  'P0001', 'The requested transfers exceed the team budget', 'an over-budget request is denied'
);

select is((select count(*) from public.transfer_requests where drafted_team_id = -910001),
  0::bigint, 'failed validation rolls back the pending request and leaves no orphan');

select lives_ok($$
  insert into workflow_requests
  select 'main', (pg_temp.save_request(jsonb_build_array(
    pg_temp.transfer_item(1, -910001, -910003),
    pg_temp.transfer_item(2, -910002, -910009)))).transfer_request_id
$$, 'a valid pair with an offsetting saving creates one pending request');

select is((select count(*) from public.drafted_transfers where drafted_player in (-910001, -910002)),
  0::bigint, 'saving the request does not change the live roster');

select throws_ok(
  $$select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910003)))$$,
  'P0001', 'A transfer request is already pending for this team',
  'a second pending request for the team is rejected atomically'
);

select lives_ok($$
  select pg_temp.save_request(jsonb_build_array(
    pg_temp.transfer_item(1, -910001, -910008), pg_temp.transfer_item(2, -910002, -910004)),
    (select request_id from workflow_requests where scenario = 'main'))
$$, 'the matching team key can edit its pending request');

select results_eq($$
  select player_id from public.transfer_request_items
  where transfer_request_id = (select request_id from workflow_requests where scenario = 'main')
  order by transfer_number
$$, $$values (-910008), (-910004)$$, 'editing replaces the stored selections');

select throws_ok($$
  select public.cancel_transfer_request(
    (select request_id from workflow_requests where scenario = 'main'),
    '91000100-0000-4000-8000-000000000002')
$$, 'P0001', 'Transfer request not found', 'another team key cannot cancel the request');

select lives_ok($$
  select public.cancel_transfer_request_item(
    (select request_id from workflow_requests where scenario = 'main'), 1,
    '91000100-0000-4000-8000-000000000001')
$$, 'one of two pending transfers can be removed');

select results_eq($$
  select transfer_number, player_id from public.transfer_request_items
  where transfer_request_id = (select request_id from workflow_requests where scenario = 'main')
$$, $$values (1, -910004)$$, 'the remaining second transfer is renumbered to the first slot');

select throws_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'main'))
$$, 'P0001', 'Administrator authentication is required', 'approval requires an authenticated administrator');

select set_config('request.jwt.claim.sub', '91000100-0000-4000-8000-000000000099', true);

select throws_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'main'))
$$, 'P0001', 'Transfer request must be approved during its target gameweek',
  'approval before the target gameweek is denied');

update public.settings set setting_value = '8' where setting_key = 'current_gameweek';

select throws_ok($$
  select public.cancel_transfer_request((select request_id from workflow_requests where scenario = 'main'),
    '91000100-0000-4000-8000-000000000001')
$$, 'P0001', 'Transfer request deadline has passed', 'cancellation closes when the target gameweek begins');

update public.players set status = 'u' where player_id = -910004;

select throws_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'main'))
$$, 'P0001', 'Incoming players are unavailable for the season',
  'approval rechecks player availability after the request was saved');

select ok(
  (select status = 'pending' from public.transfer_requests
    where transfer_request_id = (select request_id from workflow_requests where scenario = 'main'))
    and not exists (select 1 from public.drafted_transfers where drafted_player in (-910001, -910002)),
  'failed approval preserves the pending status and the unchanged live roster'
);

update public.players set status = 'a' where player_id = -910004;

select lives_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'main'))
$$, 'administrator approval in the target gameweek applies the request');

select results_eq($$
  select drafted_player, player_id, transfer_week from public.drafted_transfers
  where drafted_player in (-910001, -910002)
$$, $$values (-910002::bigint, -910004, 8)$$,
  'only the remaining transfer becomes live in its target gameweek');

select results_eq($$
  select status, reviewed_by from public.transfer_requests
  where transfer_request_id = (select request_id from workflow_requests where scenario = 'main')
$$, $$values ('approved'::text, '91000100-0000-4000-8000-000000000099'::uuid)$$,
  'approval records the terminal status and reviewing administrator');

-- Use the next target week for rejection/cancellation; neither consumes allowance.
insert into workflow_requests
select 'rejected', (pg_temp.save_request(jsonb_build_array(
  pg_temp.transfer_item(1, -910001, -910003)))).transfer_request_id;

select lives_ok($$
  select public.reject_transfer_request((select request_id from workflow_requests where scenario = 'rejected'))
$$, 'an administrator can reject a pending request without applying it');

insert into workflow_requests
select 'cancelled', (pg_temp.save_request(jsonb_build_array(
  pg_temp.transfer_item(1, -910001, -910003)))).transfer_request_id;

select lives_ok($$
  select public.cancel_transfer_request_item(
    (select request_id from workflow_requests where scenario = 'cancelled'), 1,
    '91000100-0000-4000-8000-000000000001')
$$, 'removing the last pending transfer cancels the whole request');

insert into workflow_requests
select 'cancelled-full', (pg_temp.save_request(jsonb_build_array(
  pg_temp.transfer_item(1, -910001, -910003)))).transfer_request_id;

select lives_ok($$
  select public.cancel_transfer_request(
    (select request_id from workflow_requests where scenario = 'cancelled-full'),
    '91000100-0000-4000-8000-000000000001')
$$, 'the matching key can cancel a whole pending request before the deadline');

select results_eq($$
  select scenario, status from workflow_requests
  join public.transfer_requests on transfer_request_id = request_id
  where scenario in ('cancelled', 'cancelled-full', 'rejected') order by scenario
$$, $$values ('cancelled'::text, 'cancelled'::text), ('cancelled-full'::text, 'cancelled'::text),
  ('rejected'::text, 'rejected'::text)$$,
  'rejection and last-item cancellation record their expected terminal states');

select is((select count(*) from public.drafted_transfers where drafted_player in (-910001, -910002)),
  1::bigint, 'rejection and cancellation leave the approved live roster unchanged');

-- Controlled request timestamps exercise both halves of the season regardless
-- of the date CI runs. Edit-mode saves run the same allowance checks as creates.
delete from public.drafted_transfers where drafted_player in (-910001, -910002);
insert into public.drafted_transfers (drafted_player, player_id, transfer_week, created_at)
values
  (-910001, -910001, 1, '2026-10-01T12:00:00Z'),
  (-910001, -910001, 2, '2026-11-01T12:00:00Z');

with pending as (
  insert into public.transfer_requests (
    drafted_team_id, active_season, requester_name, requester_email, target_gameweek, created_at
  ) values (-910001, '26-27', 'Test Manager', 'transfer-workflow@example.test', 9, '2026-12-01T12:00:00Z')
  returning transfer_request_id
)
insert into workflow_requests select 'first-half-limit', transfer_request_id from pending;

select throws_ok($$
  select pg_temp.save_request(jsonb_build_array(pg_temp.transfer_item(1, -910001, -910003)),
    (select request_id from workflow_requests where scenario = 'first-half-limit'))
$$, 'P0001', 'This team has already used its two transfers before 1 January',
  'a third transfer before January is denied when saving');

insert into public.transfer_request_items (
  transfer_request_id, transfer_number, drafted_player_id, player_id, player_out, player_in
)
select request_id, 1, -910001, -910003, 'Outgoing A', 'Incoming A'
from workflow_requests where scenario = 'first-half-limit';

update public.settings set setting_value = '9' where setting_key = 'current_gameweek';

select throws_ok($$
  select public.approve_transfer_request(
    (select request_id from workflow_requests where scenario = 'first-half-limit'))
$$, 'P0001', 'This team has already used its two transfers before 1 January',
  'approval also rejects a third transfer requested before January');

delete from public.transfer_requests
where transfer_request_id = (select request_id from workflow_requests where scenario = 'first-half-limit');

-- No first-half transfers: two already used in January still leave two available.
update public.drafted_transfers
set created_at = '2027-01-01T12:00:00Z'
where drafted_player in (-910001, -910002);
update public.settings set setting_value = '8' where setting_key = 'current_gameweek';

with pending as (
  insert into public.transfer_requests (
    drafted_team_id, active_season, requester_name, requester_email, target_gameweek, created_at
  ) values (-910001, '26-27', 'Test Manager', 'transfer-workflow@example.test', 9, '2027-01-02T12:00:00Z')
  returning transfer_request_id
)
insert into workflow_requests select 'carryover', transfer_request_id from pending;

select lives_ok($$
  select pg_temp.save_request(jsonb_build_array(
    pg_temp.transfer_item(1, -910001, -910003), pg_temp.transfer_item(2, -910002, -910004)),
    (select request_id from workflow_requests where scenario = 'carryover'))
$$, 'unused first-half allowance permits a third and fourth transfer after January');

update public.settings set setting_value = '9' where setting_key = 'current_gameweek';

select lives_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'carryover'))
$$, 'approval applies both carried-over transfers after January');

select is((select count(*) from public.drafted_transfers where drafted_player in (-910001, -910002)),
  4::bigint, 'carried-over transfers bring the season total to four');

with pending as (
  insert into public.transfer_requests (
    drafted_team_id, active_season, requester_name, requester_email, target_gameweek, created_at
  ) values (-910001, '26-27', 'Test Manager', 'transfer-workflow@example.test', 10, '2027-01-03T12:00:00Z')
  returning transfer_request_id
)
insert into workflow_requests select 'season-limit', transfer_request_id from pending;

select throws_ok($$
  select pg_temp.save_request(jsonb_build_array(jsonb_build_object(
    'transfer_number', 1, 'drafted_player_id', -910001, 'player_id', -910008,
    'player_out', 'Incoming A', 'player_in', 'Edited Incoming')),
    (select request_id from workflow_requests where scenario = 'season-limit'))
$$, 'P0001', 'This team has already used its four transfers for the season',
  'a fifth transfer across the season is denied when saving');

insert into public.transfer_request_items (
  transfer_request_id, transfer_number, drafted_player_id, player_id, player_out, player_in
)
select request_id, 1, -910001, -910008, 'Incoming A', 'Edited Incoming'
from workflow_requests where scenario = 'season-limit';
update public.settings set setting_value = '10' where setting_key = 'current_gameweek';

select throws_ok($$
  select public.approve_transfer_request((select request_id from workflow_requests where scenario = 'season-limit'))
$$, 'P0001', 'This team has already used its four transfers for the season',
  'approval also rejects a fifth transfer across the season');

select ok(
  (select count(*) = 4 from public.drafted_transfers where drafted_player in (-910001, -910002))
    and (select status = 'pending' from public.transfer_requests
      where transfer_request_id = (select request_id from workflow_requests where scenario = 'season-limit')),
  'failed allowance validation leaves the roster and request status unchanged'
);

select * from finish();
rollback;
