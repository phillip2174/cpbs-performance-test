import { GameObjects, Scene, Tweens } from 'phaser'
import { BoldText } from '../../../BoldText/BoldText'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { DimButton } from './../../button/DimButton'
import { Button } from './../../button/Button'
import { Subscription, skip } from 'rxjs'
import { PodProvider } from '../../pod/PodProvider'
import { TownTimeState } from '../Type/TownTimeState'
import { AnimationController } from '../AnimationController'
import { TownDayNightPod } from '../../pod/TownDayNightPod'
import { TownUIState } from '../Type/TownUIState'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { AudioManager } from '../../Audio/AudioManager'

export class DayNightNoticeView extends GameObjects.Container {
    public static readonly ICON_KEY: string = 'day-night-notice-'

    private dimButton: DimButton

    private noticeUIContainer: GameObjects.Container

    private noticeBg: GameObjects.NineSlice
    private dayNightIcon: GameObjects.Image

    private headerText: GameObjects.Text
    private startDescText: GameObjects.Text
    private midDescText: GameObjects.Text
    private endDescText: GameObjects.Text

    private confirmButton: Button

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private townDayNightPod: TownDayNightPod

    private audioManager: AudioManager

    private countdownFinishSubscription: Subscription

    private isDesktop: boolean

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit(): void {
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.audioManager = PodProvider.instance.audioManager
        this.dimButton = new DimButton(this.scene)
        this.noticeUIContainer = this.scene.add.container()

        this.noticeBg = this.scene.add
            .nineslice(0, 0, 'ui-notice-bg', '', this.isDesktop ? 380 : 320, this.isDesktop ? 216 : 212, 31, 31, 32, 32)
            .setOrigin(0.5)

        this.dayNightIcon = this.scene.add
            .image(0, -this.noticeBg.height / 2 + 5, DayNightNoticeView.ICON_KEY + 'night-icon')
            .setOrigin(0.5)
            .setVisible(false)

        this.setupTexts()
        this.setupButton()

        this.noticeUIContainer.add([
            this.noticeBg,
            this.dayNightIcon,
            this.headerText,
            this.startDescText,
            this.midDescText,
            this.endDescText,
            this.confirmButton,
        ])

        this.setDepth(203)
        this.add([this.dimButton, this.noticeUIContainer])

        this.createTweens()
        this.setupSubscribe()
    }

    private setupButton(): void {
        this.confirmButton = this.createButton(this.isDesktop ? 150 : 118, 48, 'button-white-bg', 'OK', 0x29cc6a)
        this.confirmButton.setPosition(0, Math.floor(this.noticeBg.height / 2) - 50)
        this.confirmButton.onClick(() => {
            if (this.townDayNightPod.getTownTimeState() == TownTimeState.Day) {
                this.townDayNightPod.setTownTimeState(TownTimeState.Night)
            } else {
                this.townDayNightPod.setTownTimeState(TownTimeState.Day)
            }
            location.reload()
        })

        this.dimButton.onClick(() => {})
    }

    private showNightNotice(): void {
        this.headerText.setText('Hello Sunset')
        this.dayNightIcon.setTexture(DayNightNoticeView.ICON_KEY + 'night-icon').setVisible(true)
        this.startDescText.setText(
            'CP City กำลังเข้าสู่ช่วงเวลากลางคืนแล้ว\n  อาจจะมีวัตถุดิบลึกลับซ่อนอยู่ ก็เป็นได้!'
        )
    }

