# Database Schema & Patterns

**League of our own** - Fantasy Football Database Architecture

*Last updated: 2025-07-19*

## Overview

This document provides comprehensive documentation of the PostgreSQL database schema used by the League of our own fantasy football application. The database is hosted on Supabase and designed to support complex fantasy football operations including team management, player statistics, fixture tracking, and weekly competitions.

**Database Statistics:**
- **Platform**: PostgreSQL via Supabase
- **Security**: Row Level Security (RLS) enabled
- **Core Tables**: 9 primary tables
- **Views**: 1 computed view (`players_view`)
- **Functions**: 10+ stored procedures
- **Real-time**: Supabase subscriptions enabled

## Core Database Schema

### Table Relationships Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     teams       │    │    players      │    │    fixtures     │
│  id (PK)        │←───┤  team (FK)      │    │  id (PK)        │
│  name           │    │  player_id (PK) │    │  game_week      │
│  short_name     │    │  ...stats...    │    │  home_team (FK) │
└─────────────────┘    └─────────────────┘    │  away_team (FK) │
                                               └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ drafted_teams   │    │drafted_players  │    │player_statistics│
│drafted_team_id  │←───┤drafted_team (FK)│    │  id (PK)        │
│team_name        │    │drafted_player(FK)│    │  player_id (FK) │
│team_owner       │    │created_at       │    │  fixture_id (FK)│
│total_team_value │    └─────────────────┘    │  goals          │
│key (UUID)       │                           │  assists        │
└─────────────────┘                           │  points         │
        │                                     └─────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│drafted_transfers│    │weekly_statistics│    │    profiles     │
│drafted_transfer │    │  id (PK)        │    │  id (PK/FK)     │
│player_id (FK)   │    │  team (FK)      │    │  full_name      │
│transfer_week    │    │  week           │    │  username       │
│expiry_date      │    │  goals          │    │  avatar_url     │
└─────────────────┘    │  assists        │    └─────────────────┘
                       │  points         │
                       └─────────────────┘
