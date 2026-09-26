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
