import { Player } from '~~/modules/players/types/Player';
import { IMAGE_CDN } from './constants';
import { TEAM_DATA } from '../teams/constants';

const createPlayerData = (playerData: Player[]): Player[] => {
  return playerData.map((player) => {
    return {
      id: player.id,
      code: player.code,
      team: player.team,
      webName: player.web_name,
      firstName: player.first_name,
      secondName: player.second_name,
      price: getPlayerCost(player.now_cost, player.cost_change_start_fall),
      status: player.status,
      news: player.news,
      position: player.element_type,
      image: `${IMAGE_CDN}/40x40/p${player.code}.png`,
      imageLarge: `${IMAGE_CDN}/250x250/p${player.code}.png`,
      ...getTeamData(player),
      ...getAvailabilityData(player),
    };
  });
};

const getPlayerCost = (now: number, change: number): string => {
  return ((now + change) / 10).toFixed(1);
};

const getTeamData = (player: Player) => {
  const playerTeam = TEAM_DATA.filter((x) => x.id === player.team)[0];
  return {
    teamName: playerTeam.name,
    teamNameShort: playerTeam.short_name,
  };
};

const getAvailabilityData = (player: Player) => {
  switch (true) {
    case player.status === 'i' ||
      player.status === 'n' ||
      player.status === 'd':
      return {
        status: 'temporary-unavailable',
        isUnavailable: true,
      };
    case player.status === 'u':
      return {
        status: 'unavailable-for-season',
        isUnavailable: true,
        unavailableForSeason: true,
      };
    default:
      return {
        status: 'available',
        isUnavailable: false,
        unavailableForSeason: false,
      };
  }
};

export { createPlayerData };
