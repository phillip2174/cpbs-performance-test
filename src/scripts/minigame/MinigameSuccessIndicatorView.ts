import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class MinigameSuccessIndicatorView extends GameObjects.Container {
    public static readonly SIZE_DESKTOP: number = 132
    public static readonly SIZE_MOBILE: number = 102

    private successIndicator: GameObjects.Image

    private isDesktop: boolean
    private isSuccess: boolean = false

    private indicatorTween: Tweens.TweenChain

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.setupSuccessIndicator()
        this.createIndicatorTween()
    }

    public playIndicatorTween(isCorrect: boolean): void {
        this.successIndicator.setVisible(true)
        this.successIndicator.setTexture(isCorrect ? 'minigame-success-indicator' : 'minigame-fail-indicator')
        this.indicatorTween?.restart()
    }

    private setupSuccessIndicator(): void {
        this.successIndicator = this.scene.add.image(0, 0, 'minigame-success-indicator')
        if (this.isDesktop) {
            this.successIndicator
                .setSize(MinigameSuccessIndicatorView.SIZE_DESKTOP, MinigameSuccessIndicatorView.SIZE_DESKTOP)
                .setDisplaySize(MinigameSuccessIndicatorView.SIZE_DESKTOP, MinigameSuccessIndicatorView.SIZE_DESKTOP)
        } else {
            this.successIndicator
                .setSize(MinigameSuccessIndicatorView.SIZE_MOBILE, MinigameSuccessIndicatorView.SIZE_MOBILE)
                .setDisplaySize(MinigameSuccessIndicatorView.SIZE_MOBILE, MinigameSuccessIndicatorView.SIZE_MOBILE)
        }
        this.successIndicator.setVisible(false)
        this.add([this.successIndicator])
    }

    private createIndicatorTween(): void {
        this.indicatorTween = this.scene.tweens.chain({
            targets: this.successIndicator,
            tweens: [
                {
                    duration: 200,
                    ease: 'cubic.inout',
                    props: {
                        scale: {
                            from: 0,
                            to: this.successIndicator.scale,
                        },
                        alpha: {
                            from: 0,
                            to: this.successIndicator.alpha,
                        },
                    },
                },
                {
                    duration: 500,
                    ease: 'cubic.inout',
                    props: {
                        alpha: {
                            from: this.successIndicator.alpha,
                            to: 0,
                        },
                    },
                    onComplete: () => {
                        this.successIndicator.setVisible(false)
                    },
                },
            ],
            persist: true,
            paused: true,
        })
    }
}
