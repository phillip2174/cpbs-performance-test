import { RewardType } from './RewardType'

export class RewardBean {
    public type: RewardType
    public amount: number
    public ingredientId: number

    constructor(rewardType: RewardType, amount: number, ingredientId?: number) {
        this.type = rewardType
        this.amount = amount
        this.ingredientId = ingredientId
    }
}
