import { Subscription, timer } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { GameObjects, Scene, Tweens } from 'phaser'
import { BillboardObjectPod } from '../Pod/BillboardObjectPod'
import { PodProvider } from '../../pod/PodProvider'

export class Billboard3DObjectView extends GameObjects.GameObject {
    public static readonly DELAY_SHOW_PRODUCT: number = 2000
    public static readonly DELAY_SHOW_CP_LED: number = 2000
    public static readonly DEPTH_3D_BILLBOARD: number = 4

    private billboard1Image: GameObjects.Image
    private billboard2Image: GameObjects.Image
    private billboard3Image: GameObjects.Image
    private billboard4Image: GameObjects.Image

    private billboardFoodPlateImage: GameObjects.Image

    private billboardCPCoverImage: GameObjects.Image

    private mainCamera: Phaser.Cameras.Scene2D.Camera

    private onOpenProductTweenChain: Tweens.TweenChain
    private onCloseProductTweenChain: Tweens.TweenChain

    private onOpenCPCoverTween: Tweens.Tween
    private onCloseCPCoverTween: Tweens.Tween

    private is3DBillboardIsRunning: boolean

    private billboardObjectPod: BillboardObjectPod

    private showProductTimerSubscription: Subscription
    private showCPLedTimerSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.billboardObjectPod = PodProvider.instance.billboardObjectPod
        this.mainCamera = this.scene.cameras.main

        this.setupBillboard3DImage()

        this.createCPCoverTween()
        this.createBillboardImage()

        this.is3DBillboardIsRunning = false
        this.playTween3DBillboard()

