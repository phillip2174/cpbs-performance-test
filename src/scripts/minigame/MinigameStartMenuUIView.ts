import { Pod } from '../plugins/objects/Pod'
import { GameObjects, Scene } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { Button } from '../button/Button'
import { MinigameScenePod } from './MinigameScenePod'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { CPPointUIButtonView } from '../Town/CPPointUIButtonView'
import { MinigameState } from './MinigameState'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameTicketTimerView } from './MinigameTicketTimerView'
import { APILoadingManager } from '../api-loading/APILoadingManager'
import { PodProvider } from '../pod/PodProvider'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { AudioManager } from '../Audio/AudioManager'
import { FlatMessageManager } from '../flat-message/FlatMessageManager'
import { RunInBackground } from '../../util/RunInBackground'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { UIDepthConfig } from '../UIDepthConfig'
import { ErrorAlertFactory } from '../../error-factory/ErrorAlertFactory'

export class MinigameStartMenuUIView extends GameObjects.Container {
    private startButton: Button
    private subBg: GameObjects.Image
    private logo: GameObjects.Image
    private scenePod: MinigameScenePod
    private isDesktop: boolean
    private minigameId: number
    ticketImage: GameObjects.Image
    ticketText: GameObjects.Text
    ticketAnimateImage: GameObjects.Image
    isPlay: boolean
    freeButton: Button
    countdownTicket: MinigameTicketTimerView

    private audioManager: AudioManager

