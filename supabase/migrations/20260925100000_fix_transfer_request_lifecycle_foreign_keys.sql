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
