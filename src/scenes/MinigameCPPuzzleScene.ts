import { MinigameCPPuzzleImageCellView } from './../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleImageCellView'
import { MinigameStartMenuUIView } from '../scripts/minigame/MinigameStartMenuUIView'
import { MinigameScenePod } from './../scripts/minigame/MinigameScenePod'
import { delay, timer, Subscription, timeInterval, interval, take, map, merge, mergeMap } from 'rxjs'
import { Scene } from 'phaser'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameResultUIView } from '../scripts/minigame/MinigameResultUIView'
import { MinigameCPPuzzleGameplayUIView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleGameplayUIView'
import { MinigameMenuUIView } from '../scripts/minigame/MinigameMenuUIView'
import { SettingUIPanelView } from '../scripts/Town/Settings/SettingUIPanelView'
import { PodProvider } from '../scripts/pod/PodProvider'
import { MinigameResultUIMiniView } from '../scripts/minigame/MinigameResultUIMiniView'
import { MinigameState } from '../scripts/minigame/MinigameState'
import { SettingMinigameUIPanelView } from '../scripts/Town/Settings/SettingMinigameUIPanelView'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'

export class MinigameCPPuzzleScene extends Scene {
    minigameScenePod: MinigameScenePod
    minigameMenuUIView: MinigameMenuUIView
    minigameStartMenuUIView: MinigameStartMenuUIView
    minigameCPuzzleGameplayUIView: MinigameCPPuzzleGameplayUIView
    minigameCPPuzzlePreviewImage: MinigameCPPuzzleImageGroupView
    minigameResultUIView: MinigameResultUIView
    minigameResultUIMiniView: MinigameResultUIMiniView
    private settingUIPanelView: SettingMinigameUIPanelView

    constructor() {
        super({
            key: 'MinigameCPPuzzle',
        })
    }

    preload(): void {
        console.log('start MinigameCPPuzzle')
        ResourceManager.instance.setResourceLoaderScene(this)
        DeviceChecker.instance.doInit(this)
    }

    create(): void {
        this.minigameScenePod = new MinigameScenePod()
        this.minigameScenePod.setSceneState(MinigameState.StartMenu)
        this.minigameScenePod.setGameId(1)
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameStartMenuUIView = new MinigameStartMenuUIView(this).setDepth(2)
        this.minigameCPuzzleGameplayUIView = new MinigameCPPuzzleGameplayUIView(this)
        this.minigameResultUIView = new MinigameResultUIView(this)
        this.minigameResultUIMiniView = new MinigameResultUIMiniView(this)

        this.minigameMenuUIView.doInit(1, this.minigameScenePod)
        this.minigameStartMenuUIView.doInit(1, this.minigameScenePod)
        this.minigameCPuzzleGameplayUIView.doInit(this.minigameScenePod)
        this.minigameResultUIView.doInit('TIME', this.minigameScenePod)
        this.minigameResultUIMiniView.doInit('TIME', this.minigameScenePod)

        this.settingUIPanelView = new SettingMinigameUIPanelView(this)
        this.settingUIPanelView.doInit(this.minigameScenePod)
    }

    update() {
        this.minigameCPuzzleGameplayUIView.onUpdate()
    }
}
