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
