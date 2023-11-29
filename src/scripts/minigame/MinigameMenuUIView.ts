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

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(minigameNumber: number, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.minigameNumber = minigameNumber
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        this.group = this.scene.add.container(centerX, centerY).setDepth(2)
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.setUpImage()
        this.setUpButton()

        this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.StartMenu || state == MinigameState.Completed) {
                this.showUI()
            } else {
                this.hideUI()
            }
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
            this.bg.x = this.bg.x - this.scene.cameras.main.width
            this.bg.setDisplaySize(this.bg.width, this.scene.cameras.main.height)
        }

        // let timeBarView = new TimeBarView(this.scene).setDepth(100)
        // timeBarView.doInit(centerX, centerY, 201, 58, 100, 145, 20, -5, 11)
        // timeBarView.createTextTime(-5, -7, '#585858', 22)

        // timeBarView.addCallBack(() => {
        //     timeBarView.startTimeBar(11000, true)
        // })

        // timeBarView.startTimeBar(10000, true)

        // let timeBarDeskView = new TimeBarView(this.scene).setDepth(100)
        // timeBarDeskView.doInit(centerX, centerY + 100, 271, 70, 100, 199, 18, -10, 16, 10, 48)
        // timeBarDeskView.createTextTime(-60, -12, '#2b2b2b', 24)
        // let headerText = new HeaderScoreView(this.scene, centerX, centerY, 'TIME').setDepth(100)
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

            this.userProfileButton = new TownUICircleButtonView(this.scene)
            this.userProfileButton.doInit(this.settingButton.x - 80, this.settingButton.y, 'user-profile')

            this.group.add(this.userProfileButton)

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
                PodProvider.instance.splashPod.setLaunchScene(SceneState.TownScene)
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

            this.userProfileButton = new TownUICircleButtonView(this.scene)
            this.userProfileButton.doInit(this.settingButton.x - 70, this.settingButton.y, 'user-profile')
            this.group.add(this.userProfileButton)

            this.townCircleButton = new TownUICircleButtonView(this.scene)
            this.townCircleButton.doInit(
                this.settingButton.x - 128,
                this.settingButton.y,
                'minigame',
                TownUIButtonType.MainMenu
            )

            this.townCircleButton.onClick(() => {
                //back to city scene
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
}