```
## Primary Tables

### 1. `teams` - Premier League Teams

**Purpose**: Master table containing all Premier League teams for the current season.

```sql
CREATE TABLE teams (
    id integer PRIMARY KEY,
    name text NOT NULL,
    short_name text NOT NULL
);
```

**Key Fields:**
- `id`: Unique team identifier
- `name`: Full team name (e.g., "Arsenal", "Manchester United")
- `short_name`: Abbreviated name (e.g., "ARS", "MUN")

**Data Characteristics:**
- Contains all 20 Premier League teams
- Static reference data updated seasonally
- Used for player team assignments and fixture relationships

### 2. `players` - Fantasy Premier League Players

**Purpose**: Comprehensive player database with FPL-style statistics and pricing.

```sql
CREATE TABLE players (
    player_id integer PRIMARY KEY,
    team integer REFERENCES teams(id),
    first_name text,
    second_name text,
    web_name text,
    code bigint,
    element_type integer, -- 1=GK, 2=DEF, 3=MID, 4=FWD
    now_cost integer,
    cost_change_event integer,
    cost_change_start integer,
    cost_change_start_fall integer,
    total_points integer,
    event_points integer,
    form numeric,
    points_per_game numeric,
    selected_by_percent numeric,
    status text, -- 'a'=available, 'i'=injured, 'd'=doubtful, 's'=suspended
    -- ... many more FPL fields
);
```

**Key Statistics Fields:**
- **Performance**: `total_points`, `event_points`, `form`, `points_per_game`
- **Availability**: `status`, `minutes`, `chance_of_playing_this_round`
- **Pricing**: `now_cost`, `cost_change_event`, `cost_change_start`
- **Match Stats**: `goals_scored`, `assists`, `clean_sheets`, `red_cards`
- **Advanced Metrics**: `expected_goals`, `expected_assists`, `ict_index`

**Business Rules:**
- `element_type`: 1=Goalkeeper, 2=Defender, 3=Midfielder, 4=Forward
- `now_cost`: Player price in FPL points (divided by 10 for display)
- `status`: Player availability (a=available, i=injured, d=doubtful, s=suspended, u=unavailable)

### 3. `drafted_teams` - Fantasy Teams

**Purpose**: User-created fantasy teams with budget and transfer management.

```sql
CREATE TABLE drafted_teams (
    drafted_team_id integer PRIMARY KEY,
    team_name text NOT NULL,
    team_owner text NOT NULL,
    team_email text NOT NULL,
    active_season text NOT NULL,
    total_team_value numeric,
    key uuid UNIQUE NOT NULL,
    allowed_transfers boolean DEFAULT false,
    allow_communication boolean DEFAULT true,
    contact_number text,
    edited_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Key Business Fields:**
- `key`: UUID for secure team access and editing
- `allowed_transfers`: Whether team can make player transfers
- `total_team_value`: Calculated team value for budget validation
- `active_season`: Season identifier (e.g., "24-25")
- `edited_count`: Number of times team has been modified

**Budget Constraints:**
- Standard teams: 90 points maximum
- Teams with transfers: 85 points maximum
- Enforced through application logic and validation

### 4. `drafted_players` - Team Ownership

**Purpose**: Many-to-many relationship linking fantasy teams to their owned players.

```sql
CREATE TABLE drafted_players (
    drafted_player_id integer PRIMARY KEY,
    drafted_team integer REFERENCES drafted_teams(drafted_team_id),
    drafted_player integer REFERENCES players(player_id),
    created_at timestamptz DEFAULT now()
);
```

**Constraints:**
- Each team must have exactly 11 players
- Players can be owned by multiple teams
- Formation requirements: 1 GK, 4 DEF, 3 MID, 3 FWD

### 5. `drafted_transfers` - Transfer Management

**Purpose**: Tracking player transfers between teams with expiry management.

```sql
CREATE TABLE drafted_transfers (
    drafted_transfer_id integer PRIMARY KEY,
    drafted_player integer REFERENCES drafted_players(drafted_player_id),
    player_id integer REFERENCES players(player_id),
    transfer_week integer NOT NULL,
    active_transfer_expiry date,
    created_at timestamptz DEFAULT now()
);
```

**Transfer Logic:**
- `transfer_week`: Week when transfer becomes active
- `active_transfer_expiry`: Deadline for transfer activation
- Links to both old player (via `drafted_player`) and new player (via `player_id`)

### 6. `fixtures` - Match Fixtures

**Purpose**: Premier League match fixtures with scoring and verification workflow.

```sql
CREATE TABLE fixtures (
    id integer PRIMARY KEY,
    game_week integer NOT NULL,
    home_team integer REFERENCES teams(id),
    away_team integer REFERENCES teams(id),
    home_team_score integer,
    away_team_score integer,
    populated_at timestamptz,
    populated_by uuid REFERENCES auth.users(id),
    verified_at timestamptz,
    verified_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);
```

**Verification Workflow:**
- **Populate**: Admin enters match scores and player stats
- **Verify**: Different admin verifies the populated data
- **Process**: Weekly statistics calculated after verification
- **Audit Trail**: Tracks who populated and verified each fixture

### 7. `player_statistics` - Match Performance

**Purpose**: Individual player performance data for each fixture.

```sql
CREATE TABLE player_statistics (
    id integer PRIMARY KEY,
    player_id integer REFERENCES players(player_id),
    fixture_id integer REFERENCES fixtures(id),
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    red_card boolean DEFAULT false,
    clean_sheet boolean DEFAULT false,
    points integer DEFAULT 0,
    author uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);
```

**Scoring System:**
- `points`: Calculated fantasy points based on performance
- `goals`: Number of goals scored in match
- `assists`: Number of assists provided
- `red_card`: Whether player received red card
- `clean_sheet`: Whether player's team kept clean sheet

### 8. `weekly_statistics` - Team Performance Summary

**Purpose**: Aggregated team performance statistics for each game week.

```sql
CREATE TABLE weekly_statistics (
    id integer PRIMARY KEY,
    team integer REFERENCES drafted_teams(drafted_team_id),
    week integer NOT NULL,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    clean_sheets integer DEFAULT 0,
    red_cards integer DEFAULT 0,
    points integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
```

**Aggregation Logic:**
- Calculated from individual player statistics
- Represents total team performance for each week
- Used for league table generation and weekly winners

### 9. `profiles` - User Profiles

**Purpose**: Extended user profile data linked to Supabase authentication.

```sql
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    full_name text,
    username text UNIQUE,
    avatar_url text,
    website text,
    updated_at timestamptz DEFAULT now()
);
```

**Authentication Integration:**
- Links to Supabase `auth.users` table
- Automatically created via trigger on user registration
- Supports role-based access control

## Database Views

### `players_view` - Enhanced Player Data

**Purpose**: Computed view providing enhanced player information with team details and calculated fields.

```sql
CREATE VIEW players_view AS
SELECT 
    p.*,
    t.name as team_name,
    t.short_name as team_short_name,
    -- Computed fields
    CASE 
        WHEN p.code IS NOT NULL 
        THEN 'https://resources.premierleague.com/premierleague/photos/players/40x40/p' || p.code || '.png'
        ELSE null
    END as image,
    CASE 
        WHEN p.code IS NOT NULL 
        THEN 'https://resources.premierleague.com/premierleague/photos/players/250x250/p' || p.code || '.png'
        ELSE null
    END as image_large,
    ROUND((p.now_cost + COALESCE(p.cost_change_start_fall, 0)) / 10.0, 1) as cost,
    CASE p.status
        WHEN 'a' THEN 'available'
        WHEN 'd' THEN 'temporary-unavailable'
        WHEN 'i' THEN 'temporary-unavailable'
        WHEN 's' THEN 'temporary-unavailable'
        WHEN 'u' THEN 'unavailable-for-season'
        ELSE 'available'
    END as status,
    (p.status != 'a') as is_unavailable,
    (p.status = 'u') as unavailable_for_season,
    p.element_type as position
FROM players p
LEFT JOIN teams t ON p.team = t.id;
```

**Computed Fields:**
- `image`: Player photo URL (40x40 pixels)
- `image_large`: Large player photo URL (250x250 pixels)
- `cost`: Display-friendly price calculation
- `status`: Human-readable availability status
- `is_unavailable`: Boolean availability flag
- `unavailable_for_season`: Season-long unavailability flag

## Database Functions

### Data Retrieval Functions

#### `get_drafted_teams_and_players()`
```sql
-- Returns all fantasy teams with their players and transfer history
-- Used for: Team management displays, admin overview
```

#### `get_drafted_teams_by_season(active_season_param text)`
```sql
-- Returns teams filtered by season with admin metadata
-- Enhanced: Now includes created_at, updated_at, edited_count fields
-- Used for: Season-specific team listings, admin team management
```

#### `get_drafted_teams_with_player_points_by_gameweek(game_week_param integer, active_season_param text)`
```sql
-- Returns teams with player points for specific gameweek and season
-- Season-aware: Filters teams by active_season parameter
-- Used for: Weekly performance tracking, league table generation
```

#### `get_player_stats_by_team_id(team_id integer)`
```sql
-- Returns players with cumulative statistics for a specific team
-- Used for: Team performance analysis
```

#### `get_weekly_stats_for_gameweek(target_week integer, active_season_param text)`
```sql
-- Returns team statistics for specific gameweek and season
-- Season-aware: Filters statistics by active_season parameter
-- Used for: Weekly leaderboards, performance comparisons
```

#### `get_weekly_winners()`
```sql
-- Returns weekly winners across all completed weeks
-- Used for: Historical winners display, achievement tracking
```

### Utility Functions

#### `handle_new_user()`
```sql
-- Trigger function: Creates profile on user registration
-- Automatically executes when new user signs up
```

#### `set_author()`
```sql
-- Trigger function: Sets author field for player statistics
-- Tracks who entered each statistic record
```

#### `delete_rows_with_criteria()`
```sql
-- Cleanup function: Removes empty player statistics
-- Maintains data integrity and performance
```

## Database Patterns & Best Practices

### Type System Integration

#### Generated Types
```typescript
// Auto-generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      players: {
        Row: PlayerRow;
        Insert: PlayerInsert;
        Update: PlayerUpdate;
      };
      // ... other tables
    };
  };
};
```

#### Custom Type Overrides
```typescript
// Custom overrides for enhanced functionality
export type PlayersViewRow = Database['public']['Views']['players_view']['Row'] & {
  // Additional computed fields
  image: string | null;
  image_large: string | null;
  cost: number;
  status: 'available' | 'temporary-unavailable' | 'unavailable-for-season';
};
```

### Data Access Patterns

#### Reactive Queries
```typescript
// Supabase real-time subscriptions
const { data: players, error } = await supabase
  .from('players_view')
  .select('*')
  .eq('team', teamId)
  .order('total_points', { ascending: false });
```

#### Season-Parameterized Function Calls
```typescript
// Environment-driven season management
const activeSeasonParam = config.public.ACTIVE_SEASON || '24-25';

// Season-aware database function calls
const { data: weeklyStats } = await supabase.rpc('get_weekly_stats_for_gameweek', {
  target_week: weekNumber,
  active_season_param: activeSeasonParam
});

const { data: teamData } = await supabase.rpc('get_drafted_teams_with_player_points_by_gameweek', {
  game_week_param: gameWeek,
  active_season_param: activeSeasonParam
});

const { data: seasonTeams } = await supabase.rpc('get_drafted_teams_by_season', {
  active_season_param: activeSeasonParam
});
```

#### Bulk Operations
```typescript
// Efficient bulk inserts for statistics
const { error } = await supabase
  .from('player_statistics')
  .insert(statisticsArray);
```

#### Complex Joins
```typescript
// Multi-table queries with relationships
const { data } = await supabase
  .from('drafted_teams')
  .select(`
    *,
    drafted_players:drafted_players(
      drafted_player_id,
      drafted_player:players(*)
    )
  `)
  .eq('active_season', activeSeasonParam);
```

### Security Patterns

#### Row Level Security (RLS)
```sql
-- Example RLS policy
CREATE POLICY "Users can view their own teams" ON drafted_teams
    FOR SELECT USING (auth.uid() = team_owner_id);

CREATE POLICY "Admins can manage fixtures" ON fixtures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

#### Data Validation
```sql
-- Check constraints for data integrity
ALTER TABLE drafted_players 
ADD CONSTRAINT valid_team_size 
CHECK (
    (SELECT COUNT(*) FROM drafted_players 
     WHERE drafted_team = NEW.drafted_team) <= 11
);
```

### Performance Patterns

#### Indexing Strategy
```sql
-- Performance-critical indexes
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_fixtures_game_week ON fixtures(game_week);
CREATE INDEX idx_player_statistics_fixture ON player_statistics(fixture_id);
CREATE INDEX idx_weekly_statistics_team_week ON weekly_statistics(team, week);
```

#### Query Optimisation
```sql
-- Efficient aggregation queries
SELECT 
    team,
    SUM(points) as total_points,
    COUNT(*) as games_played
FROM weekly_statistics 
WHERE week <= 38
GROUP BY team
ORDER BY total_points DESC;
```

## Database Migrations

### Migration Strategy
```sql
-- Example migration pattern
-- 20250619115026_remote_schema.sql
-- 20250619125933_fixture_verification_and_population.sql
-- 20250719190435_parameterize_season_functions.sql
```

#### Migration Principles
- **Incremental Changes**: Each migration builds on previous state
- **Data Preservation**: Migrations preserve existing data
- **Rollback Safe**: Migrations can be safely reverted
- **Testing Required**: All migrations tested before deployment

### Season Parameterization Migration (2025-07-19)

**Migration**: `20250719190435_parameterize_season_functions.sql`

**Objective**: Parameterize database functions to support environment-driven season management, enabling smooth transitions between fantasy football seasons.

**Functions Modified**:

#### `get_drafted_teams_with_player_points_by_gameweek()`
```sql
-- BEFORE: Single parameter
get_drafted_teams_with_player_points_by_gameweek(game_week_param integer)

-- AFTER: Season-aware
get_drafted_teams_with_player_points_by_gameweek(game_week_param integer, active_season_param text)
```

**Change**: Added `active_season_param` parameter to filter teams by season
**Impact**: Enables multi-season data management and clean season transitions

#### `get_weekly_stats_for_gameweek()`
```sql
-- BEFORE: Single parameter  
get_weekly_stats_for_gameweek(target_week integer)

-- AFTER: Season-aware
get_weekly_stats_for_gameweek(target_week integer, active_season_param text)
```

**Change**: Added `active_season_param` parameter for season-specific statistics
**Impact**: Weekly statistics now properly isolated by season

#### `get_drafted_teams_by_season()`
```sql
-- Enhanced with admin metadata
get_drafted_teams_by_season(active_season_param text)
-- Returns: created_at, updated_at, edited_count fields added
```

**Change**: Enhanced to include administrative metadata fields
**Impact**: Improved team management transparency and audit capabilities

**Environment Integration**:
```typescript
// Frontend integration pattern
const activeSeasonParam = config.public.ACTIVE_SEASON || '24-25';

// Function calls now include season parameter
const { data } = await supabase.rpc('get_weekly_stats_for_gameweek', {
  target_week: weekNumber,
  active_season_param: activeSeasonParam
});
```

### Schema Evolution
```sql
-- Adding new columns safely
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS expected_goals_per_90 numeric;

-- Updating constraints
ALTER TABLE drafted_teams 
ADD CONSTRAINT budget_limit 
CHECK (total_team_value <= 90.0);
```

## Business Logic Integration

### Scoring Algorithm Implementation

#### Goal Scoring by Position
```sql
-- Implemented in application layer
CASE 
    WHEN element_type = 1 THEN goals * 10  -- Goalkeeper
    WHEN element_type = 2 THEN goals * 7   -- Defender
    WHEN element_type = 3 THEN goals * 5   -- Midfielder
    WHEN element_type = 4 THEN goals * 3   -- Forward
END as goal_points
```

#### Bonus Point Calculation
```sql
-- Multi-goal bonuses
CASE 
    WHEN goals >= 3 THEN 10  -- Hat-trick bonus
    WHEN goals >= 2 THEN 5   -- Brace bonus
    ELSE 0
END as goal_bonus
```

### Team Validation Rules

#### Formation Requirements
```sql
-- Must be enforced at application level
SELECT 
    COUNT(*) FILTER (WHERE element_type = 1) as goalkeepers,
    COUNT(*) FILTER (WHERE element_type = 2) as defenders,
    COUNT(*) FILTER (WHERE element_type = 3) as midfielders,
    COUNT(*) FILTER (WHERE element_type = 4) as forwards
FROM drafted_players dp
JOIN players p ON dp.drafted_player = p.player_id
WHERE dp.drafted_team = :team_id;
```

#### Budget Validation
```sql
-- Budget constraint checking
SELECT 
    SUM(ROUND((p.now_cost + COALESCE(p.cost_change_start_fall, 0)) / 10.0, 1)) as total_cost
FROM drafted_players dp
JOIN players p ON dp.drafted_player = p.player_id
WHERE dp.drafted_team = :team_id;
```

## Data Integrity & Constraints

### Referential Integrity
- **Foreign Key Constraints**: Enforce relationships between tables
- **Cascade Rules**: Appropriate cascade/restrict rules for deletions
- **Unique Constraints**: Prevent duplicate records where required

### Data Validation
- **Check Constraints**: Validate data ranges and business rules
- **Not Null Constraints**: Ensure required fields are populated
- **Custom Validation**: Application-level validation for complex rules

### Audit Trail
- **Created/Updated Timestamps**: Track record lifecycle
- **User Attribution**: Track who made changes
- **Change History**: Maintain historical records where needed

## Backup & Recovery

### Backup Strategy
- **Automated Backups**: Daily automated backups via Supabase
- **Point-in-Time Recovery**: Ability to restore to specific timestamps
- **Cross-Region Replication**: Data redundancy across regions
- **Export Capabilities**: Full database export functionality

### Disaster Recovery
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes
- **Automated Failover**: Supabase managed failover
- **Data Validation**: Post-recovery data integrity checks

---

*This database documentation provides comprehensive coverage of the League of our own database schema, patterns, and best practices. For implementation details, refer to the type definitions in `/types/` and the Supabase configuration in `/supabase/`.*
