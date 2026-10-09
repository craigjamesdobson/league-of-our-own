-- Transfer request cancellation, gameweek hardening, and lifecycle FKs.
alter table public.transfer_requests
  add column cancelled_at timestamptz;

alter table public.transfer_requests
  drop constraint if exists transfer_requests_status_check;

alter table public.transfer_requests
  add constraint transfer_requests_status_check
  check (status in ('pending', 'approved', 'rejected', 'cancelled'));

create or replace function public.cancel_transfer_request(
  p_transfer_request_id bigint,
  p_team_key uuid
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
  active_season text;
  current_gameweek integer;
begin
  select setting_value
  into active_season
  from public.settings
  where setting_key = 'active_season';

  select setting_value::integer
  into current_gameweek
  from public.settings
  where setting_key = 'current_gameweek';

  if active_season is null or current_gameweek is null then
    raise exception 'Transfer settings are invalid';
  end if;

  select transfer_request.*
  into request_row
  from public.transfer_requests transfer_request
  join public.drafted_teams drafted_team
    on drafted_team.drafted_team_id = transfer_request.drafted_team_id
  where transfer_request.transfer_request_id = p_transfer_request_id
    and transfer_request.active_season = active_season
    and transfer_request.status = 'pending'
    and drafted_team.active_season = active_season
    and drafted_team.allowed_transfers = true
    and drafted_team.key = p_team_key
  for update of transfer_request;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request not found';
  end if;

  if request_row.target_gameweek <= current_gameweek then
    raise exception 'Transfer request deadline has passed';
  end if;

  update public.transfer_requests
  set
    status = 'cancelled',
    cancelled_at = now()
  where transfer_request_id = request_row.transfer_request_id
  returning * into request_row;

  return request_row;
end;
$$;

revoke all on function public.cancel_transfer_request(bigint, uuid)
from public, anon, authenticated;

grant execute on function public.cancel_transfer_request(bigint, uuid)
to service_role;

create or replace function public.cancel_transfer_request_item(
  p_transfer_request_id bigint,
  p_transfer_number integer,
  p_team_key uuid
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
  active_season text;
  current_gameweek integer;
  item_count integer;
begin
  if p_transfer_number not between 1 and 2 then
    raise exception 'Invalid transfer number';
  end if;

  select setting_value
  into active_season
  from public.settings
  where setting_key = 'active_season';

  select setting_value::integer
  into current_gameweek
  from public.settings
  where setting_key = 'current_gameweek';

  if active_season is null or current_gameweek is null then
    raise exception 'Transfer settings are invalid';
  end if;

  select transfer_request.*
  into request_row
  from public.transfer_requests transfer_request
  join public.drafted_teams drafted_team
    on drafted_team.drafted_team_id = transfer_request.drafted_team_id
  where transfer_request.transfer_request_id = p_transfer_request_id
    and transfer_request.active_season = active_season
    and transfer_request.status = 'pending'
    and drafted_team.active_season = active_season
    and drafted_team.allowed_transfers = true
    and drafted_team.key = p_team_key
  for update of transfer_request;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request not found';
  end if;

  if request_row.target_gameweek <= current_gameweek then
    raise exception 'Transfer request deadline has passed';
  end if;

  select count(*)
  into item_count
  from public.transfer_request_items
  where transfer_request_id = request_row.transfer_request_id;

  if not exists (
    select 1
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
      and transfer_number = p_transfer_number
  ) then
    raise exception 'Transfer request item not found';
  end if;

  if item_count = 1 then
    update public.transfer_requests
    set
      status = 'cancelled',
      cancelled_at = now()
    where transfer_request_id = request_row.transfer_request_id
    returning * into request_row;

    return request_row;
  end if;

  delete from public.transfer_request_items
  where transfer_request_id = request_row.transfer_request_id
    and transfer_number = p_transfer_number;

  if p_transfer_number = 1 then
    update public.transfer_request_items
    set transfer_number = 1
    where transfer_request_id = request_row.transfer_request_id
      and transfer_number = 2;
  end if;

  return request_row;
end;
$$;

revoke all on function public.cancel_transfer_request_item(bigint, integer, uuid)
from public, anon, authenticated;

grant execute on function public.cancel_transfer_request_item(bigint, integer, uuid)
to service_role;

create or replace function public.cancel_transfer_request(
  p_transfer_request_id bigint,
  p_team_key uuid
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
  v_active_season text;
  v_current_gameweek integer;
begin
  select setting_value
  into v_active_season
  from public.settings
  where setting_key = 'active_season';

  select setting_value::integer
  into v_current_gameweek
  from public.settings
  where setting_key = 'current_gameweek';

  if v_active_season is null or v_current_gameweek is null then
    raise exception 'Transfer settings are invalid';
  end if;

  select transfer_request.*
  into request_row
  from public.transfer_requests transfer_request
  join public.drafted_teams drafted_team
    on drafted_team.drafted_team_id = transfer_request.drafted_team_id
  where transfer_request.transfer_request_id = p_transfer_request_id
    and transfer_request.active_season = v_active_season
    and transfer_request.status = 'pending'
    and drafted_team.active_season = v_active_season
    and drafted_team.allowed_transfers = true
    and drafted_team.key = p_team_key
  for update of transfer_request;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request not found';
  end if;

  if request_row.target_gameweek <= v_current_gameweek then
    raise exception 'Transfer request deadline has passed';
  end if;

  update public.transfer_requests
  set
    status = 'cancelled',
    cancelled_at = now()
  where transfer_request_id = request_row.transfer_request_id
  returning * into request_row;

  return request_row;
end;
$$;

create or replace function public.cancel_transfer_request_item(
  p_transfer_request_id bigint,
  p_transfer_number integer,
  p_team_key uuid
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
  v_active_season text;
  v_current_gameweek integer;
  item_count integer;
begin
  if p_transfer_number not between 1 and 2 then
    raise exception 'Invalid transfer number';
  end if;

  select setting_value
  into v_active_season
  from public.settings
  where setting_key = 'active_season';

  select setting_value::integer
  into v_current_gameweek
  from public.settings
  where setting_key = 'current_gameweek';

  if v_active_season is null or v_current_gameweek is null then
    raise exception 'Transfer settings are invalid';
  end if;

  select transfer_request.*
  into request_row
  from public.transfer_requests transfer_request
  join public.drafted_teams drafted_team
    on drafted_team.drafted_team_id = transfer_request.drafted_team_id
  where transfer_request.transfer_request_id = p_transfer_request_id
    and transfer_request.active_season = v_active_season
    and transfer_request.status = 'pending'
    and drafted_team.active_season = v_active_season
    and drafted_team.allowed_transfers = true
    and drafted_team.key = p_team_key
  for update of transfer_request;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request not found';
  end if;

  if request_row.target_gameweek <= v_current_gameweek then
    raise exception 'Transfer request deadline has passed';
  end if;

  select count(*)
  into item_count
  from public.transfer_request_items
  where transfer_request_id = request_row.transfer_request_id;

  if not exists (
    select 1
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
      and transfer_number = p_transfer_number
  ) then
    raise exception 'Transfer request item not found';
  end if;

  if item_count = 1 then
    update public.transfer_requests
    set
      status = 'cancelled',
      cancelled_at = now()
    where transfer_request_id = request_row.transfer_request_id
    returning * into request_row;

    return request_row;
  end if;

  delete from public.transfer_request_items
  where transfer_request_id = request_row.transfer_request_id
    and transfer_number = p_transfer_number;

  if p_transfer_number = 1 then
    update public.transfer_request_items
    set transfer_number = 1
    where transfer_request_id = request_row.transfer_request_id
      and transfer_number = 2;
  end if;

  return request_row;
end;
$$;

revoke all on function public.cancel_transfer_request(bigint, uuid)
from public, anon, authenticated;

grant execute on function public.cancel_transfer_request(bigint, uuid)
to service_role;

revoke all on function public.cancel_transfer_request_item(bigint, integer, uuid)
from public, anon, authenticated;

grant execute on function public.cancel_transfer_request_item(bigint, integer, uuid)
to service_role;

-- Keep transfer-request validation aligned with the active gameweek shown in the UI.
-- The workflow functions are already created by the preceding migration. This
-- corrective migration replaces their installed definitions without duplicating
-- the full function bodies here.
do $migration$
declare
  function_row record;
  function_definition text;
  original_function_definition text;
  approval_guard text := 'Transfer request must be approved during its target gameweek';
begin
  for function_row in
    select
      p.oid,
      p.proname,
      pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('save_transfer_request', 'approve_transfer_request')
  loop
    function_definition := function_row.definition;
    original_function_definition := function_definition;

    -- A request may only be approved once the administrator has advanced the
    -- active gameweek to the gameweek the request targets. This prevents an
    -- old pending request being applied retrospectively after a missed week.
    if function_row.proname = 'approve_transfer_request' then
      function_definition := replace(
        function_definition,
        $$  if request_row.target_gameweek not between 1 and 38
    or current_gameweek is null then
    raise exception 'Invalid transfer gameweek';
  end if;$$,
        $$  if request_row.target_gameweek not between 1 and 38
    or current_gameweek is null then
    raise exception 'Invalid transfer gameweek';
  end if;

  if request_row.target_gameweek <> current_gameweek then
    raise exception 'Transfer request must be approved during its target gameweek';
  end if;$$
      );
      if position(approval_guard in function_definition) = 0 then
        raise exception 'Could not install transfer approval gameweek guard';
      end if;
    end if;

    -- Select the latest transfer that is live in the relevant gameweek. A
    -- future transfer must not change the squad, budget, or duplicate checks
    -- for an earlier request.
    function_definition := regexp_replace(
      function_definition,
      'where transfer\.drafted_player = drafted_player\.drafted_player_id[[:space:]]+order by transfer\.transfer_week desc',
      'where transfer.drafted_player = drafted_player.drafted_player_id' || E'\n        and transfer.transfer_week <= current_gameweek\n      order by transfer.transfer_week desc',
      'g'
    );
    if function_definition = original_function_definition then
      raise exception 'Could not install transfer gameweek guards for %', function_row.proname;
    end if;
    if position('and transfer.transfer_week <= current_gameweek' in function_definition) = 0 then
      raise exception 'Could not install transfer gameweek filter for %', function_row.proname;
    end if;
    function_definition := regexp_replace(
      function_definition,
      'where transfer\.drafted_player = squad_player\.drafted_player_id[[:space:]]+order by transfer\.transfer_week desc',
      'where transfer.drafted_player = squad_player.drafted_player_id' || E'\n        and transfer.transfer_week <= current_gameweek\n      order by transfer.transfer_week desc',
      'g'
    );
    if function_definition ~ 'where transfer\.drafted_player = squad_player\.drafted_player_id[[:space:]]+order by transfer\.transfer_week desc' then
      raise exception 'Could not install squad transfer gameweek filter for %', function_row.proname;
    end if;

    execute function_definition;
  end loop;
end;
$migration$;

-- Transfer requests are operational-season data. Removing a drafted team or
-- drafted player must remove dependent request history during a reset.

alter table public.transfer_requests
  drop constraint if exists transfer_requests_drafted_team_id_fkey;

alter table public.transfer_requests
  add constraint transfer_requests_drafted_team_id_fkey
  foreign key (drafted_team_id)
  references public.drafted_teams(drafted_team_id)
  on delete cascade;

alter table public.transfer_request_items
  drop constraint if exists transfer_request_items_drafted_player_id_fkey;

alter table public.transfer_request_items
  add constraint transfer_request_items_drafted_player_id_fkey
  foreign key (drafted_player_id)
  references public.drafted_players(drafted_player_id)
  on delete cascade;
