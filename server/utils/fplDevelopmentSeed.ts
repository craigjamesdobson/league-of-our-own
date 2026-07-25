import { prepareFplTeamsForSync } from './fplTeams';
import {
  prepareFplPlayersForSync,
  type FplPlayer,
  type PlayerForSync,
} from './fplPlayers';

export interface FplSeedBootstrap {
  teams: unknown[];
  elements: FplPlayer[];
}

export interface FplSeedFixture {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
}

interface FixtureSeed {
  id: number;
  game_week: number;
  home_team: number;
  away_team: number;
  home_team_score: null;
  away_team_score: null;
}

interface DraftedTeamSeed {
  drafted_team_id: number;
  team_name: string;
  team_owner: string;
  team_email: string;
  allowed_transfers: boolean;
  active_season: string;
  allow_communication: boolean;
  edited_count: number;
  total_team_value: number;
}

interface DraftedPlayerSeed {
  drafted_player_id: number;
  drafted_team: number;
  drafted_player: number;
}

interface DraftedTransferSeed {
  drafted_transfer_id: number;
  transfer_week: number;
  active_transfer_expiry: null;
  player_id: number;
  drafted_player: number;
}

interface WeeklyStatisticSeed {
  team: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
  week: number;
  points: number;
}

interface SettingSeed {
  setting_key: string;
  setting_value: string;
}

interface FplDevelopmentSeed {
  teams: ReturnType<typeof prepareFplTeamsForSync>;
  players: PlayerForSync[];
  fixtures: FixtureSeed[];
  draftedTeams: DraftedTeamSeed[];
  draftedPlayers: DraftedPlayerSeed[];
  draftedTransfers: DraftedTransferSeed[];
  weeklyStatistics: WeeklyStatisticSeed[];
  settings: SettingSeed[];
}

const FORMATION = [1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4];

export const createFplDevelopmentSeed = (
  bootstrap: FplSeedBootstrap,
  fplFixtures: FplSeedFixture[],
  teamCount: number,
): FplDevelopmentSeed => {
  if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > 12) {
    throw new Error('Dummy team count must be an integer from 1 to 12');
  }

  const teams = prepareFplTeamsForSync({ teams: bootstrap.teams });
  const teamIds = new Set(teams.map(team => team.id));

  if (!Array.isArray(bootstrap.elements)) {
    throw new Error('FPL bootstrap payload does not contain an elements array');
  }

  const players = prepareFplPlayersForSync({ elements: bootstrap.elements });

  if (!Array.isArray(fplFixtures) || fplFixtures.length !== 380) {
    throw new Error('FPL fixtures payload must contain exactly 380 fixtures');
  }

  const fixtureIds = new Set<number>();
  const clubsByEvent = new Map<number, Set<number>>();
  const fixtureCountsByEvent = new Map<number, number>();
  const fixtures: FixtureSeed[] = fplFixtures.map((fixture) => {
    if (
      !Number.isInteger(fixture.id)
      || fixture.id <= 0
      || fixtureIds.has(fixture.id)
    ) {
      throw new Error('FPL fixtures must have unique positive integer ids');
    }
    if (!Number.isInteger(fixture.event) || fixture.event < 1 || fixture.event > 38) {
      throw new Error(`FPL fixture ${fixture.id} has an invalid event`);
    }
    if (!teamIds.has(fixture.team_h) || !teamIds.has(fixture.team_a)) {
      throw new Error(`FPL fixture ${fixture.id} references an unknown club`);
    }

    fixtureIds.add(fixture.id);
    const eventClubs = clubsByEvent.get(fixture.event) ?? new Set<number>();
    eventClubs.add(fixture.team_h);
    eventClubs.add(fixture.team_a);
    clubsByEvent.set(fixture.event, eventClubs);
    fixtureCountsByEvent.set(
      fixture.event,
      (fixtureCountsByEvent.get(fixture.event) ?? 0) + 1,
    );

    return {
      id: fixture.id,
      game_week: fixture.event,
      home_team: fixture.team_h,
      away_team: fixture.team_a,
      home_team_score: null,
      away_team_score: null,
    };
  });

  for (let event = 1; event <= 38; event += 1) {
    if (fixtureCountsByEvent.get(event) !== 10 || clubsByEvent.get(event)?.size !== 20) {
      throw new Error(`FPL event ${event} must contain all 20 clubs exactly once`);
    }
  }

  const availableByPosition = new Map<number, FplPlayer[]>(
    [1, 2, 3, 4].map(position => [
      position,
      bootstrap.elements.filter(player => player.element_type === position),
    ]),
  );

  const draftedTeams: DraftedTeamSeed[] = [];
  const draftedPlayers: DraftedPlayerSeed[] = [];

  for (let teamId = 1; teamId <= teamCount; teamId += 1) {
    const squad = FORMATION.map((position) => {
      const player = availableByPosition.get(position)?.shift();
      if (!player) {
        throw new Error(`Not enough FPL players to create team ${teamId}`);
      }
      return player;
    });

    draftedTeams.push({
      drafted_team_id: teamId,
      team_name: `Development XI ${teamId}`,
      team_owner: `Development Owner ${teamId}`,
      team_email: `owner${teamId}@local.test`,
      allowed_transfers: true,
      active_season: '26-27',
      allow_communication: false,
      edited_count: 0,
      total_team_value: squad.reduce(
        (total, player) => total + (player.now_cost / 10),
        0,
      ),
    });

    squad.forEach((player, slotIndex) => {
      draftedPlayers.push({
        drafted_player_id: ((teamId - 1) * FORMATION.length) + slotIndex + 1,
        drafted_team: teamId,
        drafted_player: player.id,
      });
    });
  }

  const draftedTransfers = draftedTeams.map((team): DraftedTransferSeed => {
    const incomingPlayer = availableByPosition.get(3)?.shift();
    if (!incomingPlayer) {
      throw new Error(`Not enough FPL midfielders to create transfer history`);
    }

    const draftedPlayerId = ((team.drafted_team_id - 1) * FORMATION.length) + 6;
    const originalPlayerId = draftedPlayers.find(
      player => player.drafted_player_id === draftedPlayerId,
    )!.drafted_player;
    const originalPlayer = bootstrap.elements.find(
      player => player.id === originalPlayerId,
    )!;
    team.total_team_value
      = team.total_team_value
        - (originalPlayer.now_cost / 10)
        + (incomingPlayer.now_cost / 10);

    return {
      drafted_transfer_id: team.drafted_team_id,
      transfer_week: 5 + team.drafted_team_id,
      active_transfer_expiry: null,
      player_id: incomingPlayer.id,
      drafted_player: draftedPlayerId,
    };
  });

  const weeklyStatistics = draftedTeams.flatMap(team =>
    Array.from({ length: 38 }, (_, weekIndex): WeeklyStatisticSeed => {
      const week = weekIndex + 1;
      return {
        team: team.drafted_team_id,
        goals: (team.drafted_team_id + week) % 5,
        assists: ((team.drafted_team_id * 2) + week) % 6,
        clean_sheets: (team.drafted_team_id + week) % 3,
        red_cards: (team.drafted_team_id + week) % 17 === 0 ? 1 : 0,
        week,
        points: 45 + ((team.drafted_team_id * 7 + week * 3) % 36),
      };
    }),
  );

  const settings: SettingSeed[] = [
    { setting_key: 'current_gameweek', setting_value: '1' },
    { setting_key: 'season_complete', setting_value: 'false' },
  ];

  return {
    teams,
    players,
    fixtures,
    draftedTeams,
    draftedPlayers,
    draftedTransfers,
    weeklyStatistics,
    settings,
  };
};
