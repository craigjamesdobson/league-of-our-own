import { DraftedTransferData } from '@/components/Interfaces/DraftedTransferData'
import { CompleteDraftedPlayer } from './CompleteDraftedPlayer'

export class DraftedTransfer {
  public readonly transferId: number
  public readonly transferWeek: number
  private readonly currentTransferDateExpiry: string
  public readonly isCurrentWeekTransfer: boolean
  public readonly player: CompleteDraftedPlayer

  constructor(draftedTransfer: DraftedTransferData) {
    this.transferId = draftedTransfer.transfer_id
    this.transferWeek = draftedTransfer.transfer_week
    this.currentTransferDateExpiry = draftedTransfer.currentTransferDateExpiry

    if (new Date(this.currentTransferDateExpiry) > new Date()) {
      this.isCurrentWeekTransfer = true
    } else {
      this.isCurrentWeekTransfer = false
    }
  }
}
