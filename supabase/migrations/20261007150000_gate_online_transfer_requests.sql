-- Release the manual email option first. Keep the online workflow available
-- for a later rollout, with database enforcement even for cached admin screens.
insert into public.settings (setting_key, setting_value)
values ('online_transfer_requests_enabled', 'false')
on conflict (setting_key) do nothing;

create function public.require_online_transfer_requests_enabled()
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.settings
    where setting_key = 'online_transfer_requests_enabled'
      and setting_value = 'true'
  ) then
    raise exception 'Online transfer requests are not currently available';
  end if;
end;
$$;

-- Only the existing SECURITY DEFINER workflow functions call this helper.
revoke all on function public.require_online_transfer_requests_enabled()
from public, anon, authenticated, service_role;

do $migration$
declare
  function_row record;
  function_definition text;
  function_count integer := 0;
begin
  for function_row in
    select p.proname, pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'save_transfer_request', 'approve_transfer_request', 'reject_transfer_request',
        'cancel_transfer_request', 'cancel_transfer_request_item'
      )
  loop
    function_definition := regexp_replace(
      function_row.definition,
      E'begin\n',
      E'begin\n  perform public.require_online_transfer_requests_enabled();\n'
    );

    if function_definition = function_row.definition then
      raise exception 'Could not gate online transfer function %', function_row.proname;
    end if;

    execute function_definition;
    function_count := function_count + 1;
  end loop;

  if function_count <> 5 then
    raise exception 'Expected five online transfer functions, found %', function_count;
  end if;
end;
$migration$;
