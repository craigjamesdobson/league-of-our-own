-- Two transfers are available before January; unused allowance carries over,
-- so after January the limit is four across the whole season.
-- Preserve the installed validation, locking and gameweek guards in both RPCs.
do $migration$
declare
  function_row record;
  function_definition text;
  old_guard text;
  new_guard text;
begin
  for function_row in
    select p.proname, pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('save_transfer_request', 'approve_transfer_request')
  loop
    if function_row.proname = 'save_transfer_request' then
      old_guard := $$  if (request_row.created_at at time zone 'Europe/London')::date >= january_first
    and later_period_transfers + jsonb_array_length(p_items) > 2 then
    raise exception 'This team has already used its two transfers after 1 January';
  end if;$$;
      new_guard := $$  if (request_row.created_at at time zone 'Europe/London')::date >= january_first
    and previous_period_transfers + later_period_transfers + jsonb_array_length(p_items) > 4 then
    raise exception 'This team has already used its four transfers for the season';
  end if;$$;
    else
      old_guard := $$  if (request_row.created_at at time zone 'Europe/London')::date >= january_first
    and later_period_transfers + item_count > 2 then
    raise exception 'This team has already used its two transfers after 1 January';
  end if;$$;
      new_guard := $$  if (request_row.created_at at time zone 'Europe/London')::date >= january_first
    and previous_period_transfers + later_period_transfers + item_count > 4 then
    raise exception 'This team has already used its four transfers for the season';
  end if;$$;
    end if;

    if position(old_guard in function_row.definition) = 0 then
      raise exception 'Could not install transfer carryover guard for %', function_row.proname;
    end if;

    function_definition := replace(function_row.definition, old_guard, new_guard);
    execute function_definition;
  end loop;
end;
$migration$;
