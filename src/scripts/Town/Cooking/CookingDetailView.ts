import { Cameras, GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip } from 'rxjs'
import { DimButton } from '../../button/DimButton'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { AnimationController } from '../AnimationController'
import { CookingPod } from '../Pod/CookingPod'
import { TownUIState } from '../Type/TownUIState'
import { CookingDetailCookingAnimationView } from './CookingDetailCookingAnimationView'
import { CookingDetailCookingCompleteView } from './CookingDetailCookingCompleteView'
import { CookingDetailSelectRecipeView } from './CookingDetailSelectRecipeView'
import { CookingDetailState } from './CookingDetailState'
import { CookingPanelState } from './CookingPanelState'
import { TownUIPod } from '../Pod/TownUIPod'
import { AudioManager } from '../../Audio/AudioManager'

export class CookingDetailView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private dimButton: DimButton

    private cookingDetailUIContainer: GameObjects.Container

    private cookingDetailSelectRecipeView: CookingDetailSelectRecipeView
    private cookingDetailCookingAnimationView: CookingDetailCookingAnimationView
    private cookingDetailCookingCompleteView: CookingDetailCookingCompleteView

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private gameCamera: Cameras.Scene2D.Camera

    private cookingPanelStateSubscription: Subscription
    private cookingDetailStateSubscription: Subscription
    private delaySubscription: Subscription

    private isTween: boolean = false

    private audioManager: AudioManager

    private cookingPod: CookingPod
    private townUIPod: TownUIPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.audioManager = PodProvider.instance.audioManager

        this.gameCamera = this.scene.cameras.main
        this.setPosition(this.gameCamera.centerX, this.gameCamera.centerY)
        this.setDepth(203)

        this.dimButton = new DimButton(this.scene)
        this.dimButton.onClick(() => {
            if (
                this.cookingPod.cookingDetailState.value == CookingDetailState.CookingSelectRecipe ||
                this.cookingPod.cookingDetailState.value == CookingDetailState.CookingComplete
            ) {
                this.townUIPod.setLayerScrollView(CookingDetailView.SCROLL_VIEW_LAYER)
                this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
            }
        })

        this.setupCookingDetailUIContainer()
        this.setupSubscribe()
        this.add([this.dimButton, this.cookingDetailUIContainer])
        this.createTween()
    }

    private setupSubscribe(): void {
        this.cookingPanelStateSubscription = this.cookingPod.cookingPanelState.pipe(skip(1)).subscribe((state) => {
            this.setActiveDetail(state == CookingPanelState.CookingDetail)
        })

        this.cookingDetailStateSubscription = this.cookingPod.cookingDetailState.pipe(skip(1)).subscribe((state) => {
            if (PodProvider.instance.townUIPod.townUIState.value == TownUIState.Cooking) {
                this.setActiveWithDetailState()
            }
        })

        this.setActiveDetail(this.cookingPod.cookingPanelState.value == CookingPanelState.CookingDetail, false)
        this.on('destroy', () => {
            this.cookingPanelStateSubscription?.unsubscribe()
            this.cookingDetailStateSubscription?.unsubscribe()
            this.delaySubscription?.unsubscribe()
        })
    }

    private setupCookingDetailUIContainer(): void {
        this.cookingDetailUIContainer = this.scene.add.container()
        this.cookingDetailSelectRecipeView = new CookingDetailSelectRecipeView(this.scene).setVisible(false)
        this.cookingDetailSelectRecipeView.doInit()

        this.cookingDetailCookingAnimationView = new CookingDetailCookingAnimationView(this.scene).setVisible(false)
        this.cookingDetailCookingAnimationView.doInit()

        this.cookingDetailCookingCompleteView = new CookingDetailCookingCompleteView(this.scene).setVisible(false)
        this.cookingDetailCookingCompleteView.doInit()

        this.cookingDetailUIContainer.add([
            this.cookingDetailSelectRecipeView,
            this.cookingDetailCookingAnimationView,
            this.cookingDetailCookingCompleteView,
        ])
    }

    private setActiveDetail(isActive: boolean, isTween: boolean = true): void {
        this.isTween = true
        if (isTween) {
            if (isActive) {
                this.dimButton?.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()
                this.onOpenTween?.restart()
                this.onOpenTweenChain?.restart()

                this.setActive(isActive)
                this.setVisible(isActive)

                this.townUIPod.setLayerScrollView(CookingDetailView.SCROLL_VIEW_LAYER + 1)
            } else {
                this.dimButton?.setActiveDim(false)
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()
                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
            }
        } else {
            this.dimButton?.setActiveDim(isActive)
            this.setVisible(isActive)
            this.setActive(isActive)

            if (isActive) this.townUIPod.setLayerScrollView(CookingDetailView.SCROLL_VIEW_LAYER + 1)
        }
    }

    private setActiveWithDetailState(): void {
        switch (this.cookingPod.cookingDetailState.value) {
            case CookingDetailState.CookingSelectRecipe:
                this.showSelectRecipe()
                break
            case CookingDetailState.CookingAnimation:
                this.showAnimation()
                break
            case CookingDetailState.CookingComplete:
                this.showComplete()
                break
        }
        this.onOpenTween?.restart()
    }

    private showSelectRecipe(): void {
        this.cookingDetailSelectRecipeView?.setVisible(true)
        this.cookingDetailCookingAnimationView?.setVisible(false)
        this.cookingDetailCookingCompleteView?.setVisible(false)
    }

    private showAnimation(): void {
        this.cookingDetailSelectRecipeView?.setVisible(false)
        this.cookingDetailCookingAnimationView?.setVisible(true)
        this.cookingDetailCookingCompleteView?.setVisible(false)
    }

    private showComplete(): void {
        this.audioManager.playSFXSound('win_sfx')

        this.cookingDetailSelectRecipeView?.setVisible(false)
        this.cookingDetailCookingAnimationView?.setVisible(false)
        this.cookingDetailCookingCompleteView?.setVisible(true)
    }

    private createTween(): void {
        let tweens = AnimationController.instance.tweenOpenContainer(
            this.scene,
            this.cookingDetailUIContainer,
            () => {}
        )
        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain
        let tweenClose = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.cookingDetailUIContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )
        this.onCloseTween = tweenClose.onCloseTween
        this.onCloseTweenChain = tweenClose.onCloseTweenChain
    }
}
