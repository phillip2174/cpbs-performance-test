import { MinigameBonusBean } from './../minigame/MinigameBonusBean'
import { Observable, of } from 'rxjs'
import { MinigameResultBean } from '../minigame/MinigameResultBean'

export class MinigameService {
    private mockTicket = 1

    getTicket(id: number): Observable<number> {
        return of(this.mockTicket)
    }

    public startGame(id: number): Observable<StartGameResultBean> {
        var path: string[] = [
            'assets/minigame/minigame1/minigame1.png',
            'assets/minigame/minigame1/minigame2.png',
            'assets/minigame/minigame1/minigame3.png',
        ]
        var randomIndex = this.getRandomInt(path.length)
        this.mockTicket = this.mockTicket - 1
        return of(new StartGameResultBean(this.mockTicket, { image: path[randomIndex] }))
    }

    public startGameOffline(id: number): Observable<StartGameResultBean> {
        var path: string[] = [
            'assets/minigame/minigame1/minigame1.png',
            'assets/minigame/minigame1/minigame2.png',
            'assets/minigame/minigame1/minigame3.png',
        ]
        var randomIndex = this.getRandomInt(path.length)

        return of(new StartGameResultBean(0, { image: path[randomIndex] }))
    }

    private getRandomInt(max: number) {
        return Math.floor(Math.random() * max)
    }

    public sendResult(id: number, score: number): Observable<MinigameResultBean> {
        var result = 0
        switch (id) {
            case 1:
                if (score > 30000) {
                    result = 3
                } else if (score > 15000) {
                    result = 2
                } else if (score > 100) {
                    result = 1
                }
                break
            case 2:
                result = score
                break
        }

        var minigameResultBean = new MinigameResultBean(result, [
            new MinigameBonusBean(true, 0, 10),
            new MinigameBonusBean(false, 2, 1),
            new MinigameBonusBean(false, 4, 100),
        ])
        return of(minigameResultBean)
    }
}

export class StartGameResultBean {
    ticketLeft: number
    balance: any

    constructor(ticketList: number, balance: object) {
        this.ticketLeft = ticketList
        this.balance = balance
    }
}
