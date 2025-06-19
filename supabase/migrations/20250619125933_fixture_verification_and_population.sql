alter table "public"."fixtures" add column "populated_at" timestamp with time zone;

alter table "public"."fixtures" add column "populated_by" uuid;

alter table "public"."fixtures" add column "verified_at" timestamp with time zone;

alter table "public"."fixtures" add column "verified_by" uuid;

alter table "public"."fixtures" add constraint "fixtures_populated_by_fkey" FOREIGN KEY (populated_by) REFERENCES profiles(id) not valid;

alter table "public"."fixtures" validate constraint "fixtures_populated_by_fkey";

alter table "public"."fixtures" add constraint "fixtures_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES profiles(id) not valid;

alter table "public"."fixtures" validate constraint "fixtures_verified_by_fkey";


