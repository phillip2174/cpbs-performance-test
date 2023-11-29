import { GameObjects, Scene } from 'phaser'
import { SceneState } from '../../scenes/SceneState'
import { LoadingBarView } from '../../bar/LoadingBar'

export class APILoadingManager {
    private static _instance: APILoadingManager
    private scene: Phaser.Scene

    private iconScene: GameObjects.Image
    private background: GameObjects.Rectangle
    private loadingSprite: GameObjects.Sprite
    private sceneLoadingContainer: GameObjects.Container

    private miniLoadBackground: GameObjects.Rectangle
    private miniLoadingSprite: GameObjects.Sprite
    private miniLoadingContainer: GameObjects.Container

    private loadingBar: LoadingBarView

    private isDesktop: boolean

    private static getInstance() {
        if (!APILoadingManager._instance) {
            APILoadingManager._instance = new APILoadingManager()
        }

        return APILoadingManager._instance
    }

    static get instance(): APILoadingManager {
        return this.getInstance()
    }

    public doInit(scene: Scene, startLoadingValue: number): void {
        this.scene = scene
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.createSceneLoadingObject()
        this.createMiniLoadingObject()
        this.createLoadingBar(startLoadingValue)
    }

    public showMiniLoading() {
        this.miniLoadingSprite.play('loading-mini')
        this.miniLoadingContainer.setVisible(true)
    }

    public hideMiniLoading() {
        this.miniLoadingSprite.stop()
        this.miniLoadingContainer.setVisible(false)
    }

    public showSceneLoading(scene: SceneState) {
        this.loadingSprite.play('loading-scene')
        switch (scene) {
            case SceneState.TownScene:
                if (this.isDesktop) {
                    this.iconScene.setScale(1)
                } else {
                    this.iconScene.setScale(0.8)
                }
                this.iconScene.setTexture('cp-city-logo')

                break
            case SceneState.MinigameCPPuzzle:
                if (this.isDesktop) {
                    this.iconScene.setScale(0.8)
                } else {
                    this.iconScene.setScale(0.6)
                }
                this.iconScene.setTexture('minigame-1-logo')
                break
            case SceneState.MinigameCPOrder:
                if (this.isDesktop) {
                    this.iconScene.setScale(0.8)
                } else {
                    this.iconScene.setScale(0.6)
                }
                this.iconScene.setTexture('minigame-2-logo')
                break
        }

        if (!this.isDesktop) {
            this.loadingSprite.y = this.scene.cameras.main.centerY + 80
            this.loadingSprite.setScale(0.8)
        }

        this.sceneLoadingContainer.setVisible(true)
    }

    public hideSceneLoading() {
        this.loadingSprite.stop()
        this.sceneLoadingContainer.setVisible(false)
        this.loadingBar.setActiveAll(false)
    }

    public getLoadingBar(): LoadingBarView {
        return this.loadingBar
    }

    private createSceneLoadingObject(): void {
        this.sceneLoadingContainer = this.scene.add
            .container()
            .setDepth(1000)
            .setSize(this.scene.cameras.main.width, this.scene.cameras.main.height)
            .setInteractive()

        this.background = this.scene.add
            .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x2b2b2b, 1)
            .setOrigin(0)
            .setInteractive()

        this.iconScene = this.scene.add.image(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 50,
            'cp-city-logo'
        )

        this.loadingSprite = this.scene.add
            .sprite(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY + 130, `loading-scene`)
            .setOrigin(0.5)
        if (!this.scene.anims.exists('loading-scene'))
            this.scene.anims.create({
                key: 'loading-scene',
                frames: this.scene.anims.generateFrameNumbers('loading-scene', { start: 0, end: 1 }),
                frameRate: 3,
                repeat: -1,
            })

        this.sceneLoadingContainer.add([this.background, this.loadingSprite, this.iconScene])
        this.sceneLoadingContainer.setVisible(false)
    }

    private createMiniLoadingObject(): void {
        this.miniLoadingContainer = this.scene.add
            .container()
            .setDepth(1000)
            .setSize(this.scene.cameras.main.width, this.scene.cameras.main.height)
            .setInteractive()

        this.miniLoadBackground = this.scene.add
            .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x2b2b2b, 0.1)
            .setOrigin(0)
            .setInteractive()

        this.miniLoadingSprite = this.scene.add.sprite(0, 0, `loading-mini`).setOrigin(0.5)

        this.miniLoadingSprite.setPosition(
            this.scene.cameras.main.width - this.miniLoadingSprite.width / 2 - 20,
            this.scene.cameras.main.height - this.miniLoadingSprite.height / 2 - 30
        )

        if (!this.scene.anims.exists('loading-mini'))
            this.scene.anims.create({
                key: 'loading-mini',
                frames: this.scene.anims.generateFrameNumbers('loading-mini', { start: 0, end: 1 }),
                frameRate: 3,
                repeat: -1,
            })

        this.miniLoadingContainer.add([this.miniLoadBackground, this.miniLoadingSprite])
        this.miniLoadingContainer.setVisible(false)
    }

    private createLoadingBar(startLoadingValue: number) {
        this.loadingBar = new LoadingBarView(
            this.scene,
            this.scene.cameras.main.centerX,
            this.isDesktop ? this.scene.cameras.main.centerY + 200 : this.scene.cameras.main.centerY + 140
        ).setDepth(1001)

        this.loadingBar.doInit(startLoadingValue)
    }
}
