import type { PlayerWithStats } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';

const calculatePlayerPoints = (player: PlayerWithStats) => {
  const POINTS_RED_CARD = -10;
  const POINTS_GOALKEEPER_CLEAN_SHEET = 5;
  const POINTS_DEFENDER_CLEAN_SHEET = 2;
  const POINTS_PER_GOAL: { [key: string]: number } = {
    [PlayerPosition.GOALKEEPER]: 10,
    [PlayerPosition.DEFENDER]: 7,
    [PlayerPosition.MIDFIELDER]: 5,
    [PlayerPosition.FORWARD]: 3,
  };
  const POINTS_TWO_GOALS_BONUS = 5;
  const POINTS_THREE_OR_MORE_GOALS_BONUS = 10;
  const POINTS_PER_ASSIST = 3;

  if (!player || !player.position) {
    throw new Error('Invalid player data');
  }

  let totalPoints = 0;

  // Red Card
  if (player.week_redcard) {
    totalPoints += POINTS_RED_CARD;
  }

  // Clean Sheet
  if (player.week_cleansheet) {
    if (player.position === PlayerPosition.GOALKEEPER) {
      totalPoints += POINTS_GOALKEEPER_CLEAN_SHEET;
    }
    else if (player.position === PlayerPosition.DEFENDER) {
      totalPoints += POINTS_DEFENDER_CLEAN_SHEET;
    }
  }

  // Goals
  const pointsPerGoal = POINTS_PER_GOAL[player.position] || 0;
  totalPoints += player.week_goals * pointsPerGoal;

  // Goal Bonuses
  if (player.week_goals === 2) {
    totalPoints += POINTS_TWO_GOALS_BONUS;
  }
  else if (player.week_goals >= 3) {
    totalPoints += POINTS_THREE_OR_MORE_GOALS_BONUS;
  }

  // Assists
  totalPoints += player.week_assists * POINTS_PER_ASSIST;

  player.week_points = totalPoints;
};

export { calculatePlayerPoints };
