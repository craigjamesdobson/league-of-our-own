-- Migration: Season 25-26 Data Reset
-- Created: 2025-07-21
-- 
-- This migration performs a complete season reset by:
-- 1. Clearing all existing fantasy football data (preserving user profiles)
-- 2. Resetting ID sequences for clean numbering
-- Note: Data will be populated by seed.sql instead of this migration
--
-- USAGE:
-- 1. Run via Supabase CLI: `supabase db reset --linked` (applies all migrations including this one)
-- 2. Or run individual migration: `supabase migration up` 
-- 3. Or apply directly to database via Supabase dashboard SQL editor
--
-- WARNING: This is a destructive operation that cannot be undone!
-- Make sure to backup any data you want to preserve before running.
--
-- Operations performed:
-- 1. Clear all fantasy football tables (preserving profiles)
-- 2. Reset ID sequences for clean numbering
-- Data population is handled by seed.sql
--
-- The 'profiles' table is intentionally preserved to maintain user accounts.

BEGIN;

-- Disable foreign key checks temporarily for easier deletion
SET session_replication_role = replica;

-- Clear child tables first (tables with foreign keys to other tables)
DELETE FROM drafted_transfers;
DELETE FROM drafted_players;
DELETE FROM player_statistics;
DELETE FROM weekly_statistics;

-- Clear parent tables
DELETE FROM drafted_teams;
DELETE FROM fixtures;
DELETE FROM players;
DELETE FROM teams;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Teams, players, and fixtures data will be populated by seed.sql

-- Reset sequences for tables with auto-incrementing IDs
-- Sequences will be set to appropriate values after seed data is loaded
ALTER SEQUENCE IF EXISTS teams_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS players_id_seq RESTART WITH 1;  
ALTER SEQUENCE IF EXISTS fixtures_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS drafted_teams_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS drafted_players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS drafted_transfers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS player_statistics_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS weekly_statistics_id_seq RESTART WITH 1;

COMMIT;

-- Verification query (optional - uncomment to run manually after migration)
-- SELECT 
--   schemaname,
--   tablename,
--   n_tup_ins as total_rows
-- FROM pg_stat_user_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;