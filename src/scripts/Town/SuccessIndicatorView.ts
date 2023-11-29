import { GameObjects, Scene } from 'phaser'
import { timer } from 'rxjs'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { SuccessIndicatorPod } from './Pod/SuccessIndicatorPod'
import { SuccessIndicatorState } from './Type/SuccessIndicatorState'
import { AudioManager } from '../Audio/AudioManager'

export class SuccessIndicatorView extends GameObjects.Container {
    public static readonly DRAW_SPAWN_TIME: number = 300
    public static readonly DRAW_SPAWN_MOVE_TIME: number = 800
    public static readonly DRAW_PARTICLE_TIME: number = 1150
    public static readonly DRAW_PARTICLE_ROTATE_TIME: number = 1000
    public static readonly DRAW_CIRCLE_TIME: number = 200
    public static readonly DRAW_CHECKMARK_TIME: number = 300

    public static readonly DRAW_CIRCLE_SIZE: number = 35
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

    ingredientImage: GameObjects.Image
    checkmarkImage: GameObjects.Image
    particle01Circle: GameObjects.Image
    particle02Circle: GameObjects.Image

    graphicsCircle: GameObjects.Graphics
    maskGraphics: GameObjects.Graphics

    private audioManager: AudioManager

    private pod: SuccessIndicatorPod

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(bean: IngredientBean) {
        this.pod = new SuccessIndicatorPod(this.scene)
        this.audioManager = PodProvider.instance.audioManager
        this.pod.setBean(bean)

        this.pod.currentSuccessIndicatorState.subscribe((state) => {
            switch (state) {
                case SuccessIndicatorState.SpawnIngredient:
                    this.spawnIngredient()
                    break
                case SuccessIndicatorState.CheckMark:
                    PodProvider.instance.guideLineUIManager.updateGuideLineCellUI(this.pod.ingredientBean)
                    this.drawCheckMark()
                    break
                case SuccessIndicatorState.TweenGroupObject:
                    this.tweenGroupObject()
                    break
            }
        })

        this.setDepth(100)
    }

