import { prepareFplTeamsForSync } from './fplTeams';
import {
  prepareFplPlayersForSync,
  type FplPlayer,
  type PlayerForSync,
} from './fplPlayers';
import {
  prepareFplFixturesForSync,
  type FplFixture,
  type FixtureForSync,
} from './fplFixtures';
import { CURATED_DEVELOPMENT_TEAMS } from './fplDevelopmentTeams';

export interface FplSeedBootstrap {
  teams: unknown[];
  elements: FplPlayer[];
}

export type FplSeedFixture = FplFixture;

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
  fixtures: FixtureForSync[];
  draftedTeams: DraftedTeamSeed[];
  draftedPlayers: DraftedPlayerSeed[];
  draftedTransfers: DraftedTransferSeed[];
  weeklyStatistics: WeeklyStatisticSeed[];
  settings: SettingSeed[];
}

const FORMATION = [1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4];
const MAX_PLAYERS_PER_CLUB = 3;

export const createFplDevelopmentSeed = (
  bootstrap: FplSeedBootstrap,
  fplFixtures: FplSeedFixture[],
  teamCount: number,
): FplDevelopmentSeed => {
  if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > 12) {
    throw new Error('Dummy team count must be an integer from 1 to 12');
  }

  const teams = prepareFplTeamsForSync({ teams: bootstrap.teams });
  if (!Array.isArray(bootstrap.elements)) {
    throw new Error('FPL bootstrap payload does not contain an elements array');
  }

  const players = prepareFplPlayersForSync({ elements: bootstrap.elements });

  const fixtures = prepareFplFixturesForSync(
    fplFixtures,
    teams.map(team => team.id),
  );

  const playersByCode = new Map(
    bootstrap.elements.map(player => [player.code, player]),
  );
  const availableByPosition = new Map<number, FplPlayer[]>(
    [1, 2, 3, 4].map(position => [
      position,
      bootstrap.elements
        .filter(player => player.element_type === position && player.status !== 'u')
        .toSorted((left, right) => {
          const leftValue = (left.total_points + (left.minutes / 90)) / left.now_cost;
          const rightValue = (right.total_points + (right.minutes / 90)) / right.now_cost;
          return rightValue - leftValue
            || right.total_points - left.total_points
            || right.minutes - left.minutes
            || left.code - right.code;
        }),
    ]),
  );
  const curatedTransferCount = CURATED_DEVELOPMENT_TEAMS
    .slice(0, teamCount)
    .filter(team => team.transfer)
    .length;
  const targetTransferCount = Math.floor(teamCount / 2);
  let generatedTransferCount = Math.max(0, targetTransferCount - curatedTransferCount);

  const draftedTeams: DraftedTeamSeed[] = [];
  const draftedPlayers: DraftedPlayerSeed[] = [];

  for (let teamId = 1; teamId <= teamCount; teamId += 1) {
    const curatedTeam = CURATED_DEVELOPMENT_TEAMS[teamId - 1];
    const generatedTransferEnabled = !curatedTeam && generatedTransferCount > 0;
    if (generatedTransferEnabled) {
      generatedTransferCount -= 1;
    }
    const squad = curatedTeam
      ? curatedTeam.playerCodes.map((code) => {
          const player = playersByCode.get(code);
          if (!player) {
            throw new Error(
              `${curatedTeam.name} requires FPL player code ${code}, which is missing`,
            );
          }
          return player;
        })
      : (() => {
          const selectedPlayerIds = new Set<number>();
          const generatedClubCounts = new Map<number, number>();
          return FORMATION.map((position, slotIndex) => {
            const candidates = availableByPosition.get(position) ?? [];
            const startIndex = (teamId * FORMATION.length + slotIndex) % candidates.length;
            const player = candidates
              .map((_, candidateIndex) => candidates[(startIndex + candidateIndex) % candidates.length])
              .find(candidate => candidate !== undefined
                && !selectedPlayerIds.has(candidate.id)
                && (generatedClubCounts.get(candidate.team) ?? 0) < MAX_PLAYERS_PER_CLUB);
            if (!player) {
              throw new Error(`Not enough FPL players to create team ${teamId}`);
            }
            selectedPlayerIds.add(player.id);
            generatedClubCounts.set(player.team, (generatedClubCounts.get(player.team) ?? 0) + 1);
            return player;
          });
        })();
    const formation = squad.map(player => player.element_type).toSorted();
    const clubCounts = new Map<number, number>();
    squad.forEach((player) => {
      clubCounts.set(player.team, (clubCounts.get(player.team) ?? 0) + 1);
    });

    if (formation.join(',') !== FORMATION.toSorted().join(',')) {
      throw new Error(`${curatedTeam?.name ?? `Development XI ${teamId}`} has an invalid formation`);
    }
    const teamLabel = curatedTeam?.name ?? 'Development XI ' + teamId;
    if (squad.some(player => player.status === 'u')) {
      throw new Error(`${teamLabel} contains an unavailable FPL player`);
    }
    if (Math.max(...clubCounts.values()) > MAX_PLAYERS_PER_CLUB) {
      throw new Error(`${teamLabel} contains too many players from one club`);
    }

    const allowedTransfers = curatedTeam?.allowedTransfers ?? generatedTransferEnabled;
    const totalTeamValue = squad.reduce(
      (total, player) => total + (player.now_cost / 10),
      0,
    );
    const teamBudget = allowedTransfers ? 85 : 90;
    if (totalTeamValue > teamBudget) {
      throw new Error(
        `${curatedTeam?.name ?? `Development XI ${teamId}`} costs £${totalTeamValue.toFixed(1)}`
        + ` but its budget is £${teamBudget.toFixed(1)}`,
      );
    }

    draftedTeams.push({
      drafted_team_id: teamId,
      team_name: curatedTeam?.name ?? `Development XI ${teamId}`,
      team_owner: `Development Owner ${teamId}`,
      team_email: `owner${teamId}@local.test`,
      allowed_transfers: allowedTransfers,
      active_season: '26-27',
      allow_communication: false,
      edited_count: 0,
      total_team_value: totalTeamValue,
    });

    squad.forEach((player, slotIndex) => {
      draftedPlayers.push({
        drafted_player_id: ((teamId - 1) * FORMATION.length) + slotIndex + 1,
        drafted_team: teamId,
        drafted_player: player.id,
      });
    });
  }

  const curatedTransfers = draftedTeams.flatMap((team): DraftedTransferSeed[] => {
    const transfer = CURATED_DEVELOPMENT_TEAMS[team.drafted_team_id - 1]?.transfer;
    if (!transfer) {
      return [];
    }

    const incomingPlayer = playersByCode.get(transfer.incomingPlayerCode);
    const originalPlayer = playersByCode.get(transfer.outgoingPlayerCode);
    const draftedPlayer = draftedPlayers.find(player =>
      player.drafted_team === team.drafted_team_id
      && player.drafted_player === originalPlayer?.id);
    if (!incomingPlayer || !originalPlayer || !draftedPlayer) {
      throw new Error(`Invalid transfer configuration for ${team.team_name}`);
    }
    if (incomingPlayer.element_type !== originalPlayer.element_type) {
      throw new Error(`Transfer for ${team.team_name} changes player position`);
    }

    team.total_team_value
      = team.total_team_value
        - (originalPlayer.now_cost / 10)
        + (incomingPlayer.now_cost / 10);
    if (team.total_team_value > 85) {
      throw new Error(`Transfer puts ${team.team_name} over its £85.0 budget`);
    }

    return [{
      drafted_transfer_id: team.drafted_team_id,
      transfer_week: transfer.week,
      player_id: incomingPlayer.id,
      drafted_player: draftedPlayer.drafted_player_id,
    }];
  });

  const playersById = new Map(bootstrap.elements.map(player => [player.id, player]));
  const generatedTransfers = draftedTeams.flatMap((team): DraftedTransferSeed[] => {
    if (!team.allowed_transfers || CURATED_DEVELOPMENT_TEAMS[team.drafted_team_id - 1]?.transfer) {
      return [];
    }

    const squad = draftedPlayers
      .filter(player => player.drafted_team === team.drafted_team_id)
      .map(player => ({ draftedPlayer: player, player: playersById.get(player.drafted_player) }))
      .filter((entry): entry is { draftedPlayer: DraftedPlayerSeed; player: FplPlayer } => Boolean(entry.player));
    const outgoing = squad.find(entry => entry.player.element_type === 3);
    if (!outgoing) {
      throw new Error(`Could not create a transfer for ${team.team_name}`);
    }

    const squadPlayerIds = new Set(squad.map(entry => entry.player.id));
    const incoming = availableByPosition.get(outgoing.player.element_type)?.find(player =>
      !squadPlayerIds.has(player.id)
      && player.now_cost <= outgoing.player.now_cost,
    );
    if (!incoming) {
      throw new Error(`Could not find a valid transfer for ${team.team_name}`);
    }

    team.total_team_value = team.total_team_value
      - (outgoing.player.now_cost / 10)
      + (incoming.now_cost / 10);

    return [{
      drafted_transfer_id: team.drafted_team_id,
      transfer_week: Math.min(38, team.drafted_team_id + 4),
      player_id: incoming.id,
      drafted_player: outgoing.draftedPlayer.drafted_player_id,
    }];
  });

  const draftedTransfers = [...curatedTransfers, ...generatedTransfers];
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
    { setting_key: 'active_season', setting_value: '26-27' },
    { setting_key: 'current_gameweek', setting_value: '1' },
    { setting_key: 'season_complete', setting_value: 'false' },
    { setting_key: 'site_open', setting_value: 'true' },
    { setting_key: 'league_data_public', setting_value: 'false' },
    { setting_key: 'team_registration_open', setting_value: 'true' },
    { setting_key: 'team_submission_deadline', setting_value: '2026-08-20' },
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
