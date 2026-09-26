-- Final administrator approval and rejection workflow.
create or replace function public.approve_transfer_request(
  p_transfer_request_id bigint
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
  team_row public.drafted_teams;
  request_item record;
  item_count integer;
  current_gameweek integer;
  active_season text;
  current_team_value numeric := 0;
  next_team_value numeric := 0;
  outgoing_cost numeric;
  incoming_cost numeric;
  outgoing_position integer;
  incoming_position integer;
  outgoing_name text;
  incoming_name text;
  incoming_unavailable boolean;
  january_first date;
  previous_period_transfers integer := 0;
  later_period_transfers integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Administrator authentication is required';
  end if;

  select setting_value
  into active_season
  from public.settings
  where setting_key = 'active_season';

  select setting_value::integer
  into current_gameweek
  from public.settings
  where setting_key = 'current_gameweek';

  select *
  into request_row
  from public.transfer_requests
  where transfer_request_id = p_transfer_request_id
    and status = 'pending'
  for update;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request is no longer pending';
  end if;

  if request_row.active_season is distinct from active_season then
    raise exception 'Transfer request belongs to an inactive season';
  end if;

  select *
  into team_row
  from public.drafted_teams
  where drafted_team_id = request_row.drafted_team_id
  for update;

  if team_row.drafted_team_id is null
    or team_row.active_season is distinct from active_season
    or team_row.allowed_transfers is not true then
    raise exception 'The transfer team is no longer eligible';
  end if;

  if request_row.target_gameweek not between 1 and 38
    or current_gameweek is null then
    raise exception 'Invalid transfer gameweek';
  end if;

  select count(*)
  into item_count
  from public.transfer_request_items
  where transfer_request_id = request_row.transfer_request_id;

  if item_count not between 1 and 2 then
    raise exception 'Transfer request must contain one or two transfers';
  end if;

  if exists (
    select 1
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    group by drafted_player_id
    having count(*) > 1
  ) or exists (
    select 1
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    group by player_id
    having count(*) > 1
  ) then
    raise exception 'A player can only be included once in a transfer request';
  end if;

  for request_item in
    select *
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    order by transfer_number
  loop
    select
      current_player.cost,
      current_player.position,
      incoming_player.cost,
      incoming_player.position,
      current_player.web_name,
      incoming_player.web_name,
      coalesce(incoming_player.unavailable_for_season, false)
    into outgoing_cost, outgoing_position, incoming_cost, incoming_position,
      outgoing_name, incoming_name, incoming_unavailable
    from public.drafted_players drafted_player
    left join lateral (
      select transfer.player_id
      from public.drafted_transfers transfer
      where transfer.drafted_player = drafted_player.drafted_player_id
      order by transfer.transfer_week desc, transfer.drafted_transfer_id desc
      limit 1
    ) latest_transfer on true
    join public.players_view current_player
      on current_player.player_id = coalesce(latest_transfer.player_id, drafted_player.drafted_player)
    join public.players_view incoming_player
      on incoming_player.player_id = request_item.player_id
    where drafted_player.drafted_player_id = request_item.drafted_player_id
      and drafted_player.drafted_team = request_row.drafted_team_id;

    if outgoing_cost is null or incoming_cost is null then
      raise exception 'One or more requested players could not be found for this team';
    end if;

    if incoming_unavailable then
      raise exception 'Incoming players are unavailable for the season';
    end if;

    if outgoing_position <> incoming_position then
      raise exception 'Incoming players must play in the same position as the outgoing player';
    end if;

    if lower(trim(request_item.player_out)) <> lower(trim(outgoing_name))
      or lower(trim(request_item.player_in)) <> lower(trim(incoming_name)) then
      raise exception 'Requested player details no longer match current player data';
    end if;

    if exists (
      select 1
      from public.drafted_players squad_player
      left join lateral (
        select transfer.player_id
        from public.drafted_transfers transfer
        where transfer.drafted_player = squad_player.drafted_player_id
        order by transfer.transfer_week desc, transfer.drafted_transfer_id desc
        limit 1
      ) latest_squad_transfer on true
      join public.players_view squad_current_player
        on squad_current_player.player_id = coalesce(latest_squad_transfer.player_id, squad_player.drafted_player)
      where squad_player.drafted_team = request_row.drafted_team_id
        and squad_current_player.player_id = request_item.player_id
    ) then
      raise exception 'Incoming players must not already be in the selected team';
    end if;

    if exists (
      select 1
      from public.drafted_transfers
      where drafted_player = request_item.drafted_player_id
        and transfer_week = request_row.target_gameweek
    ) then
      raise exception 'A transfer already exists for this player and gameweek';
    end if;

    next_team_value := next_team_value - outgoing_cost + incoming_cost;
  end loop;

  select coalesce(sum(current_player.cost), 0)
  into current_team_value
  from public.drafted_players drafted_player
  left join lateral (
    select transfer.player_id
    from public.drafted_transfers transfer
    where transfer.drafted_player = drafted_player.drafted_player_id
    order by transfer.transfer_week desc, transfer.drafted_transfer_id desc
    limit 1
  ) latest_transfer on true
  join public.players_view current_player
    on current_player.player_id = coalesce(latest_transfer.player_id, drafted_player.drafted_player)
  where drafted_player.drafted_team = request_row.drafted_team_id;

  next_team_value := current_team_value;
  for request_item in
    select *
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    order by transfer_number
  loop
    select current_player.cost, incoming_player.cost
    into outgoing_cost, incoming_cost
    from public.drafted_players drafted_player
    left join lateral (
      select transfer.player_id
      from public.drafted_transfers transfer
      where transfer.drafted_player = drafted_player.drafted_player_id
      order by transfer.transfer_week desc, transfer.drafted_transfer_id desc
      limit 1
    ) latest_transfer on true
    join public.players_view current_player
      on current_player.player_id = coalesce(latest_transfer.player_id, drafted_player.drafted_player)
    join public.players_view incoming_player
      on incoming_player.player_id = request_item.player_id
    where drafted_player.drafted_player_id = request_item.drafted_player_id
      and drafted_player.drafted_team = request_row.drafted_team_id;

    next_team_value := next_team_value - outgoing_cost + incoming_cost;
  end loop;

  if next_team_value > 85 then
    raise exception 'The requested transfers exceed the team budget';
  end if;

  january_first := make_date(
    2000 + split_part(request_row.active_season, '-', 2)::integer,
    1,
    1
  );

  select count(*)
  into previous_period_transfers
  from public.drafted_transfers transfer
  join public.drafted_players drafted_player on drafted_player.drafted_player_id = transfer.drafted_player
  where drafted_player.drafted_team = request_row.drafted_team_id
    and (transfer.created_at at time zone 'Europe/London')::date < january_first;

  select count(*)
  into later_period_transfers
  from public.drafted_transfers transfer
  join public.drafted_players drafted_player on drafted_player.drafted_player_id = transfer.drafted_player
  where drafted_player.drafted_team = request_row.drafted_team_id
    and (transfer.created_at at time zone 'Europe/London')::date >= january_first;

  if (request_row.created_at at time zone 'Europe/London')::date < january_first
    and previous_period_transfers + item_count > 2 then
    raise exception 'This team has already used its two transfers before 1 January';
  end if;

  if (request_row.created_at at time zone 'Europe/London')::date >= january_first
    and later_period_transfers + item_count > 2 then
    raise exception 'This team has already used its two transfers after 1 January';
  end if;

  for request_item in
    select *
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    order by transfer_number
  loop
    insert into public.drafted_transfers (
      created_at,
      drafted_player,
      player_id,
      transfer_week,
      active_transfer_expiry
    )
    values (
      request_row.created_at,
      request_item.drafted_player_id,
      request_item.player_id,
      request_row.target_gameweek,
      null
    );
  end loop;

  update public.transfer_requests
  set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where transfer_request_id = request_row.transfer_request_id
  returning * into request_row;

  return request_row;
end;
$$;

create or replace function public.reject_transfer_request(
  p_transfer_request_id bigint
)
returns public.transfer_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.transfer_requests;
begin
  if auth.uid() is null then
    raise exception 'Administrator authentication is required';
  end if;

  select *
  into request_row
  from public.transfer_requests
  where transfer_request_id = p_transfer_request_id
    and status = 'pending'
  for update;

  if request_row.transfer_request_id is null then
    raise exception 'Transfer request is no longer pending';
  end if;

  update public.transfer_requests
  set
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where transfer_request_id = request_row.transfer_request_id
  returning * into request_row;

  return request_row;
end;
$$;

revoke update (status, reviewed_at, reviewed_by)
on table public.transfer_requests
from authenticated;
drop policy if exists "Authenticated users can review transfer requests"
on public.transfer_requests;

revoke all on function public.approve_transfer_request(bigint)
from public, anon, authenticated;
grant execute on function public.approve_transfer_request(bigint)
to authenticated;

revoke all on function public.reject_transfer_request(bigint)
from public, anon, authenticated;
grant execute on function public.reject_transfer_request(bigint)
to authenticated;
