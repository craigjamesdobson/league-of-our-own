import { PlayerDataElements } from '@/components/Interfaces/PlayerDataElements'
import { Player } from './Player'
import { PlayerList } from './PlayerList'

export function generatePlayerData(playerData: PlayerDataElements[]) {
  const players = playerData.map(
    (player: PlayerDataElements) => new Player(player)
  )
  const playerList = new PlayerList(players)

  return playerList
}

export function initPlayerData(
  playerData: any,
  filterName?: string,
  filterPrice?: string,
  filterTeam?: number | null
) {
  const players = generatePlayerData(playerData)

  const filteredPlayers = players.getFilteredPlayers(
    filterName,
    filterPrice,
    filterTeam!
  )

  // prettier-ignore

  return {
      filteredPlayers,
      players,
    }
}
