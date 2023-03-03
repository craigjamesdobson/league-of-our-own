import DraftedTeamData from '~/../v2/components/DraftedTeams/Interfaces/DraftedTeamData'
import DraftedTeam from './DraftedTeam'
import CompleteDraftedTeam from './CompleteDraftedTeam'

// TODO: fix playerList so that its not using player.player
// and can use the contructer commented out above
function initDraftedTeamData(
  playerList: any,
  draftedTeamData: DraftedTeamData
) {
  const draftedTeamList = getDraftedTeamData(draftedTeamData)

  const draftedTeams = draftedTeamList.map((draftedTeam) => {
    const players = draftedTeam.teamPlayers.map((player) => ({
      player: playerList.filter(
        (p) => p.id === player.playerID
      )[0],
      transfers: player.transfers.map((t) => {
        return {
          player: playerList.filter(
            (p) => p.id === t.transferId
          )[0],
          isCurrentWeekTransfer: t.isCurrentWeekTransfer,
          transferWeek: t.transferWeek,
        }
      }),
    }))
    return new CompleteDraftedTeam(draftedTeam, players)
  })

  return draftedTeams.sort((a, b) => (a.teamName > b.teamName ? 1 : -1))
}

function getDraftedTeamData(draftedTeamData: DraftedTeamData) {
  return draftedTeamData.draftedTeams.map(
    (draftedTeam) => new DraftedTeam(draftedTeam)
  )
}

export default initDraftedTeamData
