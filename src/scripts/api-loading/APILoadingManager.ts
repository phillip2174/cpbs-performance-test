import { GameObjects, Scene, Tweens } from 'phaser'
import { SceneState } from '../../scenes/SceneState'
import { LoadingBarView } from '../../bar/LoadingBar'
import { PodProvider } from '../pod/PodProvider'
import { timer } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class APILoadingManager {
    private static _instance: APILoadingManager
    private scene: Phaser.Scene

    private iconScene: GameObjects.Image
    private background: GameObjects.Rectangle
    private loadingSprite: GameObjects.Sprite
    private sceneLoadingContainer: GameObjects.Container

    private cloudGroupContainer: GameObjects.Container
    private cloudContainer: GameObjects.Container
    private cloudBackground: GameObjects.Rectangle
    private cloudLoading1: GameObjects.Image
    private cloudLoading2: GameObjects.Image
    private cloudLoading3: GameObjects.Image

    private miniLoadBackground: GameObjects.Rectangle
    private miniLoadingSprite: GameObjects.Sprite
    private miniLoadingContainer: GameObjects.Container

    private loadingBar: LoadingBarView

    private isDesktop: boolean

    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTweenChain: Tweens.TweenChain

    private cloudTween1: Tweens.Tween
    private cloudTween2: Tweens.Tween
    private cloudTween3: Tweens.Tween

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
        this.isDesktop = DeviceChecker.instance.isDesktop()

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

    public showSceneLoading(scene: SceneState, isTween: boolean = false) {
        this.background.setVisible(true)
        const isShowLogo = PodProvider.instance.splashPod.isLaunchCPCity
            ? PodProvider.instance.splashPod.isShowLogoLoading
            : true
        this.iconScene.setVisible(isShowLogo)

        if (isShowLogo) {
            this.loadingSprite.setPosition(
                this.scene.cameras.main.centerX,
                this.isDesktop ? this.scene.cameras.main.centerY + 130 : this.scene.cameras.main.centerY + 80
            )
            this.loadingBar.setPosition(
                this.scene.cameras.main.centerX,
                this.isDesktop ? this.scene.cameras.main.centerY + 200 : this.scene.cameras.main.centerY + 140
            )
        } else {
            this.loadingSprite.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY - 25)
            this.loadingBar.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY + 25)
        }

        this.loadingBar.updatePositionMask()
        if (!this.isDesktop) {
            this.loadingSprite.setScale(0.8)
        }

        this.loadingSprite.play('loading-scene')

        switch (scene) {
            case SceneState.TownScene:
                PodProvider.instance.splashPod.isLaunchCPCity = true
                this.background.setFillStyle(0xffffff)
                this.setIconTweenAndScale(true, 1.2, 0.8, isTween, 'cp-city-logo')

                //this.createTweenCloud()
                break
            case SceneState.MinigameCPPuzzle:
                this.cloudContainer.setVisible(false)
                this.background.setFillStyle(0x2b2b2b)
                this.setIconTweenAndScale(false, 0.8, 0.6, isTween, 'minigame-1-logo')
                break
            case SceneState.MinigameCPOrder:
                this.background.setFillStyle(0x2b2b2b)
                this.setIconTweenAndScale(false, 0.8, 0.6, isTween, 'minigame-2-logo')
                break
        }
        PodProvider.instance.splashPod.setIsCloseLogo(true)
        this.sceneLoadingContainer.setVisible(true)
    }

    private setIconTweenAndScale(
        isActiveCloud: boolean,
        desktopScale: number,
        mobileScale: number,
        isTween: boolean = false,
        imageKey: string
    ) {
        this.cloudContainer.setVisible(isActiveCloud)
        if (this.isDesktop) {
            this.iconScene.setScale(isTween ? 0 : desktopScale)
            if (isTween) this.createTweenOpen(desktopScale)
        } else {
            this.iconScene.setScale(isTween ? 0 : mobileScale)
            if (isTween) this.createTweenOpen(mobileScale)
        }
        this.iconScene.setTexture(imageKey)
    }

    public hideSceneLoading() {
        this.loadingSprite.stop()
        this.sceneLoadingContainer.setVisible(false)
        this.loadingBar.setActiveAll(false)
        this.background.setVisible(false)

        if (PodProvider.instance.splashPod.launchScene == SceneState.TownScene) {
            this.closeCloudTween()
        }
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
            .setDepth(998)

        this.createCloudLoading()

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

        this.sceneLoadingContainer.add([this.loadingSprite, this.iconScene])
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

    private createCloudLoading() {
        this.cloudGroupContainer = this.scene.add.container(0, 0).setDepth(999)
        this.cloudContainer = this.scene.add.container(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)

        const valueScreen = this.normalize(
            window.innerHeight,
            this.isDesktop ? GameConfig.MIN_HEIGHT_DESKTOP_SCREEN : GameConfig.MIN_SIZE_HEIGHT_MOBILE_SCREEN,
            this.isDesktop ? GameConfig.MAX_HEIGHT_DESKTOP_SCREEN : GameConfig.MAX_SIZE_HEIGHT_MOBILE_SCREEN
        )
        const cloudSize = this.isDesktop
            ? this.inverseNormalize(valueScreen, 1, 2)
            : this.inverseNormalize(valueScreen, 0.7, 1.2)

        this.cloudLoading1 = this.scene.add.image(0, 0, 'cloud-load-01').setScale(cloudSize).setOrigin(0.5, 0.5)
        this.cloudLoading1.setPosition(-this.cloudLoading1.width / 2 + 500, 200)

        this.cloudLoading2 = this.scene.add.image(0, 0, 'cloud-load-03').setScale(cloudSize).setOrigin(0.5, 0.5)
        this.cloudLoading2.setPosition(this.cloudLoading2.width / 2 - 500, 100)

        this.cloudLoading3 = this.scene.add
            .image(0, 0, 'cloud-load-02')
            .setScale(cloudSize + 0.5)
            .setOrigin(0.5, 0.5)
        this.cloudLoading3.setPosition(0, -this.cloudLoading3.height / 4)

        this.cloudContainer.add([this.cloudLoading3, this.cloudLoading2, this.cloudLoading1])

        this.cloudGroupContainer.add(this.cloudContainer)
    }

    private createTweenCloud() {
        this.cloudTween1 = this.scene.add.tween({
            targets: this.cloudLoading1,
            ease: 'linear',
            yoyo: true,
            loop: -1,
            duration: 2000,
            props: {
                x: { from: this.cloudLoading1.x, to: this.cloudLoading1.x - 20 },
                y: { from: this.cloudLoading1.y, to: this.cloudLoading1.y - 10 },
            },
        })

        this.cloudTween2 = this.scene.add.tween({
            targets: this.cloudLoading2,
            ease: 'easeInOutCubic',
            yoyo: true,
            loop: -1,
            delay: 500,
            duration: 2000,
            props: {
                x: { from: this.cloudLoading2.x, to: this.cloudLoading2.x + 10 },
                y: { from: this.cloudLoading2.y, to: this.cloudLoading2.y + 30 },
            },
        })

        this.cloudTween3 = this.scene.add.tween({
            targets: this.cloudLoading3,
            ease: 'cubic.inout',
            yoyo: true,
            loop: -1,
            duration: 2000,
            props: {
                x: { from: this.cloudLoading3.x, to: this.cloudLoading3.x + 20 },
                y: { from: this.cloudLoading3.y, to: this.cloudLoading3.y + 20 },
            },
        })
    }

    private closeCloudTween() {
        this.cloudTween1?.destroy()
        this.cloudTween2?.destroy()
        this.cloudTween3?.destroy()

        const durationCloudMove = this.isDesktop ? 1200 : 2000

        this.scene.add.tween({
            targets: [this.cloudLoading1, this.cloudLoading2, , this.cloudLoading3],
            ease: 'linear',
            duration: this.isDesktop ? 800 : 600,
            props: {
                alpha: { from: 1, to: 0 },
            },
        })

        this.scene.add.tween({
            targets: this.cloudLoading1,
            ease: 'Quad.easeOut',
            duration: durationCloudMove,
            props: {
                x: { from: this.cloudLoading1.x, to: this.cloudLoading1.x - 800 },
            },
        })

        this.scene.add.tween({
            targets: this.cloudLoading2,
            ease: 'Quad.easeOut',
            duration: durationCloudMove,
            props: {
                x: { from: this.cloudLoading2.x, to: this.cloudLoading2.x + 800 },
            },
        })
    }

    private createTweenOpen(scale: number) {
        this.onOpenTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.iconScene,
                    duration: 300,
                    props: { scale: { from: 0, to: scale + 0.1 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.iconScene,
                    duration: 130,
                    props: { scale: { from: scale + 0.1, to: scale } },
                    ease: 'linear',
                    onComplete: () => {},
                },
            ],
        })

        this.onOpenTweenChain.play()
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }
}
