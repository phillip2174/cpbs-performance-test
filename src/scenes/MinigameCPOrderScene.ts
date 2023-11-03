import { Scene } from 'phaser'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { MinigameCPOrderGameplayUIView } from './../scripts/minigame/minigame-2-cp-order/MinigameCPOrderGameplayUIView'
import { MinigameScenePod } from '../scripts/minigame/MinigameScenePod'
import { MinigameMenuUIView } from './../scripts/minigame/minigame-1-cp-puzzle/MinigameMenuUIView'
import { PodProvider } from '../scripts/pod/PodProvider'

export class MinigameCPOrderScene extends Scene {
    private minigameMenuUIView: MinigameMenuUIView
    private minigameCPOrderGameplayUIView: MinigameCPOrderGameplayUIView
    private minigameScenePod: MinigameScenePod

    constructor() {
        super({ key: 'MinigameCPOrder' })
    }

    public preload(): void {
        console.log('Start MinigameCPOrder')
        ResourceManager.instance.setResourceLoaderScene(this)
    }

    public create(): void {
        this.minigameScenePod = PodProvider.instance.minigameScenePod
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameCPOrderGameplayUIView = new MinigameCPOrderGameplayUIView(this).setDepth(1)

        this.minigameMenuUIView.doInit(2)
        this.minigameCPOrderGameplayUIView.doInit()
    }
}
