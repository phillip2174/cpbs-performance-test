import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameState } from '../MinigameState'
import { BubbleMenuMarkState } from './BubbleMenuMarkState'
import { MinigameCPOrderBubbleMenuCellView } from './MinigameCPOrderBubbleMenuCellView'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { AudioManager } from '../../Audio/AudioManager'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class MinigameCPOrderBubbleView extends GameObjects.Container {
    public static readonly MAX_CELL_COUNT: number = 2
    public static readonly DELAY_TIME: number = 550
    public static readonly SHAKE_TWEEN_DURATION: number = 25
    public static readonly SHAKE_ROTATE_RATE: number = 0.1

    private bigBubbleBg: GameObjects.Image
    private smallBubbleBg: GameObjects.Image

    private currentLifeCount: number = 3
    private bigBubbleBgOriginRotation: number

    private isDesktop: boolean
    private isInit: boolean = false

    private bubbleMenuCellViews: MinigameCPOrderBubbleMenuCellView[] = []

    private minigamePod: MinigameCPOrderPod

    private bubblesTween: Tweens.TweenChain
    private bigBubbleShakeTween: Tweens.TweenChain

    private audioManager: AudioManager

    private clickedCellSubscription: Subscription
    private changeOrderSubscription: Subscription
    private markStateSubscription: Subscription
    private isDecreaseLifeCountSubscription: Subscription
    private isTimeRunningOutSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.audioManager = PodProvider.instance.audioManager
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.smallBubbleBg = this.scene.add.image(-55, 60, 'minigame-2-bubble-small').setScale(0)
        this.bigBubbleBg = this.scene.add.image(48, 10, 'minigame-2-bubble-big').setScale(0).setOrigin(0.5)
        this.bigBubbleBgOriginRotation = this.bigBubbleBg.rotation
        this.createBubblesTween()
        this.playBubblesTween()
        this.setPosition(x, y)
        this.add([this.smallBubbleBg, this.bigBubbleBg])
        this.setupSubscribe()
    }

    public onStartGame(): void {
        this.smallBubbleBg?.setScale(0)
        this.bigBubbleBg?.setScale(0)
        this.bubbleMenuCellViews?.forEach((bubble) => bubble.setVisible(false))
        this.currentLifeCount = 3
    }

    public playBubblesTween(): void {
        this.bubblesTween?.restart()
    }

    public setCurrentLifeCount(lifeCount: number): void {
        this.currentLifeCount = lifeCount
    }

    private createBubbleMenuCell(): void {
        if (this.bubbleMenuCellViews.length > 0) {
            this.isInit = true
            return
        }
        this.minigamePod.updateCurrentOrderCount()
        this.minigamePod.randomCurrentOrderRecipes()
        for (let i = 0; i < MinigameCPOrderBubbleView.MAX_CELL_COUNT; i++) {
            let bubbleMenuCellView = new MinigameCPOrderBubbleMenuCellView(this.scene)
            if (this.minigamePod.getCurrentOrderRecipes()[i] == undefined) {
                bubbleMenuCellView.doInit(i, 0, this.bigBubbleBg.x, 0)
                bubbleMenuCellView.setVisible(false)
            } else {
                bubbleMenuCellView.doInit(i, this.minigamePod.getCurrentOrderRecipes()[i].id, this.bigBubbleBg.x, 0)
            }
            this.bubbleMenuCellViews.push(bubbleMenuCellView)
        }
        this.updateFirstBubbleMenuCellPosition()
        this.bubbleMenuCellViews[1].setPosition(this.bigBubbleBg.x + 45, 15)
        this.add(this.bubbleMenuCellViews)
    }

    private updateBubbleMenuCell(): void {
        this.minigamePod.updateCurrentOrderCount()
        if (this.minigamePod.currentOrderCount.value >= 11 || this.currentLifeCount <= 0) return
        this.minigamePod.randomCurrentOrderRecipes()
        for (let i = 0; i < MinigameCPOrderBubbleView.MAX_CELL_COUNT; i++) {
            if (this.minigamePod.getCurrentOrderRecipes()[i] != undefined) {
                this.bubbleMenuCellViews[i].setRecipe(this.minigamePod.getCurrentOrderRecipes()[i].id)
                this.bubbleMenuCellViews[i].setVisible(true)
            } else {
                this.bubbleMenuCellViews[i].setVisible(false)
            }
        }
        this.updateFirstBubbleMenuCellPosition()
        this.minigamePod.setIsClickable(true)
        this.minigamePod.setIsTimerZero(false)
        this.audioManager.playSFXSound('order_incoming_sfx')
    }

    private updateFirstBubbleMenuCellPosition(): void {
        if (this.minigamePod.getCurrentOrderRecipes().length >= 2) {
            this.bubbleMenuCellViews[0].setPosition(this.bigBubbleBg.x - 35, -15)
        } else {
            this.bubbleMenuCellViews[0].setPosition(this.bigBubbleBg.x, 0)
        }
    }

    private setupSubscribe(): void {
        this.clickedCellSubscription = this.minigamePod.currentClickedCellId.subscribe((id) => {
            this.minigamePod.updateCorrectOrder(id)
        })

        this.markStateSubscription = this.minigamePod.currentOrderMarkStates.subscribe((markState) => {
            if (markState.length > 0 && markState.every((mark) => mark == BubbleMenuMarkState.Success)) {
                this.minigamePod.updateServedOrderCount()
                this.minigamePod.setIsClickable(false)
                this.minigamePod.setIsChangeOrder(true)
            } else if (markState.includes(BubbleMenuMarkState.Fail)) {
                this.minigamePod.setIsClickable(false)
                this.minigamePod.setIsDecreaseLifeCount(true)
                this.minigamePod.setIsChangeOrder(true)
            }
        })

        this.changeOrderSubscription = this.minigamePod.isChangeOrder.subscribe((isChange) => {
            if (isChange) {
                this.bigBubbleShakeTween?.pause()
                this.bigBubbleBg.rotation = this.bigBubbleBgOriginRotation
                timer(800).subscribe((_) => {
                    this.minigamePod.setPreviousClickedCellId(-1)
                    this.updateBubbleMenuCell()
                })
            }
        })

        this.isDecreaseLifeCountSubscription = this.minigamePod.isDecreaseLifeCount.subscribe((isDecrease) => {
            if (isDecrease) this.currentLifeCount -= 1
        })

        this.isTimeRunningOutSubscription = this.minigamePod.isTimeRunningOut.subscribe((isRunningOut) => {
            if (isRunningOut) {
                this.bigBubbleShakeTween?.restart()
            }
        })

        this.on('destroy', () => {
            this.clickedCellSubscription?.unsubscribe()
            this.markStateSubscription?.unsubscribe()
            this.changeOrderSubscription?.unsubscribe()
            this.isDecreaseLifeCountSubscription?.unsubscribe()
            this.isTimeRunningOutSubscription?.unsubscribe()
        })
    }

    private createBubblesTween(): void {
        this.bubblesTween = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.smallBubbleBg,
                    ease: 'cubic.inout',
                    duration: 500,
                    props: { scale: { from: 0, to: this.isDesktop ? 1 : 0.95 } },
                },
                {
                    targets: this.bigBubbleBg,
                    ease: 'cubic.inout',
                    duration: 350,
                    props: { scale: { from: 0, to: this.isDesktop ? 1 : 0.95 } },
                    onComplete: () => {
                        this.createBubbleMenuCell()
                        if (this.isInit) {
                            this.updateBubbleMenuCell()
                        } else this.audioManager.playSFXSound('order_incoming_sfx')

                        PodProvider.instance.minigameScenePod.setSceneState(MinigameState.GameStart)
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        this.bigBubbleShakeTween = this.scene.tweens.chain({
            targets: this.bigBubbleBg,
            ease: 'cubic.inout',
            tweens: [
                {
                    duration: MinigameCPOrderBubbleView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.bigBubbleBg.rotation,
                            to: this.bigBubbleBg.rotation + MinigameCPOrderBubbleView.SHAKE_ROTATE_RATE,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.bigBubbleBg.rotation + MinigameCPOrderBubbleView.SHAKE_ROTATE_RATE,
                            to: this.bigBubbleBg.rotation,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.bigBubbleBg.rotation,
                            to: this.bigBubbleBg.rotation - MinigameCPOrderBubbleView.SHAKE_ROTATE_RATE,
                        },
                    },
                },
                {
                    duration: MinigameCPOrderBubbleView.SHAKE_TWEEN_DURATION,
                    props: {
                        rotation: {
                            from: this.bigBubbleBg.rotation - MinigameCPOrderBubbleView.SHAKE_ROTATE_RATE,
                            to: this.bigBubbleBg.rotation,
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
