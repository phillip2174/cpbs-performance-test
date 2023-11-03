import { MinigameCPPuzzleImageCellView } from './../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleImageCellView'
import { MinigameStartMenuUIView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameStartMenuUIView'
import { MinigameScenePod } from './../scripts/minigame/MinigameScenePod'
import { delay, timer, Subscription, timeInterval, interval, take, map, merge, mergeMap } from 'rxjs'
import { Scene } from 'phaser'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameResultUIView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameResultUIView'
import { MinigameCPPuzzleGameplayUIView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleGameplayUIView'
import { MinigameMenuUIView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameMenuUIView'
import { SettingUIPanelView } from '../scripts/Town/Settings/SettingUIPanelView'
import { PodProvider } from '../scripts/pod/PodProvider'

export class MinigameCPPuzzleScene extends Scene {
    minigameScenePod: MinigameScenePod
    minigameMenuUIView: MinigameMenuUIView
    minigameStartMenuUIView: MinigameStartMenuUIView
    minigameCPuzzleGameplayUIView: MinigameCPPuzzleGameplayUIView
    minigameCPPuzzlePreviewImage: MinigameCPPuzzleImageGroupView
    minigameResultUIView: MinigameResultUIView
    private settingUIPanelView: SettingUIPanelView

    constructor() {
        super({
            key: 'MinigameCPPuzzle',
        })
    }

    preload(): void {
        console.log('start MinigameCPPuzzle')
        ResourceManager.instance.setResourceLoaderScene(this)
    }

    create(): void {
        this.minigameScenePod = PodProvider.instance.minigameScenePod //new MinigameScenePod()
        this.minigameScenePod.id = 1
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameStartMenuUIView = new MinigameStartMenuUIView(this).setDepth(2)
        this.minigameCPuzzleGameplayUIView = new MinigameCPPuzzleGameplayUIView(this)
        this.minigameResultUIView = new MinigameResultUIView(this)

        this.minigameMenuUIView.doInit(1)
        this.minigameStartMenuUIView.doInit(1, this.minigameScenePod)
        this.minigameCPuzzleGameplayUIView.doInit(this.minigameScenePod)
        this.minigameResultUIView.doInit(this.minigameScenePod)

        // this.settingUIPanelView = new SettingUIPanelView(this)
        // this.settingUIPanelView.doInit()
    }

    update() {
        this.minigameCPuzzleGameplayUIView.onUpdate()
    }
}
