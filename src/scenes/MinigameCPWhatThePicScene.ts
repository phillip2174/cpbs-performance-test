import { Scene } from 'phaser'
import { MinigameScenePod } from '../scripts/minigame/MinigameScenePod'
import { PodProvider } from '../scripts/pod/PodProvider'
import { MinigameState } from '../scripts/minigame/MinigameState'
import { MinigameMenuUIView } from '../scripts/minigame/MinigameMenuUIView'
import { MinigameStartMenuUIView } from '../scripts/minigame/MinigameStartMenuUIView'
import { MinigameResultUIView } from '../scripts/minigame/MinigameResultUIView'
import { MinigameResultUIMiniView } from '../scripts/minigame/MinigameResultUIMiniView'
import { MinigameCPWhatGameplayUIView } from '../scripts/minigame/minigame-3-cp-what-the-pic/MinigameCPWhatGameplayUIView'
import { SettingMinigameUIPanelView } from '../scripts/Town/Settings/SettingMinigameUIPanelView'
import { MinigameCPWhatPod } from '../scripts/minigame/minigame-3-cp-what-the-pic/MinigameCPWhatPod'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'
import { UserProfileMinigamePanelView } from '../scripts/User/UserProfileMinigamePanelView'

export class MinigameCPWhatThePicScene extends Scene {
    private minigameScenePod: MinigameScenePod
    private minigameMenuUIView: MinigameMenuUIView
    private minigameStartMenuUIView: MinigameStartMenuUIView
    private minigameCPWhatGameplayUIView: MinigameCPWhatGameplayUIView
    private minigameResultUIView: MinigameResultUIView
    private minigameResultUIMiniView: MinigameResultUIMiniView
    private settingUIPanelView: SettingMinigameUIPanelView
    private userProfilePanelView: UserProfileMinigamePanelView

    private minigameCPWhatPod: MinigameCPWhatPod

    constructor() {
        super({ key: 'MinigameCPWhatThePic' })
    }

    public preload(): void {
        console.log('Start MinigameCPWhatThePic')
        ResourceManager.instance.setResourceLoaderScene(this)
        DeviceChecker.instance.doInit(this)
    }
    public create(): void {
        this.minigameCPWhatPod = new MinigameCPWhatPod()
        this.minigameScenePod = PodProvider.instance.minigameScenePod
        this.minigameScenePod.setGameId(3)
        this.minigameScenePod.setSceneState(MinigameState.StartMenu)
        this.minigameMenuUIView = new MinigameMenuUIView(this)
        this.minigameStartMenuUIView = new MinigameStartMenuUIView(this).setDepth(2)
        this.minigameCPWhatGameplayUIView = new MinigameCPWhatGameplayUIView(this)
        this.minigameResultUIView = new MinigameResultUIView(this)
        this.minigameResultUIMiniView = new MinigameResultUIMiniView(this)
        ///////////////////////////////////////////////tap tap
        this.minigameMenuUIView.doInit(3, this.minigameScenePod)
        this.minigameStartMenuUIView.doInit(3, this.minigameScenePod)
        this.minigameCPWhatGameplayUIView.doInit()
        this.minigameResultUIView.doInit('OPEN', this.minigameScenePod)
        this.minigameResultUIMiniView.doInit('OPEN', this.minigameScenePod)

        this.settingUIPanelView = new SettingMinigameUIPanelView(this)
        this.settingUIPanelView.doInit(this.minigameScenePod)
        this.userProfilePanelView = new UserProfileMinigamePanelView(this)
        this.userProfilePanelView.doInit(this.minigameScenePod)
    }
}
