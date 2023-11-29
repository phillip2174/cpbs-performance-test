import { GameObjects, Scene } from 'phaser'
import { Observable, concat, concatAll, concatMap, delay, map, takeLast } from 'rxjs'
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
    protected isPlay: boolean
    protected textHeader: string

    private audioManager: AudioManager

    onOpenTween: Phaser.Tweens.Tween
    onOpenTweenChain: Phaser.Tweens.TweenChain
    onCloseTween: Phaser.Tweens.Tween
    onCloseScaleTween: Phaser.Tweens.TweenChain
    onOpenButtonGroup: Phaser.Tweens.Tween

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(textHeader: string, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.audioManager = PodProvider.instance.audioManager
        this.textHeader = textHeader
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY + (this.isDesktop ? 0 : 0)
        this.group = this.scene.add.container()
        this.group.setPosition(centerX, centerY)

        this.setUpUI()
        this.group.setScale(this.isDesktop ? 1 : 0.9)
        this.group.setDepth(2)
        this.setSubscribe()
        this.createTween()

        this.group.setActive(false)
        this.group.setVisible(false)
    }

    protected setSubscribe() {
        this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.Completed && this.scenePod.isPlayOnline) this.showUI()
            else this.hideUI()
        })
    }

    protected createTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.group)

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this.group, () => {
            this.group.setActive(false)
            this.group.setVisible(false)
        })

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseScaleTween = tweensClose.onCloseTweenChain
    }

    public showUI() {
        APILoadingManager.instance.showMiniLoading()
        this.scenePod
            .resultMinigame()
            .pipe(delay(2000))
            .subscribe((result) => {
                APILoadingManager.instance.hideMiniLoading()
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
            })
    }

    protected onShowScore() {
        this.bonus.updateView(this.result)
        this.setTextTicket(this.scenePod.ticket, false)
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

        this.bg = this.scene.add.image(0, 90, 'minigame-result-bg')
        this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 1 : 0.95)
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
            this.isDesktop ? -120 : -100,
            this.isDesktop ? 240 : 240,
            this.isDesktop ? 136 : 101,
            48,
            'minigame-result-back',
            0,
            ''
        )
        this.backButton.setScale(this.isDesktop ? 1 : 1.1)
        this.group.add(this.backButton)
        this.backButton.onClick(() => {
            this.OnClickBackButton()
        })

        this.playAgainButton = new Button(
            this.scene,
            this.isDesktop ? 80 : 60,
            this.isDesktop ? 240 : 240,
            this.isDesktop ? 216 : 178,
            48,
            'minigame-result-play-again',
            0,
            ''
        )
        this.playAgainButton.setScale(this.isDesktop ? 1 : 1.1)
        this.playAgainButton.setTextPosition(20, 1)
        this.playAgainButton.setTextSize(24)
        this.group.add(this.playAgainButton)
        this.playAgainButton.onClick(() => {
            this.OnClickPlayAgainButton()
        })

        this.ticketImage = this.scene.add.image(-60, 310, 'ticket')
        this.ticketImage.setScale(this.isDesktop ? 1 : 0.8)
        this.ticketAnimateImage = this.scene.add.image(-60, 310, 'ticket-use-effect').setScale(1.2)
        this.group.add([this.ticketImage, this.ticketAnimateImage])
        this.ticketAnimateImage.setVisible(false)
        this.ticketText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('TICKET : 2')
            .setOrigin(0.5)
            .setPosition(35, 305)
            .setStyle({
                fill: '#FFFFFF',
                fontSize: 24,
            })
            .setStroke('#EE843C', 5)
        this.group.add(this.ticketText)
    }

    protected OnClickBackButton() {
        this.scenePod.setSceneState(MinigameState.StartMenu)
    }

    protected OnClickPlayAgainButton() {
        if (this.isPlay) return

        this.scenePod
            .getTicket(false)
            .pipe(concatMap(() => this.scenePod.startGame()))
            .subscribe((startResult) => {
                this.setTextTicket(startResult.ticketLeft, this.scenePod.isPlayOnline, () => {
                    this.hideUI()
                    this.scenePod.setSceneState(MinigameState.BeforeStart)
                })
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
        concat(observableList)
            .pipe(delay(300), concatAll(), takeLast(1))
            .subscribe(() => {
                if (score >= 3) {
                    this.tweenEffectStar()
                }
            })
    }

    protected setTextTicket(ticket: number, isAnimate: boolean, callback: Function = () => {}) {
        this.ticketText.setText(`TICKET : ${ticket}`)
        if (!isAnimate) {
            callback()
        } else {
            this.ticketAnimateImage.setVisible(true)
            this.ticketAnimateImage.setAlpha(1)
            this.isPlay = true
            this.scene.tweens
                .add({
                    targets: this.ticketAnimateImage,
                    duration: 500,
                    props: {
                        scaleX: { from: 0.6, to: 1.2, duration: 300, ease: `Quad.easeOut` },
                        scaleY: { from: 0.6, to: 1.2, duration: 300, ease: `Cubic.easeOut` },
                        y: { from: 310, to: 110, ease: `Cubic.easeOut` },
                        alpha: { from: 1, to: 0.7 },
                    },
                    onStart: () => {
                        this.audioManager.playSFXSound('ticket_tearing')
                    },
                    onComplete: () => {
                        this.scene.tweens
                            .add({
                                targets: this.ticketAnimateImage,
                                ease: `Back.easeOut`,
                                duration: 300,
                                alpha: 0,
                                onComplete: () => {
                                    this.ticketAnimateImage.setVisible(false)
                                    this.isPlay = false
                                    callback()
                                },
                            })
                            .play()
                    },
                })
                .play()
        }
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
                this.scene.tweens.add({
                    targets: this.starEffect,
                    ease: `Sine.easeInOut`,
                    duration: 1500,
                    yoyo: true,
                    loop: -1,
                    props: {
                        scale: { from: 1.05, to: 0.8 },
                        alpha: { from: 1, to: 0.5 },
                    },
                }).play
            },
        })
    }
}
