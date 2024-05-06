alter table "public"."fixtures" alter column "away_team" drop not null;

alter table "public"."fixtures" alter column "game_week" drop not null;

alter table "public"."fixtures" alter column "home_team" drop not null;

alter table "public"."player_statistics" alter column "author" set default auth.uid();

alter table "public"."player_statistics" alter column "author" drop not null;


