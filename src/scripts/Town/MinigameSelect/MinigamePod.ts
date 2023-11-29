import { Scene } from 'phaser'
import { MinigameBean } from '../../minigame/MinigameBean'
import { Pod } from '../../plugins/objects/Pod'
import { Observable, map } from 'rxjs'
import { MinigameRepository } from '../../Repository/MinigameRepository'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'

export class MinigamePod extends Pod {
    public isFirstOpen: boolean = false
    public isDragScrollView: boolean = false

    private minigameBeans: MinigameBean[] = []
    private minigameRepo: MinigameRepository
    constructor(scene: Scene) {
        super(scene)

        this.minigameRepo = RepositoryProvider.instance.minigameRepository
    }

    public getAllMiniGame(): Observable<MinigameBean[]> {
        return this.minigameRepo.getAllMinigame().pipe(
            map((allMinigame) => {
                this.minigameBeans = allMinigame

                console.log(this.minigameBeans)
                return this.minigameBeans
            })
        )
    }
}
