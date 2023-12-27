import { MinigameBonusBean } from './../minigame/MinigameBonusBean'
import { Observable, map, of } from 'rxjs'
import { MinigameResultBean } from '../minigame/MinigameResultBean'
import { ServiceProvider } from '../Service/ServiceProvider'
import { MinigameService, StartGameResultBean } from '../Service/MinigameService'
import { MinigameBean } from '../minigame/MinigameBean'
import { GameConfig } from '../GameConfig'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { MinigameCPGuessDataBean } from '../minigame/minigame-3-cp-guess-this-picture/MinigameCPGuessDataBean'

export class MinigameRepository {
    private minigameService: MinigameService
    private minigameBeans: MinigameBean[] = []

    constructor() {
        this.minigameService = ServiceProvider.instance.minigameService
    }

    getAllMinigame(): Observable<MinigameBean[]> {
        if (GameConfig.IS_MOCK_API) {
            let minigameBeans: MinigameBean[] = [new MinigameBean(1), new MinigameBean(2)]
            this.minigameBeans = minigameBeans
            return of(minigameBeans)
        } else {
            let minigameBeans: MinigameBean[] = []
            return of(minigameBeans)
        }
    }

    getTicket(id: number): Observable<number> {
        return this.minigameService.getTicket(id)
    }

    public startGame(id: number): Observable<StartGameResultBean> {
        return this.minigameService.startGame(id)
    }

    public startGameOffline(id: number): Observable<StartGameResultBean> {
        return this.minigameService.startGameOffline(id)
    }

    public sendResult(id: number, score: number): Observable<MinigameResultBean> {
        return this.minigameService.sendResult(id, score)
    }

    public getMinigameCPGuessData(): Observable<MinigameCPGuessDataBean> {
        if (GameConfig.IS_MOCK_API) {
            return ResourceManager.instance
                .loadText('minigame-3-databean', 'assets/minigame/minigame3/minigame-3-databean.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            return this.minigameService.getMinigameCPGuessData()
        }
    }
}
