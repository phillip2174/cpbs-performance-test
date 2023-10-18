import { Actions, Display, GameObjects, Scene, Tweens } from 'phaser'
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

export class DailyLoginUIPanelView extends GameObjects.Container {
    public static readonly BG_WIDTH_DESKTOP: number = 602
    public static readonly BG_HEIGHT_DESKTOP: number = 680
    public static readonly BG_WIDTH_MOBILE: number = 343
    public static readonly BG_HEIGHT_MOBILE: number = 548

    private dimButton: DimButton
    private dailyLoginPanelBg: GameObjects.NineSlice

    private dailyLoginUIContainer: GameObjects.Container
    private dailyLoginHeaderContainer: GameObjects.Container

    private dailyLoginHeaderBg: GameObjects.Image
    private dailyLoginHeaderIcon: GameObjects.Image
    private dailyLoginInnerBg: GameObjects.Image

    private dailyLoginHeaderText: GameObjects.Text
    private dailyLoginText: GameObjects.Text

    private dailyLoginCellViews: DailyLoginCellView[] = []

    private confirmButton: Button

    private isDesktop: boolean

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private townUIPod: TownUIPod
    private dailyLoginPod: DailyLoginPod

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
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.setPosition(this.cameraCenterX, this.cameraCenterY)
        this.setDepth(202)
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
            } else {
                this.setActiveContainer(false)
            }
        })

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.DailyLogin, false)
    }

    private setupDailyLoginUIContainer(): void {
        this.dailyLoginUIContainer = this.scene.add.container()
        this.dailyLoginText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Come back daily and collect awesome rewards!')
            .setColor('#585858')
            .setOrigin(0.5)
        this.confirmButton = this.createButton(119, 48, 'button-white-bg', 'CONFIRM', 0x29cc6a)
        this.isDesktop ? this.setupDailyLoginUIDesktop() : this.setupDailyLoginUIMobile()
        this.setupDailyLoginHeaderContainer()

        this.dailyLoginPod.getDailyLoginData().subscribe((dailyLoginBeans) => {
            dailyLoginBeans.forEach((bean) => {
                let dailyLoginCellView = new DailyLoginCellView(this.scene)
                dailyLoginCellView.doInit(bean)
                dailyLoginCellView.setPosition(
                    this.isDesktop ? -this.dailyLoginInnerBg.width / 2 + 75 : -this.dailyLoginPanelBg.width / 2 + 50,
                    -this.dailyLoginPanelBg.height / 2 + (this.isDesktop ? 155 : 125)
                )
                this.dailyLoginCellViews.push(dailyLoginCellView)
                this.dailyLoginUIContainer.add([dailyLoginCellView])
            })

            this.dailyLoginCellViews = Actions.AlignTo(
                this.dailyLoginCellViews,
                Display.Align.RIGHT_CENTER,
                this.isDesktop ? 10 : 5
            )

            if (this.townUIPod.townUIState.value == TownUIState.DailyLogin) {
                this.dailyLoginCellViews
                    .find((cellView) => cellView.getCollectState() == DailyLoginCollectState.Collecting)
                    ?.updateCellOnCollecting()
            }
        })
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

        this.dailyLoginText
            .setFontSize(24)
            .setPosition(this.dailyLoginInnerBg.x, -this.dailyLoginInnerBg.height / 2 + 5)

        this.confirmButton.setPosition(this.dailyLoginPanelBg.x, this.dailyLoginPanelBg.height / 2 - 50)
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
            .setPosition(this.dailyLoginPanelBg.x, -this.dailyLoginPanelBg.height / 2 + 45)

        this.confirmButton.setPosition(this.dailyLoginPanelBg.x, this.dailyLoginPanelBg.height / 2 - 35)
        this.dailyLoginUIContainer.add([this.dailyLoginPanelBg, this.dailyLoginText, this.confirmButton])
    }

    private setupDailyLoginHeaderContainer(): void {
        this.dailyLoginHeaderContainer = this.scene.add.container()
        this.dailyLoginHeaderBg = this.scene.add.image(0, 0, 'header-background').setOrigin(0.5)
        this.dailyLoginHeaderIcon = this.scene.add.image(0, 0, 'daily-login-header-icon').setOrigin(0.5)
        this.dailyLoginHeaderText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('DAILY LOGIN')
            .setOrigin(0.5)

        if (this.isDesktop) {
            this.dailyLoginHeaderContainer.setPosition(0, -this.dailyLoginPanelBg.height / 2)
            this.dailyLoginHeaderBg.setScale(1.25)
            this.dailyLoginHeaderIcon.setScale(1.35).setPosition(-90, -25)
            this.dailyLoginHeaderText.setPosition(38, -10).setStyle({ fill: '#FFFFFF', fontSize: 36 })
        } else {
            this.dailyLoginHeaderContainer.setPosition(0, -this.dailyLoginPanelBg.height / 2 - 3)
            this.dailyLoginHeaderIcon.setPosition(-70, -18)
            this.dailyLoginHeaderText.setPosition(28, -10).setStyle({ fill: '#FFFFFF', fontSize: 28 })
        }

        this.dailyLoginHeaderContainer.add([
            this.dailyLoginHeaderBg,
            this.dailyLoginHeaderIcon,
            this.dailyLoginHeaderText,
        ])
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
            leftWidth: 20,
            rightWidth: 20,
            topHeight: 1,
            bottomHeight: 1,
            safeAreaOffset: 0,
        })

        button.setTextStyle({
            fontFamily: 'DB_HeaventRounded_Bd',
            fill: 'white',
            fontSize: 22,
        })

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
            this.dailyLoginCellViews
                .find((cellView) => cellView.getCollectState() == DailyLoginCollectState.Collecting)
                ?.updateCellOnCollecting()
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
}
