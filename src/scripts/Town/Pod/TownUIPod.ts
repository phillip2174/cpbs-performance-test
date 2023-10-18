import { BehaviorSubject, Subject } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'

export class TownUIPod {
    public townUIState: BehaviorSubject<TownUIState> = new BehaviorSubject<TownUIState>(TownUIState.MainMenu)
    public layerScrollView: BehaviorSubject<number> = new BehaviorSubject<number>(0)
    public isShowMenuGroup: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public isShowGuideline: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)

    public isFinishChangeUITween: boolean = false

    public changeUIState(state: TownUIState): void {
        if (this.townUIState.value != state) {
            this.townUIState.next(state)
        }
    }

    public setLayerScrollView(layer: number) {
        this.layerScrollView.next(layer)
    }

    public setIsShowGuideline(isShow: boolean): void {
        this.isShowGuideline.next(isShow)
    }

    public setIsShowMenuGroup(isShow: boolean): void {
        this.isShowMenuGroup.next(isShow)
    }

    public setIsFinishChangeUITween(isFinish: boolean): void {
        this.isFinishChangeUITween = isFinish
    }
}