        /*this.scene.add.rectangle(this.mainCamera.centerX, this.mainCamera.centerY, 100, 100, 0xcecece, 1)
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive().on('pointerdown', () => {
            this.stopTween3DBillboard()
        })

        this.scene.add.rectangle(this.mainCamera.centerX - 120, this.mainCamera.centerY, 100, 100, 0xcecece, 1)
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive().on('pointerdown', () => {
            this.playTween3DBillboard()
        })*/
    }

    private setupBillboard3DImage() {
        this.billboard1Image = this.scene.add
            .image(this.mainCamera.centerX + 110, this.mainCamera.centerY - 215, '3d-billboard-01-04')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setAlpha(1)

        this.billboard2Image = this.scene.add
            .image(this.mainCamera.centerX + 170, this.mainCamera.centerY - 185, '3d-billboard-01-03')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setAlpha(1)

        this.billboard3Image = this.scene.add
            .image(this.mainCamera.centerX + 280, this.mainCamera.centerY - 120, '3d-billboard-01-02')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setAlpha(1)

        this.billboard4Image = this.scene.add
            .image(this.mainCamera.centerX + 405, this.mainCamera.centerY - 48, '3d-billboard-01-01')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setAlpha(1)

        this.billboardFoodPlateImage = this.scene.add
            .image(this.mainCamera.centerX + 515, this.mainCamera.centerY + 40, '3d-billboard-01-plate-01')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setAlpha(1)

        this.billboardCPCoverImage = this.scene.add
            .image(this.mainCamera.centerX + 350, this.mainCamera.centerY - 115, '3d-billboard-led-cp')
            .setDepth(Billboard3DObjectView.DEPTH_3D_BILLBOARD)
            .setOrigin(0.5)
            .setScale(0.62)
            .setAlpha(1)
    }

    private playTween3DBillboard() {
        if (this.is3DBillboardIsRunning) return

        this.startTween3DBillboard()
        this.is3DBillboardIsRunning = true
    }

    private startTween3DBillboard() {
        this.resetOpenTweenProductAndRandomProductGroup()
        this.onOpenProductTweenChain.restart()
    }

    private stopTween3DBillboard() {
        this.onOpenProductTweenChain.pause()
        this.onCloseProductTweenChain.pause()
        this.onCloseCPCoverTween.pause()

        this.showProductTimerSubscription?.unsubscribe()
        this.showCPLedTimerSubscription?.unsubscribe()

        this.onOpenCPCoverTween.restart()

        this.resetOnStop3DBillboardTween()

        this.is3DBillboardIsRunning = false
    }

    private resetOpenTweenProductAndRandomProductGroup() {
        const randomBillboardIndex = this.addZeroPad(this.billboardObjectPod.currentBillBoardIndex, 2)
        this.billboardObjectPod.updateIndex3DIndex()

        this.billboard1Image.setTexture(`3d-billboard-${randomBillboardIndex}-01`)
        this.billboard2Image.setTexture(`3d-billboard-${randomBillboardIndex}-02`)
        this.billboard3Image.setTexture(`3d-billboard-${randomBillboardIndex}-03`)
        this.billboard4Image.setTexture(`3d-billboard-${randomBillboardIndex}-04`)
        this.billboardFoodPlateImage.setTexture(`3d-billboard-${randomBillboardIndex}-plate-01`)

        this.resetOnStop3DBillboardTween()
        this.billboardCPCoverImage.setAlpha(1)

        this.billboard2Image.setPosition(this.mainCamera.centerX + 110, this.mainCamera.centerY - 215)
        this.billboard3Image.setPosition(this.mainCamera.centerX + 110, this.mainCamera.centerY - 215)
        this.billboard4Image.setPosition(this.mainCamera.centerX + 110, this.mainCamera.centerY - 215)
        this.billboardFoodPlateImage.setPosition(this.mainCamera.centerX + 280, this.mainCamera.centerY - 120)
    }

    private resetOnStop3DBillboardTween() {
        this.billboard1Image.setAlpha(0)
        this.billboard2Image.setAlpha(0)
        this.billboard3Image.setAlpha(0)
        this.billboard4Image.setAlpha(0)

        this.billboardFoodPlateImage.setAlpha(0)
    }

    private createCPCoverTween() {
        this.onOpenCPCoverTween = this.scene.add.tween({
            targets: this.billboardCPCoverImage,
            duration: 300,
            ease: 'linear',
            props: {
                alpha: {
                    from: 0,
                    to: 1,
                },
            },
            persist: true,
            paused: true,
            onComplete: () => {
                if (this.is3DBillboardIsRunning) {
                    this.showCPLedTimerSubscription = timer(Billboard3DObjectView.DELAY_SHOW_CP_LED).subscribe(
                        (onComplete) => {
                            this.startTween3DBillboard()
                        }
                    )
                }
            },
        })

        this.onCloseCPCoverTween = this.scene.add.tween({
            targets: this.billboardCPCoverImage,
            duration: 400,
            ease: 'linear',
            props: {
                alpha: {
                    from: 1,
                    to: 0,
                },
            },
            persist: true,
            paused: true,
        })
    }

    private createBillboardImage() {
        this.onOpenProductTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.billboard1Image,
                    duration: 200,
                    props: {
                        x: this.mainCamera.centerX + 120,
                        y: this.mainCamera.centerY - 210,
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                    onComplete: () => this.onCloseCPCoverTween.restart(),
                },
                {
                    targets: this.billboard1Image,
                    duration: 100,
                    props: {
                        x: this.mainCamera.centerX + 110,
                        y: this.mainCamera.centerY - 215,
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard2Image,
                    duration: 200,
                    props: {
                        x: this.mainCamera.centerX + 190,
                        y: this.mainCamera.centerY - 175,
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard2Image,
                    duration: 100,
                    props: {
                        x: this.mainCamera.centerX + 170,
                        y: this.mainCamera.centerY - 185,
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard3Image,
                    duration: 200,
                    props: {
                        x: this.mainCamera.centerX + 290,
                        y: this.mainCamera.centerY - 115,
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard3Image,
                    duration: 100,
                    props: {
                        x: this.mainCamera.centerX + 280,
                        y: this.mainCamera.centerY - 120,
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard4Image,
                    duration: 200,
                    props: {
                        x: this.mainCamera.centerX + 425,
                        y: this.mainCamera.centerY - 35,
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard4Image,
                    duration: 100,
                    props: {
                        x: this.mainCamera.centerX + 405,
                        y: this.mainCamera.centerY - 48,
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboardFoodPlateImage,
                    duration: 500,
                    props: {
                        x: this.mainCamera.centerX + 515,
                        y: this.mainCamera.centerY + 40,
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                    onComplete: () => {
                        this.showProductTimerSubscription = timer(Billboard3DObjectView.DELAY_SHOW_PRODUCT).subscribe(
                            (onComplete) => {
                                this.onCloseProductTweenChain.restart()
                            }
                        )
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        this.onCloseProductTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.billboardFoodPlateImage,
                    duration: 500,
                    props: {
                        x: this.mainCamera.centerX + 280,
                        y: this.mainCamera.centerY - 120,
                        alpha: {
                            from: 1,
                            to: 0,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard4Image,
                    duration: 300,
                    props: {
                        x: this.mainCamera.centerX + 280,
                        y: this.mainCamera.centerY - 120,
                        alpha: {
                            from: 1,
                            to: 0,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard3Image,
                    duration: 300,
                    props: {
                        x: this.mainCamera.centerX + 170,
                        y: this.mainCamera.centerY - 185,
                        alpha: {
                            from: 1,
                            to: 0,
                        },
                    },
                    ease: 'cubic.inout',
                    onComplete: () => this.onOpenCPCoverTween.restart(),
                },
                {
                    targets: this.billboard2Image,
                    duration: 300,
                    props: {
                        x: this.mainCamera.centerX + 110,
                        y: this.mainCamera.centerY - 215,
                        alpha: {
                            from: 1,
                            to: 0,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.billboard1Image,
                    duration: 0,
                    props: {
                        alpha: {
                            from: 1,
                            to: 0,
                        },
                    },
                    ease: 'cubic.inout',
                },
            ],
            persist: true,
            paused: true,
        })
    }

    private randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    private addZeroPad(num: number, place: number) {
        return String(num).padStart(place, '0')
    }
}
