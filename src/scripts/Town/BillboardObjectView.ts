import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, interval } from 'rxjs'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { BillboardObjectPod } from './Pod/BillboardObjectPod'
import { BillboardSizeType } from './Type/BillboardSizeType'

export class BillboardObjectView extends GameObjects.GameObject {
    private currentBillboardImage: GameObjects.Image
    private nextBillboardImage: GameObjects.Image

    private currentImageKeyIndex: number
    private nextImageKeyIndex: number

    private currentBillboardImageTween: Tweens.Tween
    private nextBillboardImageTween: Tweens.Tween

    private billboardImageKeys: string[] = []
    private getBillboardImageKeysDisposable: Subscription
    private billboardTweenIntervalDisposable: Subscription
    private billboardObjectPod: BillboardObjectPod

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    private setupBillboardImage(x: number, y: number): void {
        this.currentImageKeyIndex = 0
        this.nextImageKeyIndex = 1

        this.currentBillboardImage = this.scene.add
            .image(x, y, this.billboardImageKeys[this.currentImageKeyIndex])
            .setDepth(100)
            .setOrigin(0.5)
            .setAlpha(1)

        this.nextBillboardImage = this.scene.add
            .image(x, y, this.billboardImageKeys[this.nextImageKeyIndex])
            .setDepth(100)
            .setOrigin(0.5)
            .setAlpha(0)
    }

    private updateCurrentAndNextBillboardImage(): void {
        this.currentImageKeyIndex = this.nextImageKeyIndex
        this.nextImageKeyIndex++
        if (this.nextImageKeyIndex > this.billboardImageKeys.length - 1) {
            this.nextImageKeyIndex = 0
        }

        this.currentBillboardImage.setTexture(this.billboardImageKeys[this.currentImageKeyIndex]).setAlpha(1)
        this.nextBillboardImage.setTexture(this.billboardImageKeys[this.nextImageKeyIndex]).setAlpha(0)
    }

    private tweenBillboardImages(fadeInterval: number, fadeDuration: number): void {
        this.billboardTweenIntervalDisposable = interval(fadeInterval).subscribe((_) => {
            this.currentBillboardImageTween = this.scene.add.tween({
                targets: this.currentBillboardImage,
                duration: fadeDuration,
                alpha: { from: 1, to: 0 },
                yoyo: false,
                repeat: 0,
                ease: 'Quart.easeIn',
                onComplete: () => {
                    this.currentBillboardImageTween.destroy()
                },
            })

            this.nextBillboardImageTween = this.scene.add.tween({
                targets: this.nextBillboardImage,
                duration: fadeDuration,
                alpha: { from: 0, to: 1 },
                yoyo: false,
                repeat: 0,
                ease: 'Quart.easeOut',
                onComplete: () => {
                    this.updateCurrentAndNextBillboardImage()
                    this.nextBillboardImageTween.destroy()
                },
            })
        })
    }

    public doInit(
        x: number,
        y: number,
        sizeType: BillboardSizeType,
        fadeInterval: number = 4500,
        fadeDuration: number = 1500
    ): void {
        this.billboardObjectPod = PodProvider.instance.billboardObjectPod

        this.getBillboardImageKeysDisposable = this.billboardObjectPod
            .getBillboardImageKeysBySizeType(sizeType)
            .subscribe((billboardImageKeys) => {
                this.billboardImageKeys = billboardImageKeys
            })

        this.setupBillboardImage(x, y)
        this.tweenBillboardImages(fadeInterval, fadeDuration)
    }

    public disposeAll(): void {
        this.getBillboardImageKeysDisposable?.unsubscribe()
        this.billboardTweenIntervalDisposable?.unsubscribe()
    }

    destroy(fromScene?: boolean): void {
        this.getBillboardImageKeysDisposable?.unsubscribe()
        this.billboardTweenIntervalDisposable?.unsubscribe()
    }
}
