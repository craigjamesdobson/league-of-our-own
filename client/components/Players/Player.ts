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
  public readonly goalsScored: number
  public readonly assists: number
  public readonly cleanSheets: number

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

    this.goalsScored = player.goals_scored
    this.assists = player.assists
    this.cleanSheets = player.clean_sheets

    // Create team name and team abbrevation objects depending on team ID
    switch (this.teamID) {
      case 1:
        this.teamName = 'Arsenal'
        this.teamShort = 'ARS'
        break
      case 2:
        this.teamName = 'Aston Villa'
        this.teamShort = 'AVL'
        break
      case 3:
        this.teamName = 'Brighton and Hove Albion'
        this.teamShort = 'BHA'
        break
      case 4:
        this.teamName = 'Burnley'
        this.teamShort = 'BUR'
        break
      case 5:
        this.teamName = 'Chelsea'
        this.teamShort = 'CHE'
        break
      case 6:
        this.teamName = 'Crystal Palace'
        this.teamShort = 'CRY'
        break
      case 7:
        this.teamName = 'Everton'
        this.teamShort = 'EVE'
        break
      case 8:
        this.teamName = 'Fulham'
        this.teamShort = 'FUL'
        break
      case 9:
        this.teamName = 'Leicester'
        this.teamShort = 'LEI'
        break
      case 10:
        this.teamName = 'Leeds'
        this.teamShort = 'LEE'
        break
      case 11:
        this.teamName = 'Liverpool'
        this.teamShort = 'LIV'
        break
      case 12:
        this.teamName = 'Manchester City'
        this.teamShort = 'MCI'
        break
      case 13:
        this.teamName = 'Manchester United'
        this.teamShort = 'MUN'
        break
      case 14:
        this.teamName = 'Newcastle'
        this.teamShort = 'NEW'
        break
      case 15:
        this.teamName = 'Sheffield United'
        this.teamShort = 'SHU'
        break
      case 16:
        this.teamName = 'Southampton'
        this.teamShort = 'SOU'
        break
      case 17:
        this.teamName = 'Tottenham Hotspur'
        this.teamShort = 'TOT'
        break
      case 18:
        this.teamName = 'West Brom'
        this.teamShort = 'WBA'
        break
      case 19:
        this.teamName = 'West Ham'
        this.teamShort = 'WHU'
        break
      case 20:
        this.teamName = 'Wolves'
        this.teamShort = 'WOL'
        break
      default:
        this.teamName = 'N/A'
        this.teamShort = 'N/A'
    }

    // Create availability objects
    switch (true) {
      case this.availabilityType === 'i':
        this.availabilityType = 'temporary-unavailable'
        this.isUnavailable = true
        this.availabilityNews = player.news
        break
      case this.availabilityType === 'u' || this.availabilityType === 'n':
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
