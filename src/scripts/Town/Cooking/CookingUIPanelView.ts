import { Cameras, GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TownUIPod } from '../Pod/TownUIPod'
import { PodProvider } from '../../pod/PodProvider'
import { DimButton } from '../../button/DimButton'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { Observable, Subscription, concatMap, delay, forkJoin, map, skip, tap, timer } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'
import { CookingRecipeCellView } from './CookingRecipeCellView'
import { RecipeBean } from '../Collection/RecipeBean'
import { RecipeType } from '../Collection/type/RecipeType'
import { CookingDetailView } from './CookingDetailView'
import { AnimationController } from '../AnimationController'
import { IngredientBean } from '../../Ingredient/IngredientBean'
import { TownTimeState } from '../Type/TownTimeState'
import { CookingFilterView } from './CookingFilterView'
import { CookingPod } from './../Pod/CookingPod'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'
import { RecipePod } from '../../pod/RecipePod'
import { InventoryPod } from '../Inventory/InventoryPod'
import { InventoryFilterType } from '../Inventory/InventoryFilterType'
import { CookState } from '../Collection/type/CookState'
import { CookingDetailState } from './CookingDetailState'
import { CookingPanelState } from './CookingPanelState'
import { APILoadingManager } from '../../api-loading/APILoadingManager'
import { BoldText } from '../../../BoldText/BoldText'
import { TutorialManager } from '../../Manager/TutorialManager'
import { TutorialStepState } from '../../../Tutorial/TutorialStepState'
import { TutorialState } from '../../../Tutorial/TutorialState'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { UIDepthConfig } from '../../UIDepthConfig'

export class CookingUIPanelView extends GameObjects.Container {
    public static readonly COOKING_BG_KEY: string = 'cooking-bg-'
    public static readonly SCROLL_VIEW_LAYER: number = 1

    private dimButton: DimButton

    private cookingUIContainer: GameObjects.Container
    private cookingHeaderContainer: GameObjects.Container

    private cookingHeaderBackground: GameObjects.NineSlice

    private cookingBackground: GameObjects.Image
    private cookingHeaderIcon: GameObjects.Image

    private cookingHeaderText: GameObjects.Text

    private cookingFilterView: CookingFilterView
    private cookingDetailView: CookingDetailView

    private scrollView: ScrollViewNormalAndPagination
    private cookingRecipeCellViews: CookingRecipeCellView[] = []

    private completedAndReadyUIContainer: GameObjects.Container
    private textContainer: GameObjects.Container
    private currentCompletedImage: GameObjects.NineSlice
    private midLineImage: GameObjects.Image
    private currentReadyText: GameObjects.Text
    private currentCompletedText: GameObjects.Text
    private positionTextRect: GameObjects.Rectangle

    private townUIPod: TownUIPod
    private cookingPod: CookingPod
    private recipePod: RecipePod
    private inventoryPod: InventoryPod
    private tutorialManager: TutorialManager

    private isDesktop: boolean = false

    private gameCamera: Cameras.Scene2D.Camera

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private isTween: boolean = false

    private stateSubscription: Subscription
    private stateFilterSubscription: Subscription
    private stateCookingDetailSubscription: Subscription
    private scrollViewLayerSubscription: Subscription
    private currentUnlockedSelectedSubscription: Subscription
    private currentReadySelectedSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.cookingPod = PodProvider.instance.cookingPod
        this.recipePod = PodProvider.instance.recipePod
        this.inventoryPod = PodProvider.instance.inventoryPod
        this.tutorialManager = PodProvider.instance.tutorialManager

