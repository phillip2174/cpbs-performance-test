import { Scene } from 'phaser'
import { MinigameScenePod } from '../scripts/minigame/MinigameScenePod'
import { PodProvider } from '../scripts/pod/PodProvider'
import { MinigameState } from '../scripts/minigame/MinigameState'
import { MinigameMenuUIView } from '../scripts/minigame/MinigameMenuUIView'
import { MinigameStartMenuUIView } from '../scripts/minigame/MinigameStartMenuUIView'
import { MinigameResultUIView } from '../scripts/minigame/MinigameResultUIView'
import { MinigameResultUIMiniView } from '../scripts/minigame/MinigameResultUIMiniView'
import { MinigameCPGuessGameplayUIView } from '../scripts/minigame/minigame-3-cp-guess-this-picture/MinigameCPGuessGameplayUIView'
import { SettingMinigameUIPanelView } from '../scripts/Town/Settings/SettingMinigameUIPanelView'
import { MinigameCPGuessPod } from '../scripts/minigame/minigame-3-cp-guess-this-picture/MinigameCPGuessPod'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'

export class MinigameCPGuessThisPictureScene extends Scene {
    private minigameScenePod: MinigameScenePod
    private minigameMenuUIView: MinigameMenuUIView
    private minigameStartMenuUIView: MinigameStartMenuUIView
    private minigameCPGuessThisPictureGameplayUIView: MinigameCPGuessGameplayUIView
    private minigameResultUIView: MinigameResultUIView
    private minigameResultUIMiniView: MinigameResultUIMiniView
    private settingUIPanelView: SettingMinigameUIPanelView

    private minigameCPGuessThisPicturePod: MinigameCPGuessPod

    constructor() {
        super({ key: 'MinigameCPGuessThisPicture' })
    }

    public preload(): void {
        console.log('Start MinigameCPGuessThisPicture')
        ResourceManager.instance.setResourceLoaderScene(this)
        DeviceChecker.instance.doInit(this)
    }
    public create(): void {
        this.minigameCPGuessThisPicturePod = new MinigameCPGuessPod()
        this.minigameScenePod = PodProvider.instance.minigameScenePod
        this.minigameScenePod.setGameId(3)
        this.minigameScenePod.setSceneState(MinigameState.StartMenu)
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameStartMenuUIView = new MinigameStartMenuUIView(this).setDepth(2)
        this.minigameCPGuessThisPictureGameplayUIView = new MinigameCPGuessGameplayUIView(this)
        this.minigameResultUIView = new MinigameResultUIView(this)
        this.minigameResultUIMiniView = new MinigameResultUIMiniView(this)
        ///////////////////////////////////////////////tap tap
        this.minigameMenuUIView.doInit(3, this.minigameScenePod)
        this.minigameStartMenuUIView.doInit(3, this.minigameScenePod)
        this.minigameCPGuessThisPictureGameplayUIView.doInit()
        this.minigameResultUIView.doInit('GUESS', this.minigameScenePod)
        this.minigameResultUIMiniView.doInit('GUESS', this.minigameScenePod)

        this.settingUIPanelView = new SettingMinigameUIPanelView(this)
        this.settingUIPanelView.doInit(this.minigameScenePod)
    }
}
