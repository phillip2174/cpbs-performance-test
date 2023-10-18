import { DailyLoginCollectState } from './DailyLoginCollectState'
import { RewardBean } from './RewardBean'

export class DailyLoginBean {
    public id: number
    public rewardBeans: RewardBean[]
    public collectState: DailyLoginCollectState
    public isBigReward: boolean

    constructor(
        id: number,
        rewardBeans: RewardBean[] = [],
        collectState: DailyLoginCollectState = DailyLoginCollectState.Uncollected,
        isBigReward: boolean = false
    ) {
        this.id = id
        this.rewardBeans = rewardBeans
        this.collectState = collectState
        this.isBigReward = isBigReward
    }
}
