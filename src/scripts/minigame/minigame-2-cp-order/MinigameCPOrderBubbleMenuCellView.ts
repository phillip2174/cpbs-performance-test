import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { BubbleMenuMarkState } from './BubbleMenuMarkState'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class MinigameCPOrderBubbleMenuCellView extends GameObjects.Container {
    public static readonly ICON_KEY: string = 'recipe-'
    public static readonly ICON_DEFAULT_SCALE_DESKTOP: number = 0.65
    public static readonly ICON_DEFAULT_SCALE_MOBILE: number = 0.5
    public static readonly SHAKE_TWEEN_DURATION: number = 25
    public static readonly SHAKE_ROTATE_RATE: number = 0.1

    private recipeImage: GameObjects.Image
    private checkMarkImage: GameObjects.Image

    private recipeId: number
    private cellId: number
    private recipeImageOriginRotation: number

    private isDesktop: boolean
    private isPlayTween: boolean = true
    private isIconChanged: boolean = false

    private minigamePod: MinigameCPOrderPod

    private checkMarkTween: Tweens.Tween
    private xMarkTween: Tweens.Tween
    private changeRecipeTween: Tweens.Tween
    private recipeImageShakeTween: Tweens.TweenChain

    private markStateSubscription: Subscription
    private changeOrderSubscription: Subscription
    private timeRunningOutSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(cellId: number, recipeId: number, x: number, y: number): void {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.cellId = cellId
        this.recipeId = recipeId
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.recipeImage = this.scene.add
            .image(0, 0, MinigameCPOrderBubbleMenuCellView.ICON_KEY + this.recipeId)
            .setOrigin(0.5)
        this.recipeImageOriginRotation = this.recipeImage.rotation
        this.isDesktop ? this.setupRecipeAndMarkDesktop() : this.setupRecipeAndMarkMobile()
        this.setPosition(x, y)
        this.add([this.recipeImage, this.checkMarkImage])
        this.createMarkTweens()
        this.createChangeRecipeTween()
        this.createRecipeImageShakeTween()
        this.setupSubscribe()
        this.changeRecipeTween?.restart()

        this.on('destroy', () => {
            this.timeRunningOutSubscription?.unsubscribe()
            this.markStateSubscription?.unsubscribe()
            this.changeOrderSubscription?.unsubscribe()
        })
    }

    public setRecipe(recipeId: number): void {
        this.recipeId = recipeId
        this.changeRecipeTween?.restart()
        this.recipeImage.setTexture(MinigameCPOrderBubbleMenuCellView.ICON_KEY + this.recipeId)
        this.checkMarkImage.setVisible(false)
        this.isPlayTween = true
    }

    private setupRecipeAndMarkDesktop(): void {
        this.recipeImage.setScale(MinigameCPOrderBubbleMenuCellView.ICON_DEFAULT_SCALE_DESKTOP)
        this.checkMarkImage = this.scene.add
            .image(25, 20, 'minigame-bubble-success')
            .setSize(62, 62)
            .setDisplaySize(62, 62)
    }

    private setupRecipeAndMarkMobile(): void {
        this.recipeImage.setScale(MinigameCPOrderBubbleMenuCellView.ICON_DEFAULT_SCALE_MOBILE)
        this.checkMarkImage = this.scene.add
            .image(20, 14, 'minigame-bubble-success')
            .setSize(48, 48)
            .setDisplaySize(48, 48)
    }

    private setupSubscribe(): void {
        this.markStateSubscription = this.minigamePod.currentOrderMarkStates.subscribe((markStates) => {
            switch (markStates[this.cellId]) {
                case BubbleMenuMarkState.Normal:
                    this.checkMarkImage.setVisible(false)
                    break
                case BubbleMenuMarkState.Success:
                    this.checkMarkImage.setVisible(true).setTexture('minigame-bubble-success')
                    if (this.isPlayTween) this.checkMarkTween?.restart()
                    break
                case BubbleMenuMarkState.Fail:
                    this.checkMarkImage.setVisible(true).setTexture('minigame-bubble-fail')
                    if (this.isPlayTween) this.xMarkTween?.restart()
                    break
            }
        })

        this.changeOrderSubscription = this.minigamePod.isChangeOrder.subscribe((isChange) => {
            if (isChange) {
                this.recipeImageShakeTween?.pause()
                this.recipeImage.rotation = this.recipeImageOriginRotation
            }
        })

        this.timeRunningOutSubscription = this.minigamePod.isTimeRunningOut.subscribe((isRunningOut) => {
            if (isRunningOut) {
                this.recipeImageShakeTween?.restart()
            }
        })
    }

    private createMarkTweens(): void {
        this.checkMarkTween = this.scene.add.tween({
            targets: this.checkMarkImage,
            duration: 300,
            ease: 'cubic.inout',
            props: { scale: { from: 0, to: this.checkMarkImage.scale } },
            persist: true,
            paused: true,
            onStart: () => {
                this.isPlayTween = false
            },
        })

        this.xMarkTween = this.scene.add.tween({
            targets: this.checkMarkImage,
            duration: 300,
            ease: 'cubic.inout',
            props: { scale: { from: 0, to: this.checkMarkImage.scale } },
            persist: true,
            paused: true,
            onStart: () => {
                this.isPlayTween = false
            },
        })
    }

    private createChangeRecipeTween(): void {
        this.changeRecipeTween = this.scene.add.tween({
            targets: this.recipeImage,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: 0,
                    to: this.isDesktop
                        ? MinigameCPOrderBubbleMenuCellView.ICON_DEFAULT_SCALE_DESKTOP
                        : MinigameCPOrderBubbleMenuCellView.ICON_DEFAULT_SCALE_MOBILE,
                },
            },
            persist: true,
            paused: true,
        })
    }

    private createRecipeImageShakeTween(): void {
        this.recipeImageShakeTween = this.scene.tweens.chain({
            targets: this.recipeImage,
            ease: 'cubic.inout',
            tweens: [
                {
                    duration: MinigameCPOrderBubbleMenuCellView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.recipeImage.rotation,
                            to: this.recipeImage.rotation + MinigameCPOrderBubbleMenuCellView.SHAKE_ROTATE_RATE,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleMenuCellView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.recipeImage.rotation + MinigameCPOrderBubbleMenuCellView.SHAKE_ROTATE_RATE,
                            to: this.recipeImage.rotation,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleMenuCellView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.recipeImage.rotation,
                            to: this.recipeImage.rotation - MinigameCPOrderBubbleMenuCellView.SHAKE_ROTATE_RATE,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleMenuCellView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.recipeImage.rotation - MinigameCPOrderBubbleMenuCellView.SHAKE_ROTATE_RATE,
                            to: this.recipeImage.rotation,
                        },
                    },
                },
            ],
            loop: 3,
            persist: true,
            paused: true,
        })
    }
}
