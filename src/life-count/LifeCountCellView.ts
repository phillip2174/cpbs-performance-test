import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'

export class LifeCountCellView extends GameObjects.Container {
    public indexLifeCount: number
    private heartBG: GameObjects.Image
    private heartImage: GameObjects.Image

    private tweenDown: Tweens.Tween
    private tweenUp: Tweens.Tween
    private scaleSize: number
    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(indexLifeCount: number, scale: number = 1) {
        this.scaleSize = scale
        this.indexLifeCount = indexLifeCount

        this.createUI()
        this.createTween()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private createUI() {
        this.heartBG = this.scene.add.image(0, 0, 'heart-empty').setScale(this.scaleSize)
        this.heartImage = this.scene.add.image(0, 0, 'heart-full').setScale(this.scaleSize)

        this.add([this.heartBG, this.heartImage])
    }

    private createTween() {
        this.tweenDown = this.scene.add.tween({
            targets: this.heartImage,
            ease: 'Cubic.easeInOut',
            duration: 300,
            props: {
                scale: { from: this.heartImage.scale, to: 0 },
            },
            persist: true,
            paused: true,
        })

        this.tweenUp = this.scene.add.tween({
            targets: this.heartImage,
            ease: 'Cubic.easeInOut',
            duration: 300,
            props: {
                scale: { from: 0, to: this.heartImage.scale },
            },
            persist: true,
            paused: true,
        })
    }

    public tweenHeartDown() {
        this.tweenDown.restart()
    }

    public tweenHeartUp() {
        this.tweenUp.restart()
    }

    public resetHeart() {
        this.heartImage.setScale(this.scaleSize)
    }
}
