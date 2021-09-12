import teamsData from '@/static/teams.json'
import { GameweekStats } from '../Interfaces/GameweekStats'
import { PlayerDataElements } from '../Interfaces/PlayerDataElements'
import { PlayerPositionShort } from '../Interfaces/PlayerPosition'

const imageUrl =
  'https://resources.premierleague.com/premierleague/photos/players'

// Player class
export class Player {
  public readonly playerType: PlayerPositionShort
  public readonly id: number
  public readonly image: string
  public readonly imageLarge: string
  public readonly isUnavailable: boolean
  public readonly unavailableForSeason?: boolean
  public readonly availabilityType?: string
  public readonly availabilityNews?: string
  public readonly teamID: number
  public readonly teamName: string
  public readonly teamShort: string
  public readonly firstName: string
  public readonly secondName: string
  public readonly name: string
  public readonly price: string
  public readonly gameWeekStats: GameweekStats[]
  public readonly totalPoints: number
  public readonly totalGoals: number
  public readonly totalAssists: number
  public readonly totalRedCards: number
  public readonly totalCleanSheets: number

  // Construct player objects
  constructor(player: PlayerDataElements) {
    this.id = player.id
    this.image = `${imageUrl}/40x40/p${player.code}.png`
    this.imageLarge = `${imageUrl}/250x250/p${player.code}.png`
    this.availabilityType = player.status
    this.teamID = player.team
    this.price = this.getPlayerCost(
      player.now_cost,
      player.cost_change_start_fall
    )
    this.firstName = player.first_name
    this.secondName = player.second_name
    this.name = player.web_name
    this.playerType = player.element_type

    this.gameWeekStats = player.gameweek_stats

    for (const team of teamsData) {
      if (this.teamID === team.id) {
        this.teamName = team.name
        this.teamShort = team.short_name
      }
    }

    this.totalPoints = player.gameweek_stats
      .map((stat) => stat.points)
      .reduce((prev, next) => prev + next)

    this.totalGoals = player.gameweek_stats
      .map((stat) => stat.goalsScored)
      .reduce((prev, next) => prev + next)

    this.totalAssists = player.gameweek_stats
      .map((stat) => +stat.assists)
      .reduce((prev, next) => prev + next)

    this.totalCleanSheets = player.gameweek_stats
      .map((stat) => +stat.cleanSheet)
      .reduce((prev, next) => prev + next)

    this.totalRedCards = player.gameweek_stats
      .map((stat) => +stat.sentOff)
      .reduce((prev, next) => prev + next)

    // Create availability objects
    switch (true) {
      case this.availabilityType === 'i' ||
        this.availabilityType === 'n' ||
        this.availabilityType === 'd':
        this.availabilityType = 'temporary-unavailable'
        this.isUnavailable = true
        this.availabilityNews = player.news
        break
      case this.availabilityType === 'u':
        this.availabilityType = 'unavailable-for-season'
        this.isUnavailable = true
        this.unavailableForSeason = true
        this.availabilityNews = player.news
        break
      default:
        this.isUnavailable = false
        this.availabilityType = 'available'
        this.unavailableForSeason = false
    }
  }

  // Calculate out the cost using the paramaters now and change
  private getPlayerCost(now: number, change: number): string {
    return ((now + change) / 10).toFixed(1)
  }
}