    private showDayNotice(): void {
        this.startDescText
            .setText('CP City กำลังจะเข้าสู่ช่วงเวลากลางวันแล้ว')
            .setPosition(0, this.isDesktop ? -10 : -25)

        if (!this.isDesktop) {
            this.noticeBg.setSize(320, 232)
            this.dayNightIcon.setPosition(0, -this.noticeBg.height / 2 + 5)
            this.headerText.setPosition(0, -this.noticeBg.height / 2 + 65)
            this.midDescText.setPosition(0, this.startDescText.y + 20)
            this.endDescText.setPosition(0, this.midDescText.y + 20)
            this.confirmButton.setPosition(0, Math.floor(this.noticeBg.height / 2) - 50)
            this.midDescText.setText('ท้องฟ้าปลอดโปร่งแบบนี้').setVisible(true)
            this.endDescText.setText('เหมาะกับการค้นหาวัตถุดิบเป็นที่สุด!').setVisible(true)
        } else {
            this.endDescText.setText('ท้องฟ้าปลอดโปร่งแบบนี้ เหมาะกับการค้นหาวัตถุดิบเป็นที่สุด!').setVisible(true)
            this.endDescText.setPosition(0, this.startDescText.y + 20)
        }

        this.headerText.setText('Say Hi Sunrise')
        this.dayNightIcon.setTexture(DayNightNoticeView.ICON_KEY + 'day-icon').setVisible(true)
    }

    private setupTexts(): void {
        this.headerText = new BoldText(
            this.scene,
            0,
            -this.noticeBg.height / 2 + 65,
            '????????',
            44,
            '#0099FF'
        ).setScale(0.5)

        if (this.isDesktop) {
            if (DeviceChecker.instance.isMacOS()) {
                this.startDescText = TextAdapter.instance
                    .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                    .setText('????????????')
                    .setOrigin(0.5)
                    .setStyle({ fill: '#585858', fontSize: 36 })
                    .setPosition(0, 0)
                    .setScale(0.5)

                this.midDescText = TextAdapter.instance
                    .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                    .setText('????????????')
                    .setOrigin(0.5)
                    .setStyle({ fill: '#585858', fontSize: 36 })
                    .setScale(0.5)
                    .setVisible(false)

                this.endDescText = TextAdapter.instance
                    .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                    .setText('????????????')
                    .setOrigin(0.5)
                    .setStyle({ fill: '#585858', fontSize: 36 })
                    .setScale(0.5)
                    .setVisible(false)
            } else {
                this.startDescText = new BoldText(this.scene, 0, 0, '????????????', 36, '#585858').setScale(0.5)

                this.midDescText = new BoldText(this.scene, 0, 0, '????????????', 36, '#585858')
                    .setScale(0.5)
                    .setVisible(false)

                this.endDescText = new BoldText(this.scene, 0, 0, '????????????', 36, '#585858')
                    .setScale(0.5)
                    .setVisible(false)
            }
        } else {
            this.startDescText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded')
                .setText('????????????')
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: 36 })
                .setPosition(0, 0)
                .setScale(0.5)

            this.midDescText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded')
                .setText('????????????')
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: 36 })
                .setScale(0.5)
                .setVisible(false)

            this.endDescText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded')
                .setText('????????????')
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: 36 })
                .setScale(0.5)
                .setVisible(false)
        }
    }

    private setupSubscribe(): void {
        this.countdownFinishSubscription = PodProvider.instance.countdownTimerPod.isCountdownFinish.subscribe(
            (isFinish) => {
                if (isFinish && PodProvider.instance.townUIPod.townUIState.value == TownUIState.MainMenu) {
                    PodProvider.instance.cameraControlPod.setInteractCamera(false)
                    if (this.townDayNightPod.getTownTimeState() == TownTimeState.Day) {
                        this.showNightNotice()
                    } else {
                        this.showDayNotice()
                    }
                    this.setActiveContainer(true)
                }
            }
        )
        this.setActiveContainer(false, false)
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true): void {
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()

                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.audioManager.playSFXSound('day_night_alert_sfx')

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
        const button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
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
            const icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }

    private createTweens(): void {
        let openTweens = AnimationController.instance.tweenOpenContainer(this.scene, this.noticeUIContainer, () => {})
        this.onOpenTween = openTweens.onOpenTween
        this.onOpenTweenChain = openTweens.onOpenTweenChain

        let closeTweens = AnimationController.instance.tweenCloseContainer(this.scene, this.noticeUIContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = closeTweens.onCloseTween
        this.onCloseTweenChain = closeTweens.onCloseTweenChain
    }
}
