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
