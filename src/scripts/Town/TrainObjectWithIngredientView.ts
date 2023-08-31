import { GameObjects, Scene, Tweens } from 'phaser'
import { Observable, of, tap, timer } from 'rxjs'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { IngredientObjectView } from './IngredientObjectView'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'

export class TrainObjectWithIngredientView extends GameObjects.Container {
    private trainObjectSpine: SpineGameObject
    private trainBodyObjectImage: GameObjects.Image
    private ingredientObjectView: IngredientObjectView

    private startPositionX: number
    private startPositionY: number

    private tweenMoveIn: Tweens.Tween
    private tweenMoveOut: Tweens.Tween

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(ingredientObjectView: IngredientObjectView): Observable<any> {
        this.setDepth(2)
        this.setPosition(this.x + 1400, this.y + -1500)
        //this.setPosition(this.x + -670, this.y + -330)
        // this.setPosition(this.x + -2500, this.y + 700)

        this.startPositionX = this.x
        this.startPositionY = this.y

        this.ingredientObjectView = ingredientObjectView
        this.ingredientObjectView.setPositionContainer(true, -220, 60)

        this.trainBodyObjectImage = this.scene.add.image(0, 0, 'train-body')

        this.add([this.trainBodyObjectImage, this.ingredientObjectView])

        let fadeInOutFx = this.postFX.addReveal(0.5, 0, 0)

        let isFade: boolean
        timer(0, 20000).subscribe((_) => {
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
                        this.scene.tweens.add({
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
                    this.tweenMoveOut = this.scene.add.tween({
                        targets: this,
                        ease: 'Cubic.easeInOut',
                        delay: 3000,
                        duration: 7000,
                        props: {
                            x: { from: this.x, to: this.x - 1830 },
                            y: { from: this.y, to: this.y + 1030 },
                        },
                        onUpdate: (tween) => {
                            if (tween.progress >= 0.55 && !isFade) {
                                isFade = true
                                this.scene.tweens.add({
                                    targets: fadeInOutFx,
                                    progress: 0,
                                    duration: 2000,
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

        return of(0) //TODO : CHANGE TO RETURN WHEN SPINE LOAD
    }
}
