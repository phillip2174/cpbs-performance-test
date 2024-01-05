import { GameObjects, Scene } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { Button } from '../button/Button'
import { MinigameScenePod } from './MinigameScenePod'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { CPPointUIButtonView } from '../Town/CPPointUIButtonView'
import { SettingButtonGroupView } from '../Town/Settings/SettingButtonGroupView'
import { SettingUIPanelView } from '../Town/Settings/SettingUIPanelView'
import { TownUICircleButtonView } from '../Town/TownUICircleButtonView'
import { TownUIButtonView } from '../Town/TownUIButtonView'
import { TownUIButtonType } from '../Town/Type/TownUIButtonType'
import { CPLogoUIButtonView } from '../Town/CPLogoUIButtonView'
import { PodProvider } from '../pod/PodProvider'
import { SceneState } from '../../scenes/SceneState'
import { TimeBarView } from '../../bar/TimeBarView'
import { HeaderScoreView } from './HeaderScroeView'
import { MinigameState } from './MinigameState'
import { APILoadingManager } from '../api-loading/APILoadingManager'
import { AudioManager } from '../Audio/AudioManager'
import { RunInBackground } from '../../util/RunInBackground'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { UIDepthConfig } from '../UIDepthConfig'

export class MinigameMenuUIView extends GameObjects.GameObject {
    private startButton: Button
    private bg: GameObjects.Image
    private group: GameObjects.Container
    private scenePod: MinigameScenePod
    private isDesktop: boolean
    private minigameNumber: number
    private cpPointButton: CPPointUIButtonView
    private settingButton: TownUICircleButtonView
    private userProfileButton: TownUICircleButtonView
    private townCircleButton: TownUICircleButtonView
    private cpLogoUIButtonView: CPLogoUIButtonView

    private cpTownButton: TownUIButtonView

    private audioManager: AudioManager

    private sceneStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(minigameNumber: number, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.audioManager = PodProvider.instance.audioManager
        this.minigameNumber = minigameNumber
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        this.group = this.scene.add.container(centerX, centerY).setDepth(UIDepthConfig.MINI_GAME_MENU)
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.setUpImage()
        this.setUpButton()

        this.sceneStateSubscription = this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.StartMenu || state == MinigameState.Completed) {
                this.showUI()
            } else {
                this.hideUI()
            }
        })

        this.on('destroy', () => {
            this.sceneStateSubscription?.unsubscribe()
        })
    }

    public showUI() {
        this.group.setActive(true)
        this.group.setVisible(true)
    }

    public hideUI() {
        this.group.setActive(false)
        this.group.setVisible(false)
    }

    private setUpImage() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        if (this.isDesktop) {
            this.bg = this.scene.add.image(centerX, centerY, `minigame-${this.minigameNumber}-bg`)
            this.bg.setDisplaySize(this.scene.cameras.main.width + 500, this.scene.cameras.main.height + 30)
        } else {
            this.bg = this.scene.add.image(centerX, centerY, `minigame-${this.minigameNumber}-bg`)

            this.bg.setDisplaySize(this.bg.width, this.scene.cameras.main.height)
        }
    }

    private setUpButton() {
        this.cpLogoUIButtonView = new CPLogoUIButtonView(this.scene)
        this.cpLogoUIButtonView.doInit(
            this.scene.cameras.main.centerX - this.scene.cameras.main.width / 2 + 40,
            this.scene.cameras.main.centerY - this.scene.cameras.main.height / 2 + 40
        )

        if (this.isDesktop) {
            this.settingButton = new TownUICircleButtonView(this.scene)
            this.settingButton.doInit(
                this.scene.cameras.main.width / 2 - 50,
                -this.scene.cameras.main.height / 2 + 40,
                'setting'
            )

            this.settingButton.onClick(() => {
                this.scenePod.settingState.next(true)
            })

            this.group.add(this.settingButton)

            this.setupUserProfileButton(this.settingButton.x - 80, this.settingButton.y)

            let line = this.scene.add
                .rectangle(
                    (this.userProfileButton.x + this.settingButton.x) / 2,
                    this.userProfileButton.y,
                    2,
                    32,
                    0xa7a7a7,
                    1
                )
                .setOrigin(0.5)

            this.group.add(line)

            this.cpPointButton = new CPPointUIButtonView(this.scene)
            this.cpPointButton.doInit(
                this.scene.cameras.main.width / 2 - 25,
                -this.scene.cameras.main.height / 2 + 105,
                'cp-point'
            )

            this.group.add(this.cpPointButton)

            this.cpTownButton = new TownUIButtonView(this.scene)
            this.cpTownButton.doInit(
                -this.scene.cameras.main.width / 2 + 85,
                this.scene.cameras.main.height / 2 - 60,
                'minigame',
                TownUIButtonType.MainMenu,
                'MINI GAME',
                1000,
                false,
                false
            )

            this.group.add(this.cpTownButton)

            this.cpTownButton.onClick(() => {
                //back to city scene
                this.audioManager.stopBGMSound()
                PodProvider.instance.splashPod.setIsCloseLogo(false)
                PodProvider.instance.splashPod.setLaunchScene(SceneState.TownScene)
                if (!PodProvider.instance.tutorialManager.isCompletedTutorial())
                    PodProvider.instance.recipePod.clearRecipeBeans()
                this.scene.scene.start(`SplashLoaddingScene`)
            })
        } else {
            this.settingButton = new TownUICircleButtonView(this.scene)
            this.settingButton.doInit(
                this.scene.cameras.main.width / 2 - 40,
                -this.scene.cameras.main.height / 2 + 40,
                'setting'
            )

            this.settingButton.onClick(() => {
                this.scenePod.settingState.next(true)
            })

            this.group.add(this.settingButton)

            this.setupUserProfileButton(this.settingButton.x - 70, this.settingButton.y)

            this.townCircleButton = new TownUICircleButtonView(this.scene)
            this.townCircleButton.doInit(
                this.settingButton.x - 128,
                this.settingButton.y,
                'minigame',
                TownUIButtonType.MainMenu
            )

            this.townCircleButton.onClick(() => {
                //back to city scene
                PodProvider.instance.splashPod.setIsCloseLogo(false)
                PodProvider.instance.splashPod.setLaunchScene(SceneState.TownScene)
                this.scene.scene.start(`SplashLoaddingScene`)
            })

            this.group.add(this.townCircleButton)

            let line = this.scene.add
                .rectangle(
                    (this.userProfileButton.x + this.settingButton.x) / 2,
                    this.userProfileButton.y,
                    2,
                    32,
                    0xa7a7a7,
                    1
                )
                .setOrigin(0.5)

            this.group.add(line)
        }
    }

    private setupUserProfileButton(x: number, y: number): void {
        this.userProfileButton = new TownUICircleButtonView(this.scene)
        if (
            !PodProvider.instance.userPod.userBean.profileImageUrl ||
            !PodProvider.instance.userPod.userBean.profileImageUrl.trim()
        ) {
            this.userProfileButton.doInit(x, y, 'user-profile-default', TownUIButtonType.UserProfile)
        } else {
            this.userProfileButton.doInit(x, y, 'user-profile', TownUIButtonType.UserProfile)
        }

        this.userProfileButton.onClick(() => {
            this.scenePod.userProfileState.next(true)
        })

        this.group.add(this.userProfileButton)
    }
}
