import { MinigameResultBean } from './MinigameResultBean';
import { StartGameResultBean } from './../Service/MinigameService';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs'
import { MinigameState } from './MinigameState'
import { MinigameRepository } from '../Repository/MinigameRepository';
import { RepositoryProvider } from '../Repository/RepositoryProvider';

export class MinigameScenePod {

    private minigameRepository: MinigameRepository
    id: number
    isPlayOnline: boolean = true
    score: number
    textScore: string = '0000'
    balance: any
    ticket: BehaviorSubject<number>  = new BehaviorSubject(1)
    sceneState: BehaviorSubject<MinigameState> = new BehaviorSubject(MinigameState.StartMenu)
    settingState: BehaviorSubject<boolean> = new BehaviorSubject(false)

    constructor() {
        this.minigameRepository = RepositoryProvider.instance.minigameRepository;
    }

    setGameId(id: number) {
        this.id = id
    }

    setSceneState(state: MinigameState) {
        this.sceneState.next(state)
    }

    public setTicket(ticket : number)
    {
        this.ticket.next(ticket)
    }

    public setTextScore(score: string): void {
        this.textScore = score
    }

    getTicket(isFetch: boolean = true): Observable<number> {
        if (isFetch) {
            return this.minigameRepository.getTicket(this.id).pipe(tap(
                ticket => {
                    this.ticket.next(ticket);
                    this.isPlayOnline = this.ticket.value != 0
                })
            )
        } else {
            this.isPlayOnline = this.ticket.value != 0
            return of(this.ticket.value)
        }
    }

    public getTextScore(): string {
        return this.textScore
    }

    startGame(): Observable<StartGameResultBean> {
        if (this.ticket.value > 0) {
            return this.minigameRepository.startGame(this.id).pipe(map(
                startGameResultBean => {
                    this.balance = startGameResultBean.balance
                    this.ticket.next(startGameResultBean.ticketLeft)
                    return startGameResultBean
                })
            )
        } else {
            return this.minigameRepository.startGameOffline(this.id).pipe(map(
                startGameResultBean => {
                    this.balance = startGameResultBean.balance
                    this.ticket.next(startGameResultBean.ticketLeft)
                    return startGameResultBean
                })
            )
        }
    }

    resultMinigame(): Observable<MinigameResultBean> {
        return this.minigameRepository.sendResult(this.id, this.score);
    }
}
