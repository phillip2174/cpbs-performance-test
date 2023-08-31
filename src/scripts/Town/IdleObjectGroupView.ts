import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'

export class IdleObjectGroupView extends GameObjects.GameObject {
    private cloudBigImage: GameObjects.Image
    private cloudSmallImage: GameObjects.Image
    private cloudNarutoImage: GameObjects.Image

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        console.log('Create idle Object')
        this.createIdleObject()
    }

    public createIdleObject() {
        this.cloudBigImage = this.scene.add
            .image(this.scene.cameras.main.centerX + 800, this.scene.cameras.main.centerY + -480, 'cloud-01')
            .setDepth(99)

        this.cloudSmallImage = this.scene.add
            .image(this.scene.cameras.main.centerX + 460, this.scene.cameras.main.centerY + -630, 'cloud-02')
            .setDepth(99)

        this.cloudNarutoImage = this.scene.add
            .image(this.scene.cameras.main.centerX + -900, this.scene.cameras.main.centerY + -450, 'cloud-naruto')
            .setDepth(99)

        this.scene.add.tween({
            targets: this.cloudBigImage,
            ease: 'Cubic.easeInOut',
            yoyo: true,
            loop: -1,
            delay: this.randomIntFromInterval(1000, 3000),
            repeatDelay: this.randomIntFromInterval(600, 1500),
            duration: 2000,
            props: {
                x: { from: this.cloudBigImage.x, to: this.cloudBigImage.x - 15 },
            },
            onComplete: (x) => {},
        })

        this.scene.add.tween({
            targets: this.cloudSmallImage,
            ease: 'Cubic.easeInOut',
            yoyo: true,
            loop: -1,
            delay: this.randomIntFromInterval(1000, 3000),
            repeatDelay: this.randomIntFromInterval(600, 1500),
            duration: 2000,
            props: {
                x: { from: this.cloudSmallImage.x, to: this.cloudSmallImage.x - 15 },
            },
            onComplete: (x) => {},
        })

        this.scene.add.tween({
            targets: this.cloudNarutoImage,
            ease: 'Cubic.easeInOut',
            yoyo: true,
            loop: -1,
            delay: this.randomIntFromInterval(1000, 3000),
            repeatDelay: this.randomIntFromInterval(600, 1500),
            duration: 2000,
            props: {
                x: { from: this.cloudNarutoImage.x, to: this.cloudNarutoImage.x - 15 },
            },
            onComplete: (x) => {},
        })
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
