import { Scene } from 'phaser'
import { MinigameMenuUIView } from '../scripts/minigame/MinigameMenuUIView'
import { MinigameScenePod } from '../scripts/minigame/MinigameScenePod'
import { MinigameState } from '../scripts/minigame/MinigameState'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { MinigameCPOrderGameplayUIView } from './../scripts/minigame/minigame-2-cp-order/MinigameCPOrderGameplayUIView'
import { MinigameStartMenuUIView } from '../scripts/minigame/MinigameStartMenuUIView'
import { MinigameResultUIView } from '../scripts/minigame/MinigameResultUIView'
import { MinigameResultUIMiniView } from '../scripts/minigame/MinigameResultUIMiniView'
import { SettingMinigameUIPanelView } from '../scripts/Town/Settings/SettingMinigameUIPanelView'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'
import { UserProfileMinigamePanelView } from '../scripts/User/UserProfileMinigamePanelView'

export class MinigameCPOrderScene extends Scene {
    private minigameScenePod: MinigameScenePod
    private minigameMenuUIView: MinigameMenuUIView
    private minigameStartMenuUIView: MinigameStartMenuUIView
    private minigameCPOrderGameplayUIView: MinigameCPOrderGameplayUIView
    private minigameResultUIView: MinigameResultUIView
    private minigameResultUIMiniView: MinigameResultUIMiniView
    private settingUIPanelView: SettingMinigameUIPanelView
    private userProfilePanelView: UserProfileMinigamePanelView

    constructor() {
        super({ key: 'MinigameCPOrder' })
    }

    public preload(): void {
        console.log('Start MinigameCPOrder')
        ResourceManager.instance.setResourceLoaderScene(this)
        DeviceChecker.instance.doInit(this)
    }

    public create(): void {
        this.minigameScenePod = PodProvider.instance.minigameScenePod
        this.minigameScenePod.setGameId(2)
        this.minigameScenePod.setSceneState(MinigameState.StartMenu)
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameStartMenuUIView = new MinigameStartMenuUIView(this)
        this.minigameCPOrderGameplayUIView = new MinigameCPOrderGameplayUIView(this)
        this.minigameResultUIView = new MinigameResultUIView(this)
        this.minigameResultUIMiniView = new MinigameResultUIMiniView(this)

        this.minigameMenuUIView.doInit(2, this.minigameScenePod)
        this.minigameStartMenuUIView.doInit(2, this.minigameScenePod)
        this.minigameCPOrderGameplayUIView.doInit()
        this.minigameResultUIView.doInit('SERVED', this.minigameScenePod)
        this.minigameResultUIMiniView.doInit('SERVED', this.minigameScenePod)

        this.settingUIPanelView = new SettingMinigameUIPanelView(this)
        this.settingUIPanelView.doInit(this.minigameScenePod)
        this.userProfilePanelView = new UserProfileMinigamePanelView(this)
        this.userProfilePanelView.doInit(this.minigameScenePod)
    }

    public update(): void {
        this.minigameCPOrderGameplayUIView?.onUpdate()
    }
}
