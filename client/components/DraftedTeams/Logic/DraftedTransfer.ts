import { DraftedTransferData } from '@/components/Interfaces/DraftedTransferData'

export class DraftedTransfer {
  public readonly transferId: number
  public readonly transferWeek: number
  private readonly currentTransferDateExpiry: string
  public readonly isCurrentWeekTransfer: boolean

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
