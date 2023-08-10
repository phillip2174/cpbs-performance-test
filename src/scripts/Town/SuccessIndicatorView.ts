import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { timer } from 'rxjs'
import { SuccessIndicatorPod } from './SuccessIndicatorPod'
import { SuccessIndicatorState } from './Type/SuccessIndicatorState'
import { IngredientBean } from '../Guideline/IngredientBean'
import { PodProvider } from '../pod/PodProvider'

export class SuccessIndicatorView extends GameObjects.GameObject {
    public static readonly DRAW_SPAWN_TIME: number = 600
    public static readonly DRAW_SPAWN_MOVE_TIME: number = 3000
    public static readonly DRAW_PARTICLE_TIME: number = 3650
    public static readonly DRAW_PARTICLE_ROTATE_TIME: number = 1000
    public static readonly DRAW_CIRCLE_TIME: number = 300
    public static readonly DRAW_CHECKMARK_TIME: number = 400
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

    ingredientImage: GameObjects.Image
    checkmarkImage: GameObjects.Image
    particle01Circle: GameObjects.Image
    particle02Circle: GameObjects.Image

    graphicsCircle: GameObjects.Graphics
    maskGraphics: GameObjects.Graphics

    groupUI: GameObjects.Group

    private positionX: number
    private positionY: number
    private pod: SuccessIndicatorPod

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, bean: IngredientBean) {
        this.positionX = x
        this.positionY = y
        this.groupUI = this.scene.add.group()

        this.pod = new SuccessIndicatorPod(this.scene)
        this.pod.setBean(bean)

        this.pod.currentSuccessIndicatorState.subscribe((state) => {
            switch (state) {
                case SuccessIndicatorState.SpawnIngredient:
                    this.spawnIngredient()
                    break
                case SuccessIndicatorState.DrawCircle:
                    PodProvider.instance.guideLineUIManager.updateGuideLineCellUI(this.pod.ingredientBean)
                    this.drawCircle()
                    break
                case SuccessIndicatorState.CheckMark:
                    this.drawCheckMark()
                    break
                case SuccessIndicatorState.TweenGroupObject:
                    this.tweenGroupObject()
                    break
            }
        })
    }

    private spawnIngredient() {
        this.particle01Circle = this.scene.add.image(this.positionX, this.positionY, 'efx_02').setScale(0).setDepth(4)
        this.particle02Circle = this.scene.add.image(this.positionX, this.positionY, 'efx_01').setScale(0).setDepth(4)

        this.ingredientImage = this.scene.add
            .image(
                this.positionX,
                this.positionY,
                SuccessIndicatorView.INGREDIENT_IMAGE_KEY + this.pod.ingredientBean.ingredientID
            )
            .setScale(0.4)
            .setDepth(6)

        this.createMaskImage()
        this.tweenIngredient()
    }

    private tweenIngredient() {
        //Particle
        //Tween 2 Particle Rotate
        let loopParticle01 = this.scene.add.tween({
            targets: this.particle01Circle,
            ease: 'Linear',
            yoyo: false,
            repeat: -1,
            duration: SuccessIndicatorView.DRAW_PARTICLE_ROTATE_TIME,
            props: {
                rotation: {
                    from: this.particle01Circle.rotation,
                    to: -this.particle01Circle.rotation - 3.1415,
                },
            },
        })

        let loopParticle02 = this.scene.add.tween({
            targets: this.particle02Circle,
            ease: 'Linear',
            yoyo: false,
            repeat: -1,
            duration: SuccessIndicatorView.DRAW_PARTICLE_ROTATE_TIME,
            props: {
                rotation: {
                    from: this.particle01Circle.rotation,
                    to: -this.particle01Circle.rotation - 3.1415,
                },
            },
        })

        //Tween 2 Particle Scale and Move
        this.scene.add.tween({
            targets: this.particle01Circle,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_PARTICLE_TIME,
            props: {
                y: { from: this.particle01Circle.y, to: this.particle01Circle.y - 37 },
                scale: { from: this.particle01Circle.scale, to: 0.35 },
            },
            onComplete: (x) => {
                this.scene.add.tween({
                    targets: this.particle01Circle,
                    ease: 'Linear',
                    yoyo: false,
                    repeat: 0,
                    duration: 200,
                    scale: 0,
                    alpha: 0,
                })
            },
        })

        this.scene.add.tween({
            targets: this.particle02Circle,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_PARTICLE_TIME,
            props: {
                y: { from: this.particle02Circle.y, to: this.particle02Circle.y - 37 },
                scale: { from: this.particle02Circle.scale, to: 0.4 },
            },
            onComplete: (x) => {
                this.scene.add.tween({
                    targets: this.particle02Circle,
                    ease: 'Linear',
                    yoyo: false,
                    repeat: 0,
                    duration: 200,
                    scale: 0,
                    alpha: 0,
                })
            },
        })
        //ingredientImage
        //Tween ingredientImage Scale and Move with shake and move down with remove tween Particle
        this.scene.add.tween({
            targets: this.ingredientImage,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_SPAWN_TIME,
            props: {
                scale: { from: 0, to: 0.5 },
                alpha: { from: 0, to: 1 },
            },
            onComplete: () => {
                let shakeTween = this.scene.add.tween({
                    targets: this.ingredientImage,
                    ease: 'cubic.inout',
                    yoyo: true,
                    delay: 1000,
                    repeat: 20,
                    duration: 100,
                    props: {
                        x: { from: this.ingredientImage.x, to: this.positionX - 1 },
                    },
                })

                this.scene.add.tween({
                    targets: this.ingredientImage,
                    ease: 'cubic.inout',
                    yoyo: false,
                    repeat: 0,
                    duration: SuccessIndicatorView.DRAW_SPAWN_MOVE_TIME,
                    props: {
                        y: { from: this.ingredientImage.y, to: this.positionY - 37 },
                        scale: { from: this.ingredientImage.scale, to: 0.6 },
                    },
                    onComplete: () => {
                        shakeTween.remove()
                        this.pod.changeState(SuccessIndicatorState.DrawCircle)
                        this.scene.add.tween({
                            targets: this.ingredientImage,
                            ease: 'cubic.inout',
                            yoyo: false,
                            repeat: 0,
                            duration: SuccessIndicatorView.DRAW_SPAWN_TIME,
                            props: {
                                y: { from: this.ingredientImage.y, to: this.positionY + 80 },
                                scale: { from: this.ingredientImage.scale, to: 0 },
                            },
                            onComplete: () => {
                                loopParticle01.remove()
                                loopParticle02.remove()
                            },
                        })
                    },
                })
            },
        })
    }

    createMaskImage(): void {
        this.maskGraphics = this.scene.add.graphics()
        this.maskGraphics.setPosition(this.positionX - 50, this.positionY - 75)
        this.maskGraphics.fillStyle(0xffffff, 0)

        this.maskGraphics.beginPath()
        this.maskGraphics.fillRect(0, 0, 100, 110)

        const mask = this.maskGraphics.createGeometryMask()
        this.ingredientImage.setMask(mask)
    }

    private drawCircle() {
        this.graphicsCircle = this.scene.add.graphics()
        this.graphicsCircle.setPosition(this.positionX, this.positionY)

        this.graphicsCircle.lineStyle(4, 0xefaa16, 1)

        this.graphicsCircle.beginPath()

        this.graphicsCircle.arc(0, 0, 40, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(0), true).setDepth(5)

        this.graphicsCircle.strokePath()

        this.groupUI.add(this.graphicsCircle)
        this.tweenCircle()
    }

    private tweenCircle() {
        this.scene.tweens.addCounter({
            from: 0,
            to: 359,
            ease: 'cubic.inout',
            duration: SuccessIndicatorView.DRAW_CIRCLE_TIME,
            onUpdate: (tween) => {
                let t = tween.getValue()

                this.graphicsCircle.clear()
                this.graphicsCircle.lineStyle(4, 0xefaa16, 1)
                this.graphicsCircle.beginPath()
                this.graphicsCircle.arc(0, 0, 40, Phaser.Math.DegToRad(t), Phaser.Math.DegToRad(0), true).setDepth(5)
                if (t == 359) {
                    this.graphicsCircle.closePath()

                    this.pod.changeState(SuccessIndicatorState.CheckMark)
                }
                this.graphicsCircle.strokePath()
            },
        })
    }

    private drawCheckMark() {
        this.checkmarkImage = this.scene.add.image(this.positionX, this.positionY, 'check-mark').setScale(0).setDepth(6)

        this.groupUI.add(this.checkmarkImage)
        this.tweenCheckMark()
    }

    private tweenCheckMark() {
        this.scene.add.tween({
            targets: this.checkmarkImage,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_CHECKMARK_TIME,
            props: {
                scale: { from: 0, to: 0.05 },
            },
            onComplete: () => {
                this.pod.changeState(SuccessIndicatorState.TweenGroupObject)
            },
        })
    }

    private tweenGroupObject() {
        timer(SuccessIndicatorView.DRAW_CHECKMARK_TIME).subscribe((x) => {
            this.groupUI.children.iterate((child) => {
                this.scene.add.tween({
                    targets: child,
                    ease: 'cubic.inout',
                    yoyo: false,
                    repeat: 0,
                    duration: SuccessIndicatorView.DRAW_CHECKMARK_TIME,
                    alpha: 0,
                    scale: 0,
                })
            })
        })
    }

    public getPod(): SuccessIndicatorPod {
        return this.pod
    }
}
