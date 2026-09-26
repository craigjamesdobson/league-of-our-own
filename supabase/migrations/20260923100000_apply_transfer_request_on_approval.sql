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
  request_item record;
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

  if not exists (
    select 1
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
  ) then
    raise exception 'Transfer request has no transfer items';
  end if;

  for request_item in
    select *
    from public.transfer_request_items
    where transfer_request_id = request_row.transfer_request_id
    order by transfer_number
  loop
    if not exists (
      select 1
      from public.drafted_players
      where drafted_player_id = request_item.drafted_player_id
        and drafted_team = request_row.drafted_team_id
    ) then
      raise exception 'A requested player no longer belongs to this team';
    end if;

    if exists (
      select 1
      from public.drafted_transfers
      where drafted_player = request_item.drafted_player_id
        and transfer_week = request_row.target_gameweek
    ) then
      raise exception 'A transfer already exists for this player and gameweek';
    end if;

    insert into public.drafted_transfers (
      drafted_player,
      player_id,
      transfer_week,
      active_transfer_expiry
    )
    values (
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

revoke all on function public.approve_transfer_request(bigint)
from public, anon;
grant execute on function public.approve_transfer_request(bigint)
to authenticated;
