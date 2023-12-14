import { Actions, GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { TownUIPod } from './Pod/TownUIPod'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'
import { TownUIButtonView } from './TownUIButtonView'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { TownUIState } from './Type/TownUIState'
import { Subscription } from 'rxjs'
import { AnimationController } from './AnimationController'
import { DimButton } from '../button/DimButton'
import { SceneState } from '../../scenes/SceneState'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'

export class TownUIButtonGroupView extends GameObjects.Container {
    private dimButton: DimButton

    private buttonGroupUIContainer: GameObjects.Container
    private buttonGroupBackground: GameObjects.Image

    private isFirstInit: boolean = true

    private dailyLoginButton: TownUIButtonView
    private minigameButton: TownUIButtonView
    private cookingButton: TownUIButtonView
    private inventoryButton: TownUIButtonView
    private collectionButton: TownUIButtonView
    private closeButton: TownUIButtonView
    private uiButtonList: TownUIButtonView[] = []

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onOpenButtonGroup: Tweens.Tween
    private onCloseTween: Tweens.Tween
    private onCloseScaleTween: Tweens.TweenChain

    private townUIButtonNotificationManager: TownUIButtonNotificationManager
    private townBuildingPod: TownBuildingPod
    private townUIPod: TownUIPod

    private stateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.setDepth(203)
        this.dimButton = new DimButton(this.scene)
        this.setupButtonGroupUI()
        this.add([this.dimButton, this.buttonGroupUIContainer])
        this.setupSubscribe()
        this.createTween()
        this.dimButton.onClick(() => {
            this.townUIPod.setIsShowMenuGroup(false)
        })
    }

    private setupSubscribe(): void {
        this.stateSubscription = this.townUIPod.isShowMenuGroup.subscribe((isShow) => {
            if (isShow) {
                this.onShow()
                this.townUIPod.setLayerScrollView(1)
            } else {
                this.onHide()
            }
        })

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
        })
    }

    private setupButtonGroupUI(): void {
        this.buttonGroupUIContainer = this.scene.add.container()
        this.buttonGroupBackground = this.scene.add.image(0, 0, 'ui-button-group-bg').setOrigin(0.5).setScale(1, 1.05)
        this.setupButtons()
        this.setupActionButton()
        this.buttonGroupUIContainer.add(this.buttonGroupBackground)
        this.buttonGroupUIContainer.add(this.uiButtonList)
    }

    private setupButtons(): void {
        this.collectionButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.collectionButton.doInit(0, 0, 'collections', TownUIButtonType.Collection, 'COLLECTIONS')
        this.uiButtonList.push(this.collectionButton)

        this.inventoryButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.inventoryButton.doInit(0, 0, 'inventory', TownUIButtonType.Inventory, 'MY INVENTORY')
        this.uiButtonList.push(this.inventoryButton)

        this.cookingButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.cookingButton.doInit(0, 0, 'cooking', TownUIButtonType.Cooking, 'COOKING')
        this.uiButtonList.push(this.cookingButton)

        this.minigameButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.minigameButton.doInit(0, 0, 'minigame', TownUIButtonType.Minigame, 'MINI GAME')
        this.uiButtonList.push(this.minigameButton)

        this.dailyLoginButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.dailyLoginButton.doInit(0, 0, 'daily-login', TownUIButtonType.DailyLogin, 'DAILY LOGIN')
        this.uiButtonList.push(this.dailyLoginButton)

        this.closeButton = new TownUIButtonView(this.scene).setAlpha(0)
        this.closeButton.doInit(0, 0, 'close', TownUIButtonType.Close, 'CLOSE')
        this.uiButtonList.push(this.closeButton)

        this.uiButtonList = Actions.GridAlign(this.uiButtonList, {
            width: 3,
            height: 2,
            cellWidth: 110,
            cellHeight: 122,
            x: -110,
            y: -55,
        })

        this.add(this.uiButtonList)
        this.uiButtonList.forEach((uiButtonView) => {
            this.bringToTop(uiButtonView)
        })
    }

    private setupActionButton(): void {
        this.collectionButton.onClick(() => {
            if (PodProvider.instance.tutorialManager.isCompletedTutorial(true, TutorialStepState.CompleteCooking)) {
                this.townUIPod.changeUIState(TownUIState.Collection)
                this.townUIPod.setIsShowGuideline(false)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.inventoryButton.onClick(() => {
            if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                this.townUIButtonNotificationManager.setInventoryIsUpdate(false)
                this.townUIPod.changeUIState(TownUIState.Inventory)
                this.townUIPod.setIsShowGuideline(false)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.cookingButton.onClick(() => {
            if (
                PodProvider.instance.tutorialManager.isCompletedTutorial(
                    true,
                    TutorialStepState.CompletedCollectedIngredient
                )
            ) {
                this.townUIPod.changeUIState(TownUIState.Cooking)
                this.townUIPod.setIsShowGuideline(false)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.dailyLoginButton.onClick(() => {
            if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
                this.townUIPod.changeUIState(TownUIState.DailyLogin)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.minigameButton.onClick(() => {
            if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                this.townUIPod.changeUIState(TownUIState.MiniGameSelect)
                this.townUIPod.setIsShowGuideline(false)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.closeButton.onClick(() => {
            this.townUIPod.setIsShowMenuGroup(false)
        })
    }

    private createTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.buttonGroupUIContainer)

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.buttonGroupUIContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseScaleTween = tweensClose.onCloseTweenChain

        this.onOpenButtonGroup = this.scene.add.tween({
            targets: this.uiButtonList,
            delay: 250,
            duration: 400,
            alpha: { from: 0, to: 1 },
            ease: 'cubic.inout',
            persist: true,
            paused: true,
        })
    }

    private onShow(): void {
        this.dimButton.setActiveDim(true)
        this.onCloseTween?.pause()
        this.onCloseScaleTween?.pause()
        this.onOpenTween.restart()
        this.onOpenTweenChain?.restart()
        this.onOpenButtonGroup?.restart()

        this.setActive(true)
        this.setVisible(true)
    }

    private onHide(): void {
        if (this.isFirstInit) {
            this.setActive(false)
            this.setVisible(false)

            this.isFirstInit = false
        } else {
            this.onOpenTween?.pause()
            this.onOpenTweenChain?.pause()
            this.onOpenButtonGroup?.pause()

            this.onCloseTween?.restart()
            this.onCloseScaleTween?.restart()
            this.dimButton.setActiveDim(false)
        }
    }
}
