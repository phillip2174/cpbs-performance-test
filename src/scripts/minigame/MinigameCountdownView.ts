import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, interval, timer } from 'rxjs'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameState } from './MinigameState'
import { BoldText } from '../../BoldText/BoldText'
import { AudioManager } from '../Audio/AudioManager'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class MinigameCountdownView extends GameObjects.Container {
    private startTextImage: GameObjects.Image
    private countdownText: GameObjects.Text
    private countdownCount: number = 3

    private isDesktop: boolean

    private countDownTextTween: Tweens.Tween
    private startTextImageTween: Tweens.TweenChain

    private audioManager: AudioManager

    private showMenuDelay: Subscription
    private countdownIntervalSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.audioManager = PodProvider.instance.audioManager

        this.startTextImage = this.scene.add
            .image(0, 0, '')
            .setOrigin(0.5)
            .setScale(this.isDesktop ? 1 : 0.55)
            .setVisible(false)

        this.countdownText = new BoldText(
            this.scene,
            -2,
            this.isDesktop ? -15 : -7,
            '',
            this.isDesktop ? 136 : 63,
            '#CE0E2D'
        ).setStroke('#FFFFFF', 10)

        this.setPosition(x, y)
        this.createCountdownTweens()
        this.add([this.countdownText, this.startTextImage])

        this.on('destroy', () => {
            this.showMenuDelay?.unsubscribe()
            this.countdownIntervalSubscription?.unsubscribe()
        })
    }

    public startCountdown(showMenuCallback: Function): void {
        let isStartSoundEffect: boolean = false

        this.countdownIntervalSubscription = interval(1000).subscribe((count) => {
            if (!isStartSoundEffect) {
                this.audioManager.playSFXSound('minigame_countdown_sfx')
                isStartSoundEffect = true
            }

            if (count >= 3) {
                this.countdownIntervalSubscription?.unsubscribe()
                this.countdownText.setVisible(false)
                this.startTextImage.setTexture('minigame-countdown-start').setVisible(true)
                this.showMenuDelay = timer(300).subscribe((_) => showMenuCallback())
                this.startTextImageTween?.restart()
            } else {
                if (!this.countdownText.visible) this.countdownText.setVisible(true)
                switch (count) {
                    case 1:
                        this.countdownText.setFill('#EE843C')
                        break
                    case 2:
                        this.countdownText.setFill('#FFBF3C')
                        break
                }
                this.countdownText.setText((this.countdownCount - count).toString())
                this.countDownTextTween?.restart()
            }
        })
    }

    private createCountdownTweens(): void {
        this.countDownTextTween = this.scene.add.tween({
            targets: this.countdownText,
            duration: 500,
            ease: 'cubic.inout',
            alpha: { from: 0, to: this.countdownText.alpha },
            yoyo: true,
            persist: true,
            paused: true,
        })

        this.startTextImageTween = this.scene.tweens.chain({
            targets: this.startTextImage,
            tweens: [
                {
                    duration: 500,
                    ease: 'cubic.inout',
                    alpha: { from: 0, to: this.startTextImage.alpha },
                },
                {
                    delay: 450,
                    duration: 500,
                    ease: 'cubic.inout',
                    alpha: { from: this.startTextImage.alpha, to: 0 },
                    onComplete: () => {
                        PodProvider.instance.minigameScenePod.setSceneState(MinigameState.FinishCountdown)
                    },
                },
            ],
            persist: true,
            paused: true,
        })
    }
}
