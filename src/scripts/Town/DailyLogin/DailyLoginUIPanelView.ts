import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip } from 'rxjs'
import { Button } from '../../button/Button'
import { DimButton } from '../../button/DimButton'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { AnimationController } from '../AnimationController'
import { TownUIState } from '../Type/TownUIState'
import { DailyLoginPod } from './../../pod/DailyLoginPod'
import { TownUIPod } from './../Pod/TownUIPod'
import { DailyLoginCellView } from './DailyLoginCellView'
import { DailyLoginCollectState } from './DailyLoginCollectState'
import { AudioManager } from '../../Audio/AudioManager'
import { BoldText } from '../../../BoldText/BoldText'
import { TownDayNightPod } from '../../pod/TownDayNightPod'
import { TownTimeState } from '../Type/TownTimeState'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { UIDepthConfig } from '../../UIDepthConfig'

export class DailyLoginUIPanelView extends GameObjects.Container {
    public static readonly BG_WIDTH_DESKTOP: number = 602
    public static readonly BG_HEIGHT_DESKTOP: number = 680
    public static readonly BG_WIDTH_MOBILE: number = 343
    public static readonly BG_HEIGHT_MOBILE: number = 548

    private dimButton: DimButton
    private skipButton: GameObjects.Rectangle

    private dailyLoginPanelBg: GameObjects.NineSlice

    private dailyLoginUIContainer: GameObjects.Container
    private dailyLoginHeaderContainer: GameObjects.Container
    private dailyLoginCellContainer: GameObjects.Container

    private dailyLoginHeaderBg: GameObjects.Image
    private dailyLoginHeaderIcon: GameObjects.Image
    private dailyLoginInnerBg: GameObjects.Image

    private dailyLoginHeaderText: GameObjects.Text
    private dailyLoginText: GameObjects.Text

    private dailyLoginCellViews: DailyLoginCellView[] = []
    private dailyLoginCellToStamp: DailyLoginCellView

    private confirmButton: Button

    private isDesktop: boolean

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private audioManager: AudioManager

    private townUIPod: TownUIPod
    private dailyLoginPod: DailyLoginPod
    private townDayNightPod: TownDayNightPod

    private stateSubscription: Subscription

