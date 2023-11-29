import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'

export class AnimationStarView extends GameObjects.Container {
    private starEffectImage: GameObjects.Image

    private starEffectTweenChain: Tweens.TweenChain

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(
        x: number,
        y: number,
        minScale: number,
        maxScale: number,
        firstDuration: number,
        secondDuration: number,
        delay: number
    ): void {
        this.starEffectImage = this.scene.add.image(0, 0, 'star-effect').setOrigin(0.5).setScale(0)
        this.setPosition(x, y)
        this.createStarEffectTween(minScale, maxScale, firstDuration, secondDuration, delay)
        this.add([this.starEffectImage])
    }

    public playTween(): void {
        this.starEffectTweenChain?.pause()
        this.starEffectTweenChain?.restart()
    }

    private createStarEffectTween(
        minScale: number,
        maxScale: number,
        firstDuration: number,
        secondDuration: number,
        delay: number
    ): void {
        this.starEffectTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffectImage,
                    duration: firstDuration,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: maxScale,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: delay,
                },
                {
                    targets: this.starEffectImage,
                    duration: secondDuration,
                    props: {
                        scale: {
                            from: maxScale,
                            to: minScale,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })
    }
}
