import { BehaviorSubject, Observable, Subject, map, of } from 'rxjs'
import { MinigameRepository } from '../../Repository/MinigameRepository'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { MinigameCPWhatDataBean } from './MinigameCPWhatDataBean'
import { MinigameCPWhatChoiceBean } from './MinigameCPWhatChoiceBean'

export class MinigameCPWhatPod {
    public static CLICKABLE_TIMES: number = 3

    public dataBean: MinigameCPWhatDataBean
    public choiceBeans: MinigameCPWhatChoiceBean[] = []
    public answerChoice: MinigameCPWhatChoiceBean

    public remainingClickTimes: BehaviorSubject<number> = new BehaviorSubject<number>(3)
    public gameResultIsWin: Subject<boolean> = new Subject<boolean>()

    private minigameRepository: MinigameRepository

    constructor() {
        this.minigameRepository = RepositoryProvider.instance.minigameRepository
    }

    public resetPod() {
        this.remainingClickTimes.next(MinigameCPWhatPod.CLICKABLE_TIMES)
    }

    public reduceClickTime() {
        this.remainingClickTimes.next(this.remainingClickTimes.value - 1)
    }

    public setGameResultIsWin(value: boolean) {
        this.gameResultIsWin.next(value)
    }

    public getMinigameGuessData(): Observable<MinigameCPWhatDataBean> {
        this.choiceBeans = []
        return this.minigameRepository.getMinigameCPWhatData().pipe(
            map((bean) => {
                this.dataBean = bean
                console.log(this.dataBean)

                for (let index = 0; index < this.dataBean.choiceImageUrl.length; index++) {
                    const choiceBean = new MinigameCPWhatChoiceBean(
                        this.dataBean.choiceImageUrl[index],
                        index == this.dataBean.answerIndex
                    )
                    if (choiceBean.isAnswer) {
                        this.answerChoice = choiceBean
                    }
                    this.choiceBeans.push(choiceBean)
                }

                return this.dataBean
            })
        )
    }
}
