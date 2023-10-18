import { GameObjects, Scene } from 'phaser'

export class APILoadingManager {
    private static _instance: APILoadingManager
    private scene: Phaser.Scene

    private background: GameObjects.Rectangle
    private loadingSprite: GameObjects.Image
    private apiLoadingContainer: GameObjects.Container

    private static getInstance() {
        if (!APILoadingManager._instance) {
            APILoadingManager._instance = new APILoadingManager()
        }

        return APILoadingManager._instance
    }

    static get instance(): APILoadingManager {
        return this.getInstance()
    }

    public doInit(scene: Scene): void {
        this.scene = scene
        this.createAPILoadingObject()
    }

    public showAPILoading(): void {
        this.apiLoadingContainer.setVisible(true)
    }

    public hideAPILoading(): void {
        this.apiLoadingContainer.setVisible(false)
    }

    private createAPILoadingObject(): void {
        this.apiLoadingContainer = this.scene.add.container().setDepth(999).setInteractive()

        this.background = this.scene.add
            .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0)
            .setInteractive()

        this.loadingSprite = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, `loading`)
            .setOrigin(0.5)

        this.apiLoadingContainer.add([this.background, this.loadingSprite])
        this.apiLoadingContainer.setVisible(false)

        this.scene.add.tween({
            targets: this.loadingSprite,
            yoyo: false,
            repeat: -1,
            angle: 360,
        })
    }
}
