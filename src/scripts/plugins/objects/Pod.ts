import { Scene } from 'phaser'

export class Pod extends Phaser.GameObjects.GameObject {
    constructor(scene: Scene) {
        super(scene, 'gameObject')
        this.scene = scene
        scene.add.existing(this)

        this.scene.events.on('shutdown', () => {
            this.destroy(true)
        })
    }

    dispose(): void {
        // This is for implement
    }

    destroy(fromScene: boolean) {
        if (!this.scene) {
            return
        }

        this.dispose()
        super.destroy(fromScene)
    }
}