    private spawnIngredient() {
        this.particle01Circle = this.scene.add.image(0, 0, 'efx_02').setScale(0)

        //this.particle02Circle = this.scene.add.image(0, 0, 'efx_01').setScale(0)

        this.ingredientImage = this.scene.add
            .image(0, 0, SuccessIndicatorView.INGREDIENT_IMAGE_KEY + this.pod.ingredientBean.id)
            .setDisplaySize(56, 56)
            .setSize(56, 56)

        this.add([this.particle01Circle, this.ingredientImage])
        //this.createMaskImage()
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

        // //Tween 2 Particle Scale and Move
        this.scene.add.tween({
            targets: this.particle01Circle,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_PARTICLE_TIME,
            props: {
                y: { from: this.particle01Circle.y, to: this.particle01Circle.y - 37 },
                scale: { from: this.particle01Circle.scale, to: 1.5 },
            },
            onStart: () => this.audioManager.playSFXSound('collected_ingredient_sfx'),
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

        // this.scene.add.tween({
        //     targets: this.particle02Circle,
        //     ease: 'cubic.inout',
        //     yoyo: false,
        //     repeat: 0,
        //     duration: SuccessIndicatorView.DRAW_PARTICLE_TIME,
        //     props: {
        //         y: { from: this.particle02Circle.y, to: this.particle02Circle.y - 37 },
        //         scale: { from: this.particle02Circle.scale, to: 1 },
        //     },
        //     onComplete: (x) => {
        //         this.scene.add.tween({
        //             targets: this.particle02Circle,
        //             ease: 'Linear',
        //             yoyo: false,
        //             repeat: 0,
        //             duration: 200,
        //             scale: 0,
        //             alpha: 0,
        //         })
        //     },
        // })
        //ingredientImage
        //Tween ingredientImage Scale and Move with shake and move down with remove tween Particle
        this.scene.add.tween({
            targets: this.ingredientImage,
            ease: 'cubic.inout',
            yoyo: false,
            repeat: 0,
            duration: SuccessIndicatorView.DRAW_SPAWN_TIME,
            props: {
                scale: { from: 0, to: this.ingredientImage.scale + 0.15 },
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
                        x: { from: this.ingredientImage.x, to: this.ingredientImage.x - 1 },
                    },
                })
                this.scene.add.tween({
                    targets: this.ingredientImage,
                    ease: 'cubic.inout',
                    yoyo: false,
                    repeat: 0,
                    duration: SuccessIndicatorView.DRAW_SPAWN_MOVE_TIME,
                    props: {
                        y: { from: this.ingredientImage.y, to: this.ingredientImage.y - 37 },
                        scale: { from: this.ingredientImage.scale + 0.15, to: this.ingredientImage.scale + 0.25 },
                    },
                    onComplete: () => {
                        shakeTween.stop()
                        this.pod.changeState(SuccessIndicatorState.CheckMark)
                        this.scene.add.tween({
                            targets: this.ingredientImage,
                            ease: 'cubic.inout',
                            yoyo: false,
                            repeat: 0,
                            duration: SuccessIndicatorView.DRAW_SPAWN_TIME,
                            props: {
                                y: { from: this.ingredientImage.y, to: this.ingredientImage.y + 80 },
                                scale: { from: this.ingredientImage.scale, to: 0 },
                            },
                            onComplete: () => {
                                loopParticle01.stop()
                                loopParticle02.stop()
                            },
                        })
                    },
                })
            },
        })
    }

    createMaskImage(): void {
        this.maskGraphics = this.scene.add.graphics()
        this.maskGraphics.setPosition(-50, -75)
        this.maskGraphics.fillStyle(0xffffff, 0)

        this.maskGraphics.beginPath()
        this.maskGraphics.fillRect(0, 0, 100, 110)

        const mask = this.maskGraphics.createGeometryMask()
        this.ingredientImage.setMask(mask)
    }

    private drawCircle() {
        this.graphicsCircle = this.scene.add.graphics()
        this.graphicsCircle.setPosition(0, 0)

        this.graphicsCircle.lineStyle(4, 0xefaa16, 1)

        this.graphicsCircle.beginPath()

        this.graphicsCircle.arc(
            0,
            0,
            SuccessIndicatorView.DRAW_CIRCLE_SIZE,
            Phaser.Math.DegToRad(0),
            Phaser.Math.DegToRad(0),
            true
        )

        this.graphicsCircle.strokePath()

        this.add([this.graphicsCircle])
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
                this.graphicsCircle.arc(
                    0,
                    0,
                    SuccessIndicatorView.DRAW_CIRCLE_SIZE,
                    Phaser.Math.DegToRad(t),
                    Phaser.Math.DegToRad(0),
                    true
                )
                if (t == 359) {
                    this.graphicsCircle.closePath()

                    this.pod.changeState(SuccessIndicatorState.CheckMark)
                }
                this.graphicsCircle.strokePath()
            },
        })
    }

    private drawCheckMark() {
        this.checkmarkImage = this.scene.add.image(0, 0, 'check-mark')

        this.add([this.checkmarkImage])

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
                scale: { from: 0, to: 1.5 },
            },
            onComplete: () => {
                this.pod.changeState(SuccessIndicatorState.TweenGroupObject)
            },
        })
    }

    private tweenGroupObject() {
        timer(SuccessIndicatorView.DRAW_CHECKMARK_TIME).subscribe((x) => {
            this.scene.add.tween({
                targets: this,
                ease: 'cubic.inout',
                yoyo: false,
                repeat: 0,
                duration: SuccessIndicatorView.DRAW_CHECKMARK_TIME,
                alpha: 0,
                scale: 0,
            })
        })
    }

    public getPod(): SuccessIndicatorPod {
        return this.pod
    }
}