    private sceneStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY)
        GameObjectConstructor(scene, this)

        APILoadingManager.instance.doInit(this.scene, 1)
        APILoadingManager.instance.showSceneLoading(PodProvider.instance.splashPod.launchScene)

        FlatMessageManager.instance.doInit(this.scene)
        ErrorAlertFactory.instance.init()

        timer(400).subscribe((_) => {
            ResourceManager.instance
                .loadPackJson('minigame-cp-audio-load', `assets/town/json/minigame-cp-audio-load.json`)
                .subscribe((onFinished) => {
                    APILoadingManager.instance.hideSceneLoading()

                    this.audioManager = PodProvider.instance.audioManager
                    this.playBGM(this.minigameId)
                })
        })

        this.setDepth(UIDepthConfig.MINI_GAME_START_MENU)
    }

    public doInit(minigameId: number, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.minigameId = minigameId
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.setUpImage()
        this.setUpButton()

        if (!this.isDesktop) {
            this.setScale(0.73)
        }

        this.sceneStateSubscription = this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.StartMenu) this.showUI()
            else this.hideUI()
        })

        this.on('destroy', () => {
            this.sceneStateSubscription?.unsubscribe()
        })
    }

    public showUI() {
        this.setActive(true)
        this.setVisible(true)
        this.isPlay = false
        this.scenePod.getTicket().subscribe((ticket) => {
            var isNoTicket: boolean = ticket <= 0
            this.startButton.setVisible(!isNoTicket)
            this.ticketImage.setVisible(!isNoTicket)
            this.ticketText.setVisible(!isNoTicket)

            this.freeButton.setVisible(isNoTicket)
            this.countdownTicket.setVisible(isNoTicket)
            if (isNoTicket) {
                this.countdownTicket.startCountDown()
            } else {
                this.countdownTicket.stopCountDown()
            }
            this.setTextTicket(ticket, false)
        })
    }

    public hideUI() {
        this.setActive(false)
        this.setVisible(false)
        this.countdownTicket.stopCountDown()
    }

    private setUpImage() {
        this.subBg = this.scene.add.image(0, this.isDesktop ? 40 : 70, `minigame-${this.minigameId}-sub-bg`)
        this.add(this.subBg)
        this.logo = this.scene.add.image(0, this.isDesktop ? -35 : -5, `minigame-${this.minigameId}-logo`)
        this.add(this.logo)
    }

    private setUpButton() {
        this.startButton = new Button(this.scene, 0, this.isDesktop ? 160 : 190, 1, 64, '', 1000, 'PLAY')

        this.startButton.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'minigame-start-button',
            leftWidth: 29,
            rightWidth: 27,
            topHeight: 30,
            bottomHeight: 30,
            safeAreaOffset: 0,
        })

        this.startButton.setTextStyle({
            fontFamily: 'DB_HeaventRounded',
            fill: 'white',
            fontSize: 36,
        })

        this.startButton.setButtonSize(this.startButton.label.width + 100, this.startButton.displayHeight)
        this.startButton.setTextPosition(-this.startButton.width / 2 + this.startButton.label.width / 2 + 35, 0)
        let icon = this.scene.add.image(this.startButton.label.width / 2 + 10, 0, 'minigame-button-icon-play')

        this.startButton.add(icon)
        this.add(this.startButton)

        this.freeButton = new Button(this.scene, 0, this.isDesktop ? 180 : 190, 1, 299, '', 1000, 'FREE PLAY')
        this.freeButton.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'minigame-start-button',
            leftWidth: 29,
            rightWidth: 27,
            topHeight: 30,
            bottomHeight: 30,
            safeAreaOffset: 0,
        })

        this.freeButton.setTextStyle({
            fontFamily: 'DB_HeaventRounded_Bd',
            fill: 'white',
            fontSize: 36,
        })
        this.freeButton
        this.freeButton.setButtonSize(237, this.startButton.displayHeight)
        this.freeButton.setTextPosition(-this.startButton.width / 2 + this.startButton.label.width / 2 + 25, 0)
        let icon2 = this.scene.add.image(this.startButton.label.width / 2 + 40, 0, 'minigame-button-icon-play')
        this.freeButton.add(icon2)
        this.add(this.freeButton)

        this.startButton.onClick(() => {
            this.onClickStart()
        })
        this.freeButton.onClick(() => {
            this.onClickStart()
        })

        this.ticketImage = this.scene.add
            .image(0, this.isDesktop ? 260 : 290, 'ticket')
            .setScale(this.isDesktop ? 1.2 : 1.5)
        this.ticketAnimateImage = this.scene.add.image(0, this.isDesktop ? 260 : 300, 'ticket-use-effect').setScale(1.2)
        this.add([this.ticketImage, this.ticketAnimateImage])
        this.ticketAnimateImage.setVisible(false)
        this.ticketText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('TICKET : 3')
            .setOrigin(0.5)
            .setPosition(0, this.isDesktop ? 300 : 340)
            .setStyle({
                fill: '#FFFFFF',
                fontSize: this.isDesktop ? 24 : 28,
            })
            .setStroke('#EE843C', 5)
        this.add(this.ticketText)

        this.countdownTicket = new MinigameTicketTimerView(this.scene)
        this.countdownTicket.doInit(0, this.isDesktop ? 290 : 310)
        this.countdownTicket.setVisible(false)

        this.countdownTicket.setCallBack(() => {
            this.showUI()
        })
        this.add(this.countdownTicket)
    }

    private onClickStart() {
        if (this.isPlay) return
        var isAnimate = this.scenePod.ticket.value > 0
        APILoadingManager.instance.showMiniLoading()
        this.scenePod.startGame().subscribe((startResult) => {
            this.setTextTicket(startResult.ticketLeft, isAnimate, () => {
                this.scenePod.isDoOnOutOfTicket = startResult.ticketLeft == 0
                APILoadingManager.instance.hideMiniLoading()
                this.hideUI()
                RunInBackground.instance.startRunInBackground()
                this.scenePod.setSceneState(MinigameState.BeforeStart)
            })
        })
    }

    private playBGM(minigameID: number) {
        switch(minigameID) {
            case 1:
                this.audioManager.playBGMSound('minigamer_1_cp_puzzle_bgm', true)
                break;
            case 2:
                this.audioManager.playBGMSound('minigamer_2_cp_order_bgm', true)
                break;
            default:
                this.audioManager.playBGMSound('minigamer_1_cp_puzzle_bgm', true)
                break;
        }
    }

    public setTextTicket(ticket: number, isAnimate: boolean, callback: Function = () => {}) {
        this.ticketText.setText(`TICKET : ${ticket}`)
        if (!isAnimate) {
            callback()
        } else {
            this.ticketAnimateImage.setVisible(true)
            this.ticketAnimateImage.setAlpha(1)
            this.isPlay = true
            this.scene.tweens.add({
                targets: this.ticketAnimateImage,
                duration: 500,
                props: {
                    scaleX: { from: 0.6, to: 1.2, duration: 300, ease: `Quad.easeOut` },
                    scaleY: { from: 0.6, to: 1.2, duration: 300, ease: `Cubic.easeOut` },
                    y: { from: 280, to: 80, ease: `Cubic.easeOut` },
                    alpha: { from: 1, to: 0.7 },
                },
                onStart: () => {
                    this.audioManager.playSFXSound('ticket_tearing')
                },
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: this.ticketAnimateImage,
                        ease: `Back.easeOut`,
                        duration: 300,
                        alpha: 0,
                        onComplete: () => {
                            this.ticketAnimateImage.setVisible(false)
                            callback()
                        },
                    })
                },
            })
        }
    }
}
