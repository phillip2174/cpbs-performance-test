import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { Subscription } from 'rxjs'
import { TutorialManager } from '../scripts/Manager/TutorialManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { TutorialStepState } from './TutorialStepState'
import { TutorialState } from './TutorialState'

export class TutorialHintView extends GameObjects.Container {
    private hintImage: GameObjects.Image

    private hintTween: Tweens.Tween
    private tweenOpen: Tweens.Tween
    private tweenClose: Tweens.Tween

    private hintSubscription: Subscription
    private tutorialManager: TutorialManager

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.tutorialManager = PodProvider.instance.tutorialManager

        this.createUI()
        this.createTween()

        this.setVisible(false)

        this.hintSubscription = this.tutorialManager.tutorialState.subscribe((state) => {
            switch (state) {
                case TutorialState.CloseUI:
                    if (this.tutorialManager.tutorialStepID.value == TutorialStepState.Welcome) {
                        this.setActiveHint(true)
                        this.setPosition(this.scene.cameras.main.centerX + 160, this.scene.cameras.main.centerY + 210)
                        this.playTweenLoopHint()
                    }
                    break
                default:
                    this.setActiveHint(false)
                    this.hintTween?.destroy()
                    break
            }
        })

        this.on('destroy', () => {
            this.hintSubscription?.unsubscribe()
        })
    }

    private setActiveHint(isActive: boolean) {
        if (isActive) {
            this.tweenClose?.pause()
            this.tweenOpen?.restart()
            this.setVisible(isActive)
        } else {
            this.tweenOpen?.pause()
            this.tweenClose?.restart()
        }
    }

    private createUI() {
        this.hintImage = this.scene.add.image(0, 0, 'tutorial-pin').setScale(1.5)

        this.add([this.hintImage])
    }

    private playTweenLoopHint() {
        this.hintTween = this.scene.add.tween({
            targets: this,
            ease: 'Linear',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            props: {
                y: { from: this.y, to: this.y - 50 },
            },
        })
    }

    private createTween() {
        this.tweenOpen = this.scene.add.tween({
            targets: this,
            ease: 'Linear',
            duration: 550,
            props: {
                scale: { from: 0, to: this.scale },
            },
            paused: true,
            persist: true,
        })

        this.tweenClose = this.scene.add.tween({
            targets: this,
            ease: 'Linear',
            duration: 200,
            props: {
                scale: { from: this.scale, to: 0 },
            },
            onComplete: () => {
                this.setVisible(false)
            },
            paused: true,
            persist: true,
        })

        this.on('destroy', () => {
            this.tweenOpen?.destroy()
            this.tweenClose?.destroy()
            this.hintTween?.destroy()
        })
    }
}
