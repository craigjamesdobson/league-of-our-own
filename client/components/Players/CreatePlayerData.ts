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

export function initPlayerData(playerData: any) {
  const players = generatePlayerData(playerData)
  const filteredPlayers = generatePlayerData(playerData)

  players.players.sort((a, b) => a.teamID - b.teamID)
  filteredPlayers.players.sort((a, b) => a.teamID - b.teamID)

  return {
    players,
    filteredPlayers,
  }
}

export function getFilteredPlayers(
  playerData: Player[],
  filterName?: string,
  filterPrice?: string,
  filterTeam?: number
) {
  const FilterName = filterName || ''
  const FilterPrice = filterPrice || ''
  const FilterTeam = filterTeam || null

  let filteredPlayers = playerData.filter((p) =>
    p.name
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '')
      .toLowerCase()
      .includes(FilterName)
  )

  filteredPlayers = filteredPlayers.filter((p) => p.price.includes(FilterPrice))

  if (FilterTeam !== null) {
    filteredPlayers = filteredPlayers.filter((p) => p.teamID === FilterTeam)
  }

  return filteredPlayers
}
