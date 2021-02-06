import { PlayerPositionShort } from '../Interfaces/PlayerPosition'
import { Player } from './Player'

export class PlayerList {
  public players: Player[]
  public filteredPlayers: Player[]

  constructor(players: Player[]) {
    this.players = players
    this.filteredPlayers = players
  }

  public getFilteredPlayers(
    filterName?: string,
    filterPrice?: string,
    filterTeam?: number
  ) {
    const FilterName = filterName || ''
    const FilterPrice = filterPrice || ''
    const FilterTeam = filterTeam || null

    let filteredPlayers = this.players.filter((p) =>
      p.name
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '')
        .toLowerCase()
        .includes(FilterName)
    )

    filteredPlayers = filteredPlayers.filter((p) =>
      p.price.includes(FilterPrice)
    )

    if (FilterTeam !== null) {
      filteredPlayers = filteredPlayers.filter((p) => p.teamID === FilterTeam)
    }

    return (this.filteredPlayers = filteredPlayers)
  }

  public getFilteredPlayersOfType(
    position: PlayerPositionShort,
    filterName?: string,
    filterPrice?: string,
    filterTeam?: number
  ): [Player[], Player[]] {
    const players = this.getPlayersOfType(position).filter(
      (p) =>
        p.name
          .normalize('NFD')
          .replace(/[\u0300-\u036F]/g, '')
          .toLowerCase()
          .includes(filterName!) && p.playerType === position
    )

    let filteredPlayers = players.filter(
      (p) => p.price.includes(filterPrice!) && p.playerType === position
    )

    if (filterTeam !== null) {
      filteredPlayers = filteredPlayers.filter((p) => p.teamID === filterTeam)
    }

    // TODO: Sort by price etc (WIP);
    // filteredPlayers.sort((a, b) => {
    //   return parseFloat(b.price) - parseFloat(a.price);
    // });

    const divisor = Math.ceil(filteredPlayers.length / 2)

    return [filteredPlayers.slice(0, divisor), filteredPlayers.slice(divisor)]
  }

  public getPlayersOfType(position: PlayerPositionShort): Player[] {
    return this.players.filter((p) => p.playerType === position)
  }

  public getSplitPlayersOfType(
    position: PlayerPositionShort
  ): [Player[], Player[]] {
    const players = this.getPlayersOfType(position)
    const divisor = Math.floor(players.length / 2)

    return [players.slice(0, divisor), players.slice(divisor)]
  }
}
