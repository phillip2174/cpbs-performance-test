import { MinigameResultTicketUIView } from './MinigameResultTicketUIView'
import { GameObjects, Scene } from 'phaser'
import { Observable, Subscription, concat, concatAll, concatMap, delay, map, takeLast } from 'rxjs'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { MinigameResultBean } from './MinigameResultBean'
import { MinigameScenePod } from './MinigameScenePod'
import { MinigameState } from './MinigameState'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameResultBonusView } from './MinigameResultBonusView'
import { MinigameResultStarView } from './MinigameResultStarView'
import { APILoadingManager } from '../api-loading/APILoadingManager'
import { PodProvider } from '../pod/PodProvider'
import { AnimationController } from '../Town/AnimationController'
import { BoldText } from '../../BoldText/BoldText'
import { AudioManager } from '../Audio/AudioManager'
import { GameConfig } from '../GameConfig'
import { RunInBackground } from '../../util/RunInBackground'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { UIDepthConfig } from '../UIDepthConfig'

export class MinigameResultUIView extends GameObjects.GameObject {
    protected group: GameObjects.Container
    protected starGroup: GameObjects.Container
    protected scenePod: MinigameScenePod
    protected isDesktop: boolean
    protected dim: GameObjects.Rectangle
    protected bg: GameObjects.Image
    protected backButton: Button
    protected playAgainButton: Button
    protected resultImage: GameObjects.Image
    protected scoreImage: GameObjects.Image
    protected scoreHeaderText: GameObjects.Text
    protected scoreText: GameObjects.Text
    protected star1: MinigameResultStarView
    protected star2: MinigameResultStarView
    protected star3: MinigameResultStarView
    protected starEffect: GameObjects.Image
    protected failImage: GameObjects.Image
    protected bonus: MinigameResultBonusView
    protected result: MinigameResultBean
    protected ticketImage: GameObjects.Image
    protected ticketText: GameObjects.Text
    protected ticketAnimateImage: GameObjects.Image
    protected isPlayAnimationTicket: boolean
    protected textHeader: string
    protected minigameResultTicketUIView: MinigameResultTicketUIView
    protected isPlay: boolean
    protected isClickButton: boolean

    private audioManager: AudioManager

    private doOnOutOfTicket: Function

    tweenEffectLoop: Phaser.Tweens.Tween
    onOpenTween: Phaser.Tweens.Tween
    onOpenTweenChain: Phaser.Tweens.TweenChain
    onCloseTween: Phaser.Tweens.Tween
    onCloseScaleTween: Phaser.Tweens.TweenChain
    onOpenButtonGroup: Phaser.Tweens.Tween
    ticketSubscription: any
    sceneStateSubscription: any
    starEffectSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(textHeader: string, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.audioManager = PodProvider.instance.audioManager
        this.textHeader = textHeader
        this.isDesktop = DeviceChecker.instance.isDesktop()
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY + (this.isDesktop ? 0 : 0)
        this.group = this.scene.add.container()
        this.group.setPosition(centerX, centerY)

        this.setUpUI()
        this.group.setScale(this.isDesktop ? 1 : 0.9)
        this.group.setDepth(UIDepthConfig.MINI_GAME_RESULT)
        this.setSubscribe()
        this.createTween()

        this.group.setActive(false)
        this.group.setVisible(false)
    }

