import { GameObjects, Scene, Tweens } from 'phaser'
import { Observable, Subscription, of, tap, timer } from 'rxjs'
import { ObjectPlacementDebugger } from '../plugins/ObjectPlacementDebugger'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { IngredientObjectView } from './IngredientObjectView'

export class TrainObjectWithIngredientView extends GameObjects.Container {
    private trainObjectSpine: SpineGameObject
    private ingredientObjectView: IngredientObjectView

    private startPositionX: number
    private startPositionY: number

    private tweenMoveIn: Tweens.Tween
    private tweenMoveOut: Tweens.Tween
    private tweenMoveInOut: Tweens.Tween

    private timerSubscription: Subscription
    private timerTweenSubscription: Subscription

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(ingredientObjectView: IngredientObjectView) {
        this.setDepth(2)
        let test = new ObjectPlacementDebugger(this.scene)

        this.setPosition(this.x + 1442, this.y + -1240)
        //this.setPosition(this.x + -628, this.y + -70)
        //this.setPosition(this.x + -2458, this.y + 960)

        this.startPositionX = this.x
        this.startPositionY = this.y

        this.ingredientObjectView = ingredientObjectView
        this.ingredientObjectView.setPositionContainer(true, -200, -90)

        let spineConfig = {
            x: 0,
            y: 0,
            key: 'train-body',
            path: `assets/spines/`,
            startAnimation: 'close',
            isLooping: true,
        }

        this.trainObjectSpine = this.scene.add.spine(
            spineConfig.x,
            spineConfig.y,
            spineConfig.key,
            spineConfig.startAnimation,
            spineConfig.isLooping
        )

        let fadeInOutFx = this.postFX.addReveal(0.5, 0, 0)

        this.tweenTrainAnimation(fadeInOutFx)
        this.add([this.trainObjectSpine as any, this.ingredientObjectView])
    }

    private tweenTrainAnimation(fadeInOutFx: Phaser.FX.Wipe) {
        let isFade: boolean
        this.timerSubscription = timer(0, 20000).subscribe((_) => {
            this.tweenMoveIn?.stop()
            this.tweenMoveOut?.stop()

            this.tweenMoveIn = this.scene.add.tween({
                targets: this,
                ease: 'Cubic.easeInOut',
                duration: 7000,
                props: {
                    x: { from: this.x, to: this.x - 2070 },
                    y: { from: this.y, to: this.y + 1170 },
                },
                onUpdate: (tween) => {
                    if (tween.progress >= 0.35 && !isFade) {
                        isFade = true
                        this.tweenMoveInOut = this.scene.tweens.add({
                            targets: fadeInOutFx,
                            progress: 1,
                            duration: 2000,
                            onComplete: () => {
                                fadeInOutFx.direction = 1
                            },
                        })
                    }
                },
                onComplete: () => {
                    isFade = false
                    this.trainObjectSpine.play('interact')
                    this.timerTweenSubscription = timer(3000).subscribe((_) => {
                        this.trainObjectSpine.play('interact2')
                    })
                    this.tweenMoveOut = this.scene.add.tween({
                        targets: this,
                        ease: 'Cubic.easeInOut',
                        delay: 5000,
                        duration: 7000,
                        props: {
                            x: { from: this.x, to: this.x - 1830 },
                            y: { from: this.y, to: this.y + 1030 },
                        },
                        onUpdate: (tween) => {
                            if (tween.progress >= 0.6 && !isFade) {
                                isFade = true
                                this.tweenMoveInOut = this.scene.tweens.add({
                                    targets: fadeInOutFx,
                                    progress: 0,
                                    duration: 2500,
                                    onComplete: () => {
                                        fadeInOutFx.direction = 0
                                    },
                                })
                            }
                        },
                        onComplete: () => {
                            isFade = false
                            this.setPosition(this.startPositionX, this.startPositionY)
                        },
                    })
                },
            })
        })
    }

    destroy(fromScene?: boolean): void {
        this.timerSubscription?.unsubscribe()
        this.timerTweenSubscription?.unsubscribe()
        this.tweenMoveIn?.destroy()
        this.tweenMoveInOut?.destroy()
        this.tweenMoveOut?.destroy()
        this.trainObjectSpine?.destroy()
        super.destroy(fromScene)
    }
}
