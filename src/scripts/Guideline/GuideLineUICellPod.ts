import { BehaviorSubject } from 'rxjs'
import { Pod } from '../plugins/objects/Pod'
import { GuideLineUICellState } from './GuideLineUICellState'

export class GuideLineUICellPod extends Pod {
    public guideLineUICellState: BehaviorSubject<GuideLineUICellState> = new BehaviorSubject<GuideLineUICellState>(
        GuideLineUICellState.IdleNotFound
    )

    public changeState(state: GuideLineUICellState) {
        this.guideLineUICellState.next(state)
    }
}