    private cameraCenterX: number = this.scene.cameras.main.centerX
    private cameraCenterY: number = this.scene.cameras.main.centerY

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.dailyLoginPod = PodProvider.instance.dailyLoginPod
        this.audioManager = PodProvider.instance.audioManager
        this.townDayNightPod = PodProvider.instance.townDayNightPod

        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.setPosition(this.cameraCenterX, this.cameraCenterY)
        this.setDepth(UIDepthConfig.DAILY_LOGIN)
        this.setupUI()
        this.setupButtonListeners()
        this.createTweens()
        this.setupSubscribes()
    }

    private setupUI(): void {
        this.dimButton = new DimButton(this.scene)
        this.setupDailyLoginUIContainer()
        this.add([this.dimButton, this.dailyLoginUIContainer])
    }

    private setupSubscribes(): void {
        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.DailyLogin) {
                this.setActiveContainer(true)
                if (this.townUIPod.isShowGuideline.value == false && state == TownUIState.DailyLogin) {
                    this.townUIPod.setIsShowGuideline(true)
                }

                if (this.townDayNightPod.getTownTimeState() == TownTimeState.Day){
                    this.audioManager.playAmbientSound('town_day_ambient', false)
                    this.audioManager.playBGMSound('citygame_town_day', false)
                }
                else {
                    this.audioManager.playAmbientSound('town_night_ambient', false)
                    this.audioManager.playBGMSound('citygame_town_night', false)
                }
            } else {
                this.setActiveContainer(false)
            }
        })

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.DailyLogin, false)
        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
        })
    }

    private setupDailyLoginUIContainer(): void {
        this.dailyLoginUIContainer = this.scene.add.container()
        this.dailyLoginCellContainer = this.scene.add.container()
        this.dailyLoginText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('กลับมาอีกครั้งในวันพรุ่งนี้ เพื่อรับของรางวัลสุดพิเศษ')
            .setColor('#585858')
            .setOrigin(0.5)
        this.confirmButton = this.createButton(186, 48, 'button-white-bg', 'COLLECT REWARD', 0x29cc6a)
        this.isDesktop ? this.setupDailyLoginUIDesktop() : this.setupDailyLoginUIMobile()
        this.setupDailyLoginHeaderContainer()

        this.dailyLoginPod.getDailyLoginData().subscribe((dailyLoginBeans) => {
            this.setupSkipButton()
            dailyLoginBeans.forEach((bean) => {
                let dailyLoginCellView = new DailyLoginCellView(this.scene)
                dailyLoginCellView.doInit(bean)
                this.dailyLoginCellViews.push(dailyLoginCellView)
            })

            this.setupDailyLoginCells(0)
            this.setupDailyLoginCellContainer()

            if (this.townUIPod.townUIState.value == TownUIState.DailyLogin) {
                this.updateCellForCollecting()
            }
        })
    }

    private setupDailyLoginCells(index: number): void {
        if (index + 1 > this.dailyLoginCellViews.length - 1) return

        let cellCount = 0
        let offset = this.isDesktop ? 10 : 8
        let spacing = this.isDesktop ? 10 : 5

        let rowContainer = this.scene.add.container()
        let rowPage = this.scene.add.rectangle(
            0,
            0,
            this.dailyLoginPanelBg.width / 1.05,
            this.dailyLoginCellViews[0].height - 15,
            0xff0000,
            0
        )

        rowContainer.add(rowPage)
        rowContainer.width = rowContainer.getBounds().width
        rowContainer.height = rowContainer.getBounds().height

        let containerGroupCell = this.scene.add.container(0, 0)

        for (let i = index; i < this.dailyLoginCellViews.length; i++) {
            this.dailyLoginCellViews[i].getIsBigReward() ? (cellCount += 2) : (cellCount += 1)

            containerGroupCell.add(this.dailyLoginCellViews[i])
            if (cellCount >= 4) {
                this.setupCellRowContainer(containerGroupCell, rowContainer, offset, spacing)
                this.setupDailyLoginCells(i + 1)
                break
            }
        }
    }

    private setupDailyLoginCellContainer(): void {
        this.dailyLoginCellContainer.setPosition(
            this.isDesktop ? -this.dailyLoginInnerBg.width / 2 + 295 : 0,
            this.isDesktop ? -this.dailyLoginInnerBg.height / 2 + 80 : -this.dailyLoginPanelBg.height / 2 + 108
        )
        Phaser.Actions.AlignTo(
            this.dailyLoginCellContainer.getAll(),
            Phaser.Display.Align.BOTTOM_CENTER,
            0,
            this.isDesktop ? 12 : -1
        )
        this.dailyLoginUIContainer.add([this.dailyLoginCellContainer])
    }

    private setupCellRowContainer(
        containerGroupCell: GameObjects.Container,
        rowContainer: GameObjects.Container,
        offset: number,
        spacing: number
    ): void {
        containerGroupCell.width = containerGroupCell.getBounds().width
        containerGroupCell.height = containerGroupCell.getBounds().height
        let cellGroup = containerGroupCell.getAll()[0] as GameObjects.Container
        containerGroupCell.setPosition(-rowContainer.width / 2 + cellGroup.width / 2 + offset, 0)
        rowContainer.add(containerGroupCell)
        Phaser.Actions.AlignTo(containerGroupCell.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacing)
        this.dailyLoginCellContainer.add([rowContainer])
    }

    private setupDailyLoginUIDesktop(): void {
        this.dailyLoginUIContainer.setPosition(0, 30)
        this.dailyLoginPanelBg = this.scene.add
            .nineslice(
                0,
                0,
                'inventory-bg',
                '',
                DailyLoginUIPanelView.BG_WIDTH_DESKTOP,
                DailyLoginUIPanelView.BG_HEIGHT_DESKTOP,
                24,
                24,
                24,
                24
            )
            .setOrigin(0.5)

        this.dailyLoginInnerBg = this.scene.add
            .image(this.dailyLoginPanelBg.x, this.dailyLoginPanelBg.y - 25, 'daily-login-inner-bg')
            .setTint(0xdfe5ed)
            .setOrigin(0.5)

        this.dailyLoginText.setFontSize(24).setPosition(this.dailyLoginInnerBg.x, -this.dailyLoginInnerBg.height / 2)

        this.confirmButton.setPosition(this.dailyLoginPanelBg.x, this.dailyLoginPanelBg.height / 2 - 50)
        this.dailyLoginPanelBg.setInteractive()

        this.dailyLoginUIContainer.add([
            this.dailyLoginPanelBg,
            this.dailyLoginInnerBg,
            this.dailyLoginText,
            this.confirmButton,
        ])
    }

    private setupDailyLoginUIMobile(): void {
        this.dailyLoginPanelBg = this.scene.add
            .nineslice(
                0,
                0,
                'inventory-bg',
                '',
                DailyLoginUIPanelView.BG_WIDTH_MOBILE,
                DailyLoginUIPanelView.BG_HEIGHT_MOBILE,
                24,
                24,
                24,
                24
            )
            .setTint(0xf5faff)
            .setOrigin(0.5)

        this.dailyLoginText
            .setFontSize(20)
            .setPosition(this.dailyLoginPanelBg.x, -this.dailyLoginPanelBg.height / 2 + 40)

        this.confirmButton.setPosition(this.dailyLoginPanelBg.x, this.dailyLoginPanelBg.height / 2 - 50)

        this.dailyLoginPanelBg.setInteractive()
        this.dailyLoginUIContainer.add([this.dailyLoginPanelBg, this.dailyLoginText, this.confirmButton])
    }

    private setupDailyLoginHeaderContainer(): void {
        this.dailyLoginHeaderContainer = this.scene.add.container()
        this.dailyLoginHeaderBg = this.scene.add.image(0, 0, 'header-background').setOrigin(0.5)
        this.dailyLoginHeaderIcon = this.scene.add.image(0, 0, 'daily-login-header-icon').setOrigin(0.5)
        this.dailyLoginHeaderText = new BoldText(this.scene, 0, 0, 'DAILY LOGIN')

        if (this.isDesktop) {
            this.dailyLoginHeaderContainer.setPosition(0, -this.dailyLoginPanelBg.height / 2)
            this.dailyLoginHeaderBg.setScale(1.25)
            this.dailyLoginHeaderIcon.setScale(1.35).setPosition(-90, -25)
            this.dailyLoginHeaderText.setPosition(38, -10).setStyle({ fontSize: 36 })
        } else {
            this.dailyLoginHeaderContainer.setPosition(0, -this.dailyLoginPanelBg.height / 2 - 3)
            this.dailyLoginHeaderIcon.setPosition(-70, -18)
            this.dailyLoginHeaderText.setPosition(28, -10).setStyle({ fontSize: 28 })
        }

        this.dailyLoginHeaderContainer.add([
            this.dailyLoginHeaderBg,
            this.dailyLoginHeaderIcon,
            this.dailyLoginHeaderText,
        ])

        this.dailyLoginUIContainer.add([this.dailyLoginHeaderContainer])
    }

    private setupButtonListeners(): void {
        this.dimButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })

        this.confirmButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()

                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.setActive(true)
                this.setVisible(true)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.dimButton.setActiveDim(false)
            }
        } else {
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
        }
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        colorBG: number,
        iconKey?: string
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 21,
            bottomHeight: 23,
            safeAreaOffset: 0,
        })

        button.setTextStyle(
            {
                fontFamily: 'DB_HeaventRounded_Bd',
                fill: 'white',
                fontSize: 22,
            },
            !DeviceChecker.instance.isAppleOS()
        )

        button.setTextPosition(0, 3)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }

    private createTweens(): void {
        let openTweens = AnimationController.instance.tweenOpenContainer(this.scene, this.dailyLoginUIContainer, () => {
            this.updateCellForCollecting()
        })
        this.onOpenTween = openTweens.onOpenTween
        this.onOpenTweenChain = openTweens.onOpenTweenChain

        let closeTweens = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.dailyLoginUIContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )
        this.onCloseTween = closeTweens.onCloseTween
        this.onCloseTweenChain = closeTweens.onCloseTweenChain
    }

    private updateCellForCollecting(): void {
        this.dailyLoginCellToStamp = this.dailyLoginCellViews.find(
            (cellView) => cellView.getCollectState() == DailyLoginCollectState.Collecting
        )
        this.dailyLoginCellToStamp?.updateCellOnCollecting(this.skipButton)
        this.dailyLoginCellToStamp?.parentContainer.bringToTop(this.dailyLoginCellToStamp)
    }

    private setupSkipButton(): void {
        this.skipButton = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height + 100,
            0xffffff,
            0.01
        )

        this.skipButton.setInteractive().on('pointerdown', () => {
            this.dailyLoginCellToStamp?.stopStampTween()
            this.skipButton.removeInteractive()
        })

        this.dailyLoginUIContainer.add([this.skipButton])
    }
}
