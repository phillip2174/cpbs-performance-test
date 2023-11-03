import { MinigameResultBean } from './MinigameResultBean';
import { StartGameResultBean } from './../Service/MinigameService';
import { Scene } from 'phaser';
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { MinigameState } from './MinigameState'
import { MinigameService } from '../Service/MinigameService'
import { ServiceProvider } from '../Service/ServiceProvider';

export class MinigameScenePod {
    sceneState: BehaviorSubject<MinigameState> = new BehaviorSubject(MinigameState.StartMenu)
    score: number
    textScore: string;
    service: MinigameService
    balance: any;
    id : number

    constructor() {
        this.service = ServiceProvider.instance.minigameService;
    }

    startGame(): Observable<StartGameResultBean> {
        return this.service.startGame(this.id).pipe(tap(startGameResultBean => this.balance = startGameResultBean.balance));
    }

    resultMinigame(): Observable<MinigameResultBean> {
        return this.service.sendResult(this.id,this.score);
    }
}
