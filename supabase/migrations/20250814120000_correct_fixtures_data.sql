-- Fix fixtures data with correct season schedule  
-- This migration clears the existing fixtures data
-- Fixtures will be populated by seed.sql instead

BEGIN;

-- Clear existing fixtures data
DELETE FROM player_statistics WHERE fixture_id IN (SELECT id FROM fixtures);
DELETE FROM fixtures;

-- Reset the fixtures sequence to start fresh
ALTER SEQUENCE fixtures_id_seq RESTART WITH 1;

-- Fixtures data will be populated by seed.sql

COMMIT;