import { BehaviorSubject } from 'rxjs'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { CountdownTimerPod } from './CountdownTimerPod'
import { PodProvider } from './PodProvider'

export class TownDayNightPod {
    public townTimeState: BehaviorSubject<TownTimeState> = new BehaviorSubject<TownTimeState>(TownTimeState.Day)
    private countDownTimerPod: CountdownTimerPod

    constructor() {
        this.countDownTimerPod = PodProvider.instance.countdownTimerPod
    }

    public doInit(): void {
        this.countDownTimerPod.getCurrentTownTimeStateByServer().subscribe((state) => {
            if (state != this.townTimeState.value) {
                this.setTownTimeState(state)
            }
        })
    }

    public setTownTimeState(state: TownTimeState): void {
        this.townTimeState.next(state)
    }
}
