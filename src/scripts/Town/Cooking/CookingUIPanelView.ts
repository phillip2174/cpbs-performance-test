import { Cameras, GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TownUIPod } from '../Pod/TownUIPod'
import { PodProvider } from '../../pod/PodProvider'
import { DimButton } from '../../button/DimButton'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { Subscription, concatMap, map, skip, tap, timer } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'
import { CookingRecipeCellView } from './CookingRecipeCellView'
import { RecipeBean } from '../Collection/RecipeBean'
import { RecipeType } from '../Collection/type/RecipeType'
import { CookingDetailView } from './CookingDetailView'
import { AnimationController } from '../AnimationController'
import { IngredientBean } from '../../Guideline/IngredientBean'
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

    private isDesktop: boolean = false

    private gameCamera: Cameras.Scene2D.Camera

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private isTween: boolean = false

    private stateSubscription: Subscription
    private stateFilterSubscription: Subscription
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

        this.gameCamera = this.scene.cameras.main
        this.setPosition(this.gameCamera.centerX, this.gameCamera.centerY)
        this.setDepth(200)
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.setupUI()
        this.setupSubscribes()
        this.setupActions()
        this.createTween()
    }

    private setupUI(): void {
        this.dimButton = new DimButton(this.scene, 0.5, true)
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

        this.cookingPod.cookingPanelState.subscribe((subState) => {
            if (subState == CookingPanelState.CookingListFromComplete) {
                this.scrollViewCreateCellWithFilter(this.cookingPod.cookingFilterState.value)
            }
        })

        this.scrollViewLayerSubscription = this.townUIPod.layerScrollView.subscribe((currentScrollViewLayer) => {
            this.scrollView?.updateCurrentLayer(currentScrollViewLayer)
            this.cookingFilterView?.updateCurrentScrollViewLayer(currentScrollViewLayer)
        })

        this.stateFilterSubscription = this.cookingPod.cookingFilterState.subscribe((state) => {
            if (this.townUIPod.townUIState.value == TownUIState.Cooking) this.scrollViewCreateCellWithFilter(state)
        })

        this.scrollView?.isDrag.subscribe((x) => {
            this.cookingPod.isDragScrollViewCooking = x
        })

        this.currentUnlockedSelectedSubscription = this.recipePod.totalUnlockedCurrentSelectedFilter.subscribe(
            (totalCompletedSelected) => {
                this.setTextCompleted(totalCompletedSelected)
            }
        )

        this.currentReadySelectedSubscription = this.cookingPod.totalReadyCurrentSelectedFilter.subscribe(
            (totalReady) => {
                this.setTextReady(totalReady)
            }
        )

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.Cooking, false)
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
                this.cookingBackground.displayWidth / 1.06,
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

            this.scrollView.setOffsetMaxMove(5)
            this.scrollView.setMaskRounded(10)

            this.createUICompletedMobile()
        }
    }

    private setupCookingHeaderContainer(): void {
        this.cookingHeaderContainer = this.scene.add.container()
        this.cookingHeaderBackground = this.scene.add.nineslice(0, 0, 'header-background', '', 225, 50, 40, 40, 0, 0)
        this.cookingHeaderIcon = this.scene.add.image(0, 0, 'cooking-icon-header').setOrigin(0.5)
        this.cookingHeaderText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('COOKING')
            .setOrigin(0.5)

        if (this.isDesktop) {
            this.cookingHeaderContainer.setPosition(0, -this.cookingBackground.height / 2)
            this.cookingHeaderBackground.setScale(1.25)
            this.cookingHeaderIcon.setScale(1.35).setPosition(-50, -23)
            this.cookingHeaderText.setPosition(35, -12).setStyle({ fill: '#FFFFFF', fontSize: 36 })
        } else {
            this.cookingHeaderContainer.setPosition(0, -this.scene.cameras.main.height / 2 + 18)
            this.cookingHeaderIcon.setPosition(-48, -18)
            this.cookingHeaderText.setPosition(28, -10).setStyle({ fill: '#FFFFFF', fontSize: 28 })
        }

        this.cookingHeaderContainer.add([this.cookingHeaderBackground, this.cookingHeaderIcon, this.cookingHeaderText])
    }

    private setupCookingFilter(): void {
        this.cookingFilterView = new CookingFilterView(this.scene)
        if (this.isDesktop) {
            this.cookingFilterView.doInit(
                -this.cookingBackground.width / 2 + 68,
                -this.cookingBackground.height / 2 + 70,
                this.depth,
                this.cookingBackground.width
            )

            this.cookingUIContainer.add(this.cookingFilterView)
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
            .nineslice(0, 0, 'white-bg-count', '', this.cookingBackground.displayWidth / 1.05, 32, 20, 20, 10, 10)
            .setTint(0xedf0f5)

        this.positionTextRect = this.scene.add.rectangle(0, 0, 30, 15, 0xff00ff, 0)

        this.textContainer = this.scene.add.container(0, 0)

        this.currentReadyText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Ready ??')
            .setOrigin(0, 0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#29CC6A', fontSize: 22 })

        this.midLineImage = this.scene.add.image(0, 0, 'line-completed')

        this.currentCompletedText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Completed ??/??')
            .setOrigin(0, 0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#0099FF', fontSize: 22 })

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

        this.positionTextRect = this.scene.add.rectangle(0, 0, 30, 15, 0xff00ff, 0).setOrigin(1, 0.5)

        this.textContainer = this.scene.add.container(0, 0)

        this.currentCompletedImage = this.scene.add
            .nineslice(10, 0, 'white-bg-count', '', 30, 36, 20, 20, 10, 10)
            .setOrigin(1, 0.5)
            .setTint(0xedf0f5)

        this.currentReadyText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Ready ??')
            .setOrigin(1, 0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#29CC6A', fontSize: 22 })

        this.midLineImage = this.scene.add.image(0, 0, 'line-completed')

        this.currentCompletedText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Completed ??/??')
            .setOrigin(1, 0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#0099FF', fontSize: 22 })

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

        this.midLineImage.y = -1

        this.updateWidthBGCount()
    }

    private setupActions(): void {
        this.dimButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
            this.townUIPod.setIsShowGuideline(true)
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
            this.cookingPod.isAlreadyOpen = false
        }
    }

    private scrollViewCreateCellWithFilter(filter: RecipeFilterType) {
        this.scrollView?.clearAll()
        this.cookingRecipeCellViews = []
        this.scrollView?.bringToFirst(false)

        this.inventoryPod
            .getInventoryItemData(InventoryFilterType.All)
            .pipe(
                concatMap((_) => this.recipePod.getUserRecipeData()),
                concatMap((_) => this.recipePod.getRecipeData(filter)),
                map((beanFilter) => {
                    return this.recipePod.mapUserUnlockedSecretToType(beanFilter, filter)
                }),
                tap((beanFilterWithUser) => {
                    this.createCellPage(beanFilterWithUser)
                }),
                tap(() => {
                    this.setCellCookingWithUser()
                    this.setReadyAndCompletedText()

                    this.scrollView?.setActiveScrollView(true, this.isTween)
                    this.isTween = true
                    this.cookingPod.isAlreadyOpen = true
                })
            )
            .subscribe()
    }

    private createCellPage(recipeBean: RecipeBean[]) {
        let { width, height } = this.scrollView.getWidthAndHeightScroll()

        let columnCount = this.isDesktop ? 5 : 2
        let offset = this.isDesktop ? 5 : 0
        let spacing = this.isDesktop ? 10 : 6

        let groupPage = this.recipePod.groupByPerCount(recipeBean, columnCount)

        groupPage.forEach((group) => {
            let container = this.scene.add.container(0, 0)
            let page = this.scene.add.rectangle(0, 0, width, 299, 0xff0000, 0)

            container.add(page)

            container.width = container.getBounds().width
            container.height = container.getBounds().height

            let containerGroupCell = this.scene.add.container(0, 0)

            group.forEach((x) => {
                let cell = new CookingRecipeCellView(this.scene)
                cell.doInit(x)
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
    }

    private setReadyAndCompletedText() {
        this.cookingPod.updateTotalReady(this.cookingRecipeCellViews.filter((cell) => cell.isIngredientAllFull).length)
    }

    private setTextCompleted(currentUnlocked: number) {
        let isSecret = this.cookingPod.cookingFilterState.value == RecipeFilterType.Secret
        this.currentCompletedText.setText(
            `Completed ${isSecret ? '??' : currentUnlocked}/${isSecret ? '??' : this.recipePod.totalMasterRecipe}`
        )

        this.updateCellSpacingAlign()
    }

    private setTextReady(currentReady: number) {
        let isSecret = this.cookingPod.cookingFilterState.value == RecipeFilterType.Secret
        this.currentReadyText.setText(`Ready ${isSecret ? '??' : currentReady}`)

        this.updateCellSpacingAlign()
    }

    private updateWidthBGCount() {
        if (this.scene.sys.game.device.os.desktop) {
            this.currentCompletedImage.width =
                this.currentCompletedText.width + this.midLineImage.width + this.currentReadyText.width + 40

            Phaser.Actions.AlignTo(this.textContainer.getAll(), Phaser.Display.Align.LEFT_CENTER, 10)
            this.midLineImage.y = -1
        }
    }

    private createTween(): void {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.cookingUIContainer, () => {})

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