    protected setSubscribe() {
        this.sceneStateSubscription = this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.Completed && this.scenePod.isPlayOnline) this.showUI()
            else this.hideUI()
        })

        //this.scenePod.setTicket(0)
        this.ticketSubscription = this.scenePod.ticket.subscribe((ticket) => {
            this.minigameResultTicketUIView.setTextTicket(ticket, false)

            if (ticket != 0) {
                this.minigameResultTicketUIView.setPosition(0, this.isDesktop ? 317 : 305)
                this.playAgainButton.background
                    .setTexture('minigame-result-play-again')
                    .setSize(this.isDesktop ? 202 : 178, 48)
                this.minigameResultTicketUIView.setUITicket()
                this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 1 : 0.95)
            }
        })

        this.doOnOutOfTicket = () => {
            this.minigameResultTicketUIView.setPosition(0, 300)
            this.scenePod.ticket.next(0)
            this.playAgainButton.background
                .setTexture('minigame-result-free-play')
                .setSize(this.isDesktop ? 190 : 168, 48)
            this.minigameResultTicketUIView.setUICountdown()
            this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 1.02 : 0.97)
        }

        this.minigameResultTicketUIView.setCallBack(() => this.scenePod.getTicket(true).subscribe())

        this.on('destroy', () => {
            this.ticketSubscription?.unsubscribe()
            this.sceneStateSubscription?.unsubscribe()
            this.starEffectSubscription?.unsubscribe()
        })
    }

    protected createTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.group)

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this.group, () => {
            this.group.setActive(false)
            this.group.setVisible(false)
            this.starEffect.setVisible(false)
            this.tweenEffectLoop?.destroy()
        })

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseScaleTween = tweensClose.onCloseTweenChain
    }

    public showUI() {
        if (this.doOnOutOfTicket != undefined && this.scenePod.isDoOnOutOfTicket) {
            this.doOnOutOfTicket()
        }

        this.starEffect.setVisible(false)
        APILoadingManager.instance.showMiniLoading()
        this.scenePod
            .resultMinigame()
            .pipe(delay(GameConfig.IS_MOCK_API ? 1500 : 0))
            .subscribe((result) => {
                APILoadingManager.instance.hideMiniLoading()
                this.isClickButton = false
                this.group.setActive(true)
                this.group.setVisible(true)
                this.dim.setActive(true)
                this.dim.setVisible(true)
                this.result = result
                this.scoreText.setText(this.scenePod.textScore)
                this.showScore(result.star)
                this.onShowScore()
                this.onCloseTween?.pause()
                this.onCloseScaleTween?.pause()
                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()
                this.onOpenButtonGroup?.restart()
                this.scenePod.callBackOnOpenResult ? this.scenePod.callBackOnOpenResult() : () => {}
                RunInBackground.instance.setBackToNormal()
            })
    }

    protected onShowScore() {
        this.bonus.updateView(this.result)
    }

    public hideUI() {
        this.dim.setActive(false)
        this.dim.setVisible(false)

        this.onOpenTween?.pause()
        this.onOpenTweenChain?.pause()
        this.onOpenButtonGroup?.pause()

        this.onCloseTween?.restart()
        this.onCloseScaleTween?.restart()
    }

    protected setUpUI() {
        this.dim = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        )
        this.dim.setInteractive()
        //this.group.add(this.dim)

        this.bg = this.scene.add.image(0, this.isDesktop ? -240 : -230, 'minigame-result-bg').setOrigin(0.5, 0)
        this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 1 : 0.97)
        this.group.add(this.bg)

        this.starGroup = this.scene.add.container(0, this.isDesktop ? -175 : -170)
        this.group.add(this.starGroup)
        this.starEffect = this.scene.add.image(0, -55, 'minigame-result-star-effect')
        this.group.add(this.starEffect)
        this.starEffect.setVisible(false)
        this.star1 = new MinigameResultStarView(this.scene)
        this.star1.doInit(-110, 15)
        this.star1.setScale(0.9)
        this.star2 = new MinigameResultStarView(this.scene)
        this.star2.doInit(0, 0)
        this.star3 = new MinigameResultStarView(this.scene)
        this.star3.doInit(110, 15)
        this.star3.setScale(0.9)

        this.group.add([this.star1, this.star2, this.star3])
        this.starGroup.add([this.starEffect, this.star1, this.star2, this.star3])
        this.starGroup.setScale(this.isDesktop ? 1 : 0.9)

        this.resultImage = this.scene.add.image(0, this.isDesktop ? -125 : -120, 'minigame-result-complete')
        this.resultImage.setScale(this.isDesktop ? 1 : 1.1)
        this.group.add(this.resultImage)

        this.scoreHeaderText = new BoldText(this.scene, 0, this.isDesktop ? -60 : -60, this.textHeader, 28, '#2B2B2B')
        this.group.add(this.scoreHeaderText)
        this.scoreImage = this.scene.add.image(0, this.isDesktop ? -10 : -10, 'minigame-result-score')
        this.group.add(this.scoreImage)
        this.scoreText = new BoldText(this.scene, 0, this.isDesktop ? -14 : -14, '00:00s', 36, '#29CC6A')
        this.group.add(this.scoreText)

        this.failImage = this.scene.add.image(0, this.isDesktop ? 120 : 110, 'minigame-result-no-reward')
        this.failImage.setVisible(false)
        this.group.add(this.failImage)
        this.bonus = new MinigameResultBonusView(this.scene)
        this.bonus.doInit(0, this.isDesktop ? 115 : 115)
        this.group.add(this.bonus)

        this.backButton = new Button(
            this.scene,
            this.isDesktop ? -115 : -90,
            240,
            this.isDesktop ? 136 : 100,
            48,
            'minigame-result-back',
            0,
            ''
        )
        this.group.add(this.backButton)
        this.backButton.onClick(() => {
            this.OnClickBackButton()
        })

        this.playAgainButton = new Button(
            this.scene,
            this.isDesktop ? 75 : 57,
            240,
            this.isDesktop ? 202 : 177,
            48,
            'minigame-result-play-again',
            0,
            ''
        )
        this.playAgainButton.setTextPosition(20, 1)
        this.playAgainButton.setTextSize(24)
        this.group.add(this.playAgainButton)
        this.playAgainButton.onClick(() => {
            this.OnClickPlayAgainButton()
        })

        this.minigameResultTicketUIView = new MinigameResultTicketUIView(
            this.scene,
            0,
            this.isDesktop ? 305 : 305,
            this.scenePod
        )
        this.group.add(this.minigameResultTicketUIView)
    }

    protected OnClickBackButton() {
        if (this.isClickButton) return
        this.isClickButton = true
        this.scenePod.setSceneState(MinigameState.StartMenu)
    }

    protected OnClickPlayAgainButton() {
        if (this.isPlay || this.isClickButton) return
        this.isClickButton = true
        this.scenePod.isDoOnOutOfTicket = false
        APILoadingManager.instance.showMiniLoading()
        this.scenePod
            .getTicket(false)
            .pipe(
                delay(GameConfig.IS_MOCK_API ? 1500 : 0),
                concatMap(() => this.scenePod.startGame())
            )
            .subscribe((startResult) => {
                this.isPlayAnimationTicket = true
                APILoadingManager.instance.hideMiniLoading()
                this.minigameResultTicketUIView.setTextTicket(
                    startResult.ticketLeft,
                    this.scenePod.isPlayOnline,
                    () => {
                        this.scenePod.isDoOnOutOfTicket = startResult.ticketLeft == 0
                        console.log(this.scenePod.isDoOnOutOfTicket)
                        this.hideUI()
                        this.isPlayAnimationTicket = false
                        this.scenePod.setSceneState(MinigameState.BeforeStart)
                        RunInBackground.instance.startRunInBackground()
                    }
                )
            })
    }

    private showScore(score: number) {
        this.star1.hideStar()
        this.star2.hideStar()
        this.star3.hideStar()

        if (score == 0) {
            this.resultImage.setTexture('minigame-result-fail')
            this.failImage?.setVisible(true)
            this.bonus?.setVisible(false)
            this.starEffect.setVisible(false)
            this.scoreText.setStyle({
                fill: '#FC5555',
            })
            return
        }

        this.scoreText.setStyle({
            fill: '#29CC6A',
        })

        this.resultImage.setTexture('minigame-result-complete')

        this.failImage?.setVisible(false)
        this.bonus?.setVisible(true)

        let observableList: Observable<any>[] = []
        if (score >= 1) {
            observableList.push(this.star1.showStar(0))
        }
        if (score >= 2) {
            observableList.push(this.star2.showStar(score == 2 ? 1 : 2))
        }
        if (score >= 3) {
            observableList.push(this.star3.showStar(1))
        }
        this.starEffect.setScale(0)
        this.starEffect.setVisible(true)
        this.starEffectSubscription = concat(observableList)
            .pipe(delay(300), concatAll(), takeLast(1))
            .subscribe(() => {
                if (score >= 3) {
                    this.tweenEffectStar()
                }
            })
    }

    private tweenEffectStar() {
        this.scene.tweens.add({
            targets: this.starEffect,
            ease: `Sine.easeInOut`,
            duration: 200,
            props: {
                scale: { from: 0, to: 1.05 },
            },
            onStart: () => {
                this.starEffect.setVisible(true)
                this.audioManager.playSFXSound('star_glow_effect_sfx')
            },
            onComplete: () => {
                this.tweenEffectLoop = this.scene.tweens.add({
                    targets: this.starEffect,
                    ease: `Sine.easeInOut`,
                    duration: 800,
                    yoyo: true,
                    loop: -1,
                    props: {
                        scale: { from: 1.3, to: 0.8 },
                        alpha: { from: 1, to: 0.8 },
                    },
                })
            },
        })
    }
}