        this.gameCamera = this.scene.cameras.main
        this.setPosition(this.gameCamera.centerX, this.gameCamera.centerY)
        this.setDepth(UIDepthConfig.COOKING)
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.setupUI()
        this.setupSubscribes()
        this.setupActions()
        this.createTween()
    }

    private setupUI(): void {
        this.dimButton = new DimButton(this.scene, 0.5, true, 'cooking-bg')
        this.cookingDetailView = new CookingDetailView(this.scene)
        this.cookingDetailView.doInit()
        this.setupCookingUIContainer()
        this.add([this.dimButton, this.cookingUIContainer])
    }

    private setupSubscribes(): void {
        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Cooking) {
                this.setActiveContainer(true)
                this.townUIPod.setIsFinishChangeUITween(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.scrollViewLayerSubscription = this.townUIPod.layerScrollView.subscribe((currentScrollViewLayer) => {
            this.scrollView?.updateCurrentLayer(currentScrollViewLayer)
            this.cookingFilterView?.updateCurrentScrollViewLayer(currentScrollViewLayer)
        })

        this.stateFilterSubscription = this.cookingPod.cookingFilterState.subscribe((state) => {
            if (this.townUIPod.townUIState.value == TownUIState.Cooking) this.scrollViewCreateCellWithFilter(state, 0)
        })

        this.stateCookingDetailSubscription = this.cookingPod.cookingDetailState.subscribe((detailState) => {
            if (detailState == CookingDetailState.CookingComplete) {
                if (this.tutorialManager.isCompletedTutorial()) {
                    this.doOnReloadCooking()
                } else if (
                    this.tutorialManager.tutorialStepID.value == TutorialStepState.CompleteCooking &&
                    this.cookingPod.isAlreadyOpen &&
                    !this.tutorialManager.isCompletedTutorial()
                ) {
                    this.doOnReloadCooking()
                }
            }
        })

        this.scrollView?.isDrag.subscribe((x) => {
            this.cookingPod.isDragScrollViewCooking = x
        })

        this.currentUnlockedSelectedSubscription = this.recipePod.totalUserCookedCurrentSelectedFilter.subscribe(
            (totalUserCookedSelected) => {
                this.setTextCompleted(totalUserCookedSelected)
            }
        )

        this.currentReadySelectedSubscription = this.cookingPod.totalReadyCurrentSelectedFilter.subscribe(
            (totalReady) => {
                this.setTextReady(totalReady)
            }
        )

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.Cooking, false)
        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.stateCookingDetailSubscription?.unsubscribe()
            this.scrollViewLayerSubscription?.unsubscribe()
            this.stateFilterSubscription?.unsubscribe()
            this.currentUnlockedSelectedSubscription?.unsubscribe()
            this.currentReadySelectedSubscription?.unsubscribe()
        })
    }

    private doOnReloadCooking() {
        this.scrollViewCreateCellWithFilter(RecipeFilterType.All, 0, true)
        this.scrollViewCreateCellWithFilter(this.cookingPod.cookingFilterState.value, 100)
    }

    private setupCookingUIContainer(): void {
        this.cookingUIContainer = this.scene.add.container()

        if (!this.isDesktop) {
            this.cookingUIContainer.setPosition(0, 30)
            this.cookingBackground = this.scene.add.image(0, 0, CookingUIPanelView.COOKING_BG_KEY + 'mobile')
        } else {
            this.cookingUIContainer.setPosition(0, -30)
            this.cookingBackground = this.scene.add.image(0, 0, CookingUIPanelView.COOKING_BG_KEY + 'desktop')
        }
        this.cookingBackground.setInteractive()
        this.setupCookingHeaderContainer()

        this.cookingUIContainer.add([this.cookingBackground, this.cookingHeaderContainer])
        this.setupCookingFilter()

        if (this.isDesktop) {
            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + 7,
                this.cookingBackground.displayWidth / 1.068,
                this.cookingBackground.displayHeight / 1.25,
                this.depth + 1,
                10,
                false,
                false,
                1,
                false
            )
            this.scrollView.setInitPosXOffset(10)
            this.scrollView.setOffsetMaxMove(10)
            this.scrollView.setMaskRounded(15, 0)
            this.scrollView.setCallbackOnEndScroll(() => {
                this.scrollView.doOnEndScroll(this.cookingRecipeCellViews)
            }, -40)

            this.createUICompletedDesktop()
        } else {
            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + 80,
                this.cookingBackground.displayWidth / 1.045,
                this.cookingBackground.displayHeight / 1.24,
                this.depth + 1,
                0,
                false,
                false,
                1,
                false
            )

            this.scrollView.setCallbackOnEndScroll(() => {
                this.scrollView.doOnEndScroll(this.cookingRecipeCellViews)
            }, -50)

            this.scrollView.setOffsetMaxMove(5)
            this.scrollView.setMaskRounded(10, 0)

            this.createUICompletedMobile()
        }
    }

    private setupCookingHeaderContainer(): void {
        this.cookingHeaderContainer = this.scene.add.container()
        this.cookingHeaderBackground = this.scene.add.nineslice(0, 0, 'header-background', '', 225, 50, 40, 40, 0, 0)
        this.cookingHeaderIcon = this.scene.add.image(0, 0, 'cooking-icon-header').setOrigin(0.5)

        this.cookingHeaderText = new BoldText(this.scene, 0, 0, 'COOKING')

        if (this.isDesktop) {
            this.cookingHeaderContainer.setPosition(0, -this.cookingBackground.height / 2)
            this.cookingHeaderBackground.setScale(1.25)
            this.cookingHeaderIcon.setScale(1.35).setPosition(-50, -23)
            this.cookingHeaderText.setPosition(35, -12).setStyle({ fontSize: 36 })
        } else {
            this.cookingHeaderContainer.setPosition(0, -this.scene.cameras.main.height / 2 + 18)
            this.cookingHeaderIcon.setPosition(-48, -18)
            this.cookingHeaderText.setPosition(28, -10).setStyle({ fontSize: 28 })
        }

        this.cookingHeaderContainer.add([this.cookingHeaderBackground, this.cookingHeaderIcon, this.cookingHeaderText])
    }

    private setupCookingFilter(): void {
        this.cookingFilterView = new CookingFilterView(this.scene)
        if (this.isDesktop) {
            this.cookingFilterView.doInit(
                this.scene.cameras.main.centerX + -this.cookingBackground.width / 2 + 73,
                this.scene.cameras.main.centerY + -this.cookingBackground.height / 2 + 40,
                this.depth,
                this.cookingBackground.width
            )
        } else {
            this.cookingFilterView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - this.cookingBackground.height / 2 + 65,
                this.depth,
                this.cookingBackground.width
            )
        }
    }

    private createUICompletedMobile() {
        this.completedAndReadyUIContainer = this.scene.add.container(0, -this.cookingBackground.height / 2.78)

        this.currentCompletedImage = this.scene.add
            .nineslice(0, 0, 'white-bg-count', '', this.cookingBackground.displayWidth / 1.08, 32, 20, 20, 10, 10)
            .setTint(0xedf0f5)

        this.positionTextRect = this.scene.add.rectangle(0, 0, 30, 15, 0xff00ff, 0)

        this.textContainer = this.scene.add.container(0, 0)

        this.currentReadyText = new BoldText(this.scene, 0, -4, 'Ready ??', 22, '#29CC6A').setOrigin(0, 0.5)

        this.midLineImage = this.scene.add.image(0, 0, 'line-completed')

        this.currentCompletedText = new BoldText(this.scene, 0, -4, 'Completed ??/??', 22, '#0099FF').setOrigin(0, 0.5)

        this.textContainer.add([this.currentReadyText, this.midLineImage, this.currentCompletedText])

        this.completedAndReadyUIContainer.add([this.currentCompletedImage, this.textContainer, this.positionTextRect])

        this.updateCellSpacingAlign()

        this.cookingUIContainer.add([this.completedAndReadyUIContainer])
    }

    private createUICompletedDesktop() {
        this.completedAndReadyUIContainer = this.scene.add.container(
            this.cookingBackground.width / 2 - 47,
            -this.cookingBackground.height / 2 + 70
        )

        this.positionTextRect = this.scene.add
            .rectangle(0, DeviceChecker.instance.isMacOS() ? 0 : 2, 30, 15, 0xff00ff, 0)
            .setOrigin(1, 0.5)

        this.textContainer = this.scene.add.container(0, 0)

        this.currentCompletedImage = this.scene.add
            .nineslice(10, 0, 'white-bg-count', '', 30, 36, 20, 20, 10, 10)
            .setOrigin(1, 0.5)
            .setTint(0xedf0f5)

        this.currentReadyText = new BoldText(this.scene, 0, -4, 'Ready ??', 22, '#29CC6A').setOrigin(1, 0.5)

        this.midLineImage = this.scene.add.image(0, 0, 'line-completed')

        this.currentCompletedText = new BoldText(this.scene, 0, -4, 'Completed ??/??', 22, '#0099FF').setOrigin(1, 0.5)

        this.textContainer.add([this.currentCompletedText, this.midLineImage, this.currentReadyText])

        this.completedAndReadyUIContainer.add([this.currentCompletedImage, this.textContainer, this.positionTextRect])

        this.updateCellSpacingAlign()
        this.cookingUIContainer.add(this.completedAndReadyUIContainer)
    }

    private updateCellSpacingAlign() {
        let spacing = 10
        let sumWidth =
            this.currentReadyText.width + this.currentCompletedText.width + this.midLineImage.width + spacing * 2

        this.positionTextRect.setSize(sumWidth, this.positionTextRect.height)

        this.textContainer.width = this.textContainer.getBounds().width
        this.textContainer.height = this.textContainer.getBounds().height

        if (this.isDesktop) {
            Phaser.Display.Align.In.RightCenter(this.textContainer, this.positionTextRect, this.textContainer.width / 2)
        } else {
            Phaser.Display.Align.In.LeftCenter(this.textContainer, this.positionTextRect, this.textContainer.width / 2)
        }

        Phaser.Actions.AlignTo(
            this.textContainer.getAll(),
            this.isDesktop ? Phaser.Display.Align.LEFT_CENTER : Phaser.Display.Align.RIGHT_CENTER,
            spacing
        )

        this.midLineImage.y = DeviceChecker.instance.isAppleOS() ? -1 : -2

        this.updateWidthBGCount()
    }

    private setupActions(): void {
        this.dimButton.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.townUIPod.changeUIState(TownUIState.MainMenu)
                this.townUIPod.setIsShowGuideline(true)
            }
        })
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        this.isTween = isTween
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true, !this.townUIPod.isFinishChangeUITween)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()
                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.setActive(true)
                this.setVisible(true)

                this.townUIPod.setLayerScrollView(CookingUIPanelView.SCROLL_VIEW_LAYER)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.scrollView?.setActiveScrollView(false, this.isTween)
                this.cookingPod.isAlreadyOpen = false

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()

                this.dimButton.setActiveDim(false, !this.townUIPod.isFinishChangeUITween)
            }
        } else {
            if (isActive) this.townUIPod.setLayerScrollView(CookingUIPanelView.SCROLL_VIEW_LAYER)
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
            this.scrollView?.setActiveScrollView(isActive)
            this.isTween = true
            this.cookingPod.isAlreadyOpen = false
        }
    }

    private scrollViewCreateCellWithFilter(
        filter: RecipeFilterType,
        delayLoad: number = 400,
        isFindNoti: boolean = false
    ) {
        APILoadingManager.instance.showMiniLoading()
        this.inventoryPod
            .getInventoryItemData(InventoryFilterType.All)
            .pipe(
                delay(this.isDesktop ? 0 : delayLoad),
                concatMap((_) => this.recipePod.getUserRecipeData()),
                concatMap((_) => this.recipePod.getRecipeData(filter)),
                map((beanFilter) => {
                    return this.recipePod.mapUserUnlockedSecretToType(beanFilter, filter)
                }),
                tap((beanFilterWithUser) => {
                    this.scrollView?.clearAll()
                    this.cookingRecipeCellViews = []
                    this.scrollView?.bringToFirst(false)

                    this.createCellPage(beanFilterWithUser)

                    this.setCellCookingWithUser()
                    this.setReadyAndCompletedText()
                    if (!this.cookingPod.isAlreadyOpen || isFindNoti) this.findNotificationReadyCell()

                    this.scrollView?.setActiveScrollView(true, this.isTween)
                    this.isTween = true

                    if (!this.tutorialManager.isCompletedTutorial()) {
                        if (
                            this.tutorialManager.tutorialStepID.value == TutorialStepState.CompleteCooking &&
                            !this.cookingPod.isAlreadyOpen
                        ) {
                            this.tutorialManager.currentActionOnClick()
                        }
                    }

                    this.cookingPod.isAlreadyOpen = true

                    APILoadingManager.instance.hideMiniLoading()
                })
            )
            .subscribe()
    }

    private createCellPage(recipeBean: RecipeBean[]) {
        let { width, height } = this.scrollView.getWidthAndHeightScroll()

        let columnCount = this.isDesktop ? 5 : 2
        let offset = this.isDesktop ? 0 : 0
        let spacing = this.isDesktop ? 10 : 6

        let groupPage = this.recipePod.groupByPerCount(recipeBean, columnCount)

        groupPage.forEach((group, index) => {
            let container = this.scene.add.container(0, 0)
            let page = this.scene.add.rectangle(0, 0, width, 299, 0xff0000, 0)

            container.add(page)

            container.width = container.getBounds().width
            container.height = container.getBounds().height

            let containerGroupCell = this.scene.add.container(0, 0)

            group.forEach((x) => {
                let cell = new CookingRecipeCellView(this.scene)
                cell.doInit(x, index)
                containerGroupCell.add(cell)
                this.cookingRecipeCellViews.push(cell)
            })

            containerGroupCell.width = containerGroupCell.getBounds().width
            containerGroupCell.height = containerGroupCell.getBounds().height

            containerGroupCell.setPosition(-width / 2 + containerGroupCell.width / 2 + offset, 0)

            container.add(containerGroupCell)

            Phaser.Actions.AlignTo(containerGroupCell.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacing)

            this.scrollView.addChildIntoContainer(container)
        })
    }

    private setCellCookingWithUser() {
        this.recipePod.userRecipeBeans.forEach((userRecipe) => {
            let cell = this.cookingRecipeCellViews.find((x) => x.getBean().id == userRecipe.id)
            cell?.setCellWithUserRecipe(userRecipe)
        })

        this.recipePod.setTotalUnlockedCurrentSelectedFilter()
        this.recipePod.setTotalUserCookedSelectedFilter()
    }

    private setReadyAndCompletedText() {
        this.cookingPod.updateTotalReady(this.cookingRecipeCellViews.filter((cell) => cell.isReady).length)
    }

    private findNotificationReadyCell() {
        let filterNotifications: RecipeFilterType[] = []
        this.cookingPod.changeNotificationCooking(filterNotifications)

        this.cookingRecipeCellViews
            .filter((cell) => cell.isReady)
            .forEach((userRecipe) => {
                let bean = userRecipe.recipeBean
                let notificationValue = this.cookingPod.notificationFilterCooking.value
                if (bean != undefined) {
                    let notificationType = this.recipePod.getNotificationTypeWithBean(bean)
                    if (!notificationValue.includes(notificationType)) filterNotifications.push(notificationType)
                }
            })
        this.cookingPod.changeNotificationCooking(filterNotifications)
    }

    private setTextCompleted(currentUnlocked: number) {
        this.currentCompletedText.setText(`Completed ${currentUnlocked}/${this.recipePod.totalMasterRecipe}`)

        this.updateCellSpacingAlign()
    }

    private setTextReady(currentReady: number) {
        this.currentReadyText.setText(`Ready ${currentReady}`)

        this.updateCellSpacingAlign()
    }

    private updateWidthBGCount() {
        if (DeviceChecker.instance.isDesktop()) {
            this.currentCompletedImage.width =
                this.currentCompletedText.width + this.midLineImage.width + this.currentReadyText.width + 40

            Phaser.Actions.AlignTo(this.textContainer.getAll(), Phaser.Display.Align.LEFT_CENTER, 10)
            this.midLineImage.y = DeviceChecker.instance.isMacOS() ? -1 : -2
        }
    }

    private createTween(): void {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.cookingUIContainer, () => {
            if (!this.tutorialManager.isCompletedTutorial(true, TutorialStepState.WelcomeToCooking)) {
                PodProvider.instance.tutorialManager.updateCurrentToNextTutorial()
                PodProvider.instance.tutorialManager.setTutorialState(TutorialState.CountDown)
            }
        })

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweenClose = AnimationController.instance.tweenCloseContainer(this.scene, this.cookingUIContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = tweenClose.onCloseTween
        this.onCloseTweenChain = tweenClose.onCloseTweenChain
    }
}
