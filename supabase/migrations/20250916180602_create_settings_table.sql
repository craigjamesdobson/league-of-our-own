create sequence "public"."settings_setting_id_seq";

create table "public"."settings" (
    "setting_id" bigint not null default nextval('settings_setting_id_seq'::regclass),
    "setting_key" text not null,
    "setting_value" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
);


alter table "public"."settings" enable row level security;

alter sequence "public"."settings_setting_id_seq" owned by "public"."settings"."setting_id";

CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (setting_id);

CREATE UNIQUE INDEX settings_setting_key_key ON public.settings USING btree (setting_key);

alter table "public"."settings" add constraint "settings_pkey" PRIMARY KEY using index "settings_pkey";

alter table "public"."settings" add constraint "settings_setting_key_key" UNIQUE using index "settings_setting_key_key";

alter table "public"."settings" add constraint "settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."settings" validate constraint "settings_updated_by_fkey";

grant delete on table "public"."settings" to "anon";

grant insert on table "public"."settings" to "anon";

grant references on table "public"."settings" to "anon";

grant select on table "public"."settings" to "anon";

grant trigger on table "public"."settings" to "anon";

grant truncate on table "public"."settings" to "anon";

grant update on table "public"."settings" to "anon";

grant delete on table "public"."settings" to "authenticated";

grant insert on table "public"."settings" to "authenticated";

grant references on table "public"."settings" to "authenticated";

grant select on table "public"."settings" to "authenticated";

grant trigger on table "public"."settings" to "authenticated";

grant truncate on table "public"."settings" to "authenticated";

grant update on table "public"."settings" to "authenticated";

grant delete on table "public"."settings" to "service_role";

grant insert on table "public"."settings" to "service_role";

grant references on table "public"."settings" to "service_role";

grant select on table "public"."settings" to "service_role";

grant trigger on table "public"."settings" to "service_role";

grant truncate on table "public"."settings" to "service_role";

grant update on table "public"."settings" to "service_role";

create policy "Allow all users to read settings"
on "public"."settings"
as permissive
for select
to public
using (true);


create policy "Allow authenticated users to update settings"
on "public"."settings"
as permissive
for update
to authenticated
using (true);



