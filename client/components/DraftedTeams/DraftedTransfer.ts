import { DraftedTransferData } from '../Interfaces/DraftedTransferData'

export class DraftedTransfer {
  public readonly transferId: number
  public readonly transferWeek: number
  public readonly currentTransferDateExpiry: string

  constructor(draftedTransfer: DraftedTransferData) {
    this.transferId = draftedTransfer.transfer_id
    this.transferWeek = draftedTransfer.transfer_week
    this.currentTransferDateExpiry = draftedTransfer.currentTransferDateExpiry
  }
}
