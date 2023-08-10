import { Scene } from 'phaser'
import { IDestroy } from './IDestroy'

export class Container
    extends Phaser.GameObjects.Container
    implements IDestroy {
    constructor(
        scene: Scene,
        x: number,
        y: number,
        children: Phaser.GameObjects.GameObject[],
    ) {
        super(scene, x, y, children)
        this.scene = scene
        scene.add.existing(this)

        this.scene.events.on('shutdown', () => {
            this.destroy(true)
        })
    }

    doDestroy(): void {
        // This is for implement
    }

    destroy(fromScene: boolean) {
        if (!this.scene) {
            return
        }
        this.doDestroy()
        super.destroy(fromScene)
    }
}
