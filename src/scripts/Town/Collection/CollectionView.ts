import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, concatMap, map, skip, tap, timer } from 'rxjs'
import { GameConfig } from '../../GameConfig'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { Button } from '../../button/Button'
import { ObjectPlacementDebugger } from '../../plugins/ObjectPlacementDebugger'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CollectionPod } from '../Pod/CollectionPod'
import { TownUIPod } from '../Pod/TownUIPod'
import { TownUIState } from '../Type/TownUIState'
import { CollectionCellView } from './CollectionCellView'
import { CollectionFilterView } from './CollectionFilterView'
import { RecipeBean } from './RecipeBean'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'
import { CookState } from './type/CookState'
import { DimButton } from '../../button/DimButton'
import { AnimationController } from '../AnimationController'
import { CollectionDetailView } from './CollectionDetail/CollectionDetailView'
import { CollectionPanelState } from './type/CollectionPanelState'
import { RecipePod } from '../../pod/RecipePod'
import { APILoadingManager } from '../../api-loading/APILoadingManager'
import { BoldText } from '../../../BoldText/BoldText'
import { TutorialState } from '../../../Tutorial/TutorialState'
import { TutorialManager } from '../../Manager/TutorialManager'
import { TutorialStepState } from '../../../Tutorial/TutorialStepState'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class CollectionView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1

    public static readonly MIN_SIZE_DESKTOP_PANEL: number = 0.88
    public static readonly MAX_SIZE_DESKTOP_PANEL: number = 1

    public static readonly MIN_SIZE_MOBILE_PANEL: number = 1
    public static readonly MAX_SIZE_MOBILE_PANEL: number = 1.4

    public static readonly MIN_SIZE_MOBILE_CELL: number = 1
    public static readonly MAX_SIZE_MOBILE_CELL: number = 1.18

    private dimButton: DimButton

    private collectionViewContainer: GameObjects.Container
    private collectionHeaderContainer: GameObjects.Container
    private collectionsDesktopBackground: GameObjects.Image
    private collectionMobileBackground: GameObjects.NineSlice
    private headerBackground: GameObjects.Image
    private iconHeader: GameObjects.Image
    private headerText: GameObjects.Text

    private scrollView: ScrollViewNormalAndPagination
    private collectionFilterView: CollectionFilterView
    private collectionCellViews: CollectionCellView[] = []

    private collectionDetailView: CollectionDetailView

    private collectionCollectedContainer: GameObjects.Container
    private currentCollectedImage: GameObjects.NineSlice
    private currentCollectedText: GameObjects.Text

    private stateSubscription: Subscription
    private stateCollectionSubscription: Subscription
    private filterSubscription: Subscription
    private layerScrollViewSubscription: Subscription
    private isDragSubscription: Subscription
    private currentUnlockedSelectedSubscription: Subscription

    private collectionPod: CollectionPod
    private recipePod: RecipePod
    private townUIPod: TownUIPod
    private tutorialManager: TutorialManager

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private isTween: boolean = false
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.collectionPod = PodProvider.instance.collectionPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.recipePod = PodProvider.instance.recipePod
        this.tutorialManager = PodProvider.instance.tutorialManager
        this.setDepth(200)
        this.setupUI()
        this.setInteractiveObject()
        this.createTween()

        this.collectionDetailView = new CollectionDetailView(
            this.scene,
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        )
        this.collectionDetailView.doInit()

        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Collection) {
                this.setActiveContainer(true)
                this.townUIPod.setIsFinishChangeUITween(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.filterSubscription = this.collectionPod.collectionFilterState.subscribe((state) => {
            if (this.townUIPod.townUIState.value == TownUIState.Collection) this.scrollViewCreateCellWithFilter(state)
        })

        this.stateCollectionSubscription = this.collectionPod.collectionPanelState.subscribe((state) => {
            if (state == CollectionPanelState.CollectionListFromCongrat) {
                this.scrollViewCreateCellWithFilter(this.collectionPod.collectionFilterState.value)
            }
        })

        this.layerScrollViewSubscription = this.townUIPod.layerScrollView.subscribe((currentScrollViewLayer) => {
            this.scrollView?.updateCurrentLayer(currentScrollViewLayer)
            this.collectionFilterView.updateCurrentScrollViewLayer(currentScrollViewLayer)
            this.collectionDetailView.updateCurrentScrollViewLayer(currentScrollViewLayer)
        })

        this.isDragSubscription = this.scrollView?.isDrag.subscribe((x) => {
            this.collectionPod.isDragScrollView = x
        })

        this.currentUnlockedSelectedSubscription = this.recipePod.totalUnlockedCurrentSelectedFilter.subscribe(
            (totalSelected) => {
                this.setTextCompleted(totalSelected)
            }
        )

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.Collection, false)

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.filterSubscription?.unsubscribe()
            this.stateCollectionSubscription?.unsubscribe()
            this.layerScrollViewSubscription?.unsubscribe()
            this.isDragSubscription?.unsubscribe()
            this.currentUnlockedSelectedSubscription?.unsubscribe()
        })
    }

    private createTween() {
        let tweensOpen = AnimationController.instance.tweenOpenContainer(
            this.scene,
            this.collectionViewContainer,
            () => {}
        )

        this.onOpenTween = tweensOpen.onOpenTween
        this.onOpenTweenChain = tweensOpen.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.collectionViewContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )
        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseTweenChain = tweensClose.onCloseTweenChain
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

                this.collectionCollectedContainer.setVisible(true)
                this.setActive(true)
                this.setVisible(true)

                this.townUIPod.setLayerScrollView(CollectionView.SCROLL_VIEW_LAYER)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.scrollView?.setActiveScrollView(false, this.isTween)
                this.collectionCollectedContainer.setVisible(false)
                this.collectionPod.isAlreadyOpen = false

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.dimButton.setActiveDim(false, !this.townUIPod.isFinishChangeUITween)
            }
        } else {
            if (isActive) this.townUIPod.setLayerScrollView(CollectionView.SCROLL_VIEW_LAYER)
            this.pauseAllTween()
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
            this.scrollView?.setActiveScrollView(isActive)
            this.isTween = true
            this.collectionPod.isAlreadyOpen = false
        }
    }

    private pauseAllTween() {
        this.onCloseTween?.pause()
        this.onCloseTweenChain?.pause()
        this.onOpenTween?.pause()
        this.onOpenTweenChain?.pause()
    }

    private scrollViewCreateCellWithFilter(collectionFilterType: RecipeFilterType) {
        this.scrollView?.clearAll()
        this.collectionCellViews = []
        this.scrollView?.bringToFirst(false)

        //TODO : Fetch data with isAlreadyOpen
        APILoadingManager.instance.showMiniLoading()
        this.recipePod
            .getUserRecipeData()
            .pipe(
                concatMap((_) => this.recipePod.getRecipeData(collectionFilterType)),
                map((beanFilter) => {
                    return this.recipePod.mapUserUnlockedSecretToType(beanFilter, collectionFilterType)
                }),
                tap((beanFilterWithUser) => {
                    this.createCellPage(beanFilterWithUser)
                }),
                tap(() => {
                    this.setCellCollectionWithUser()

                    this.scrollView?.setActiveScrollView(true, this.isTween)
                    this.isTween = true
                    this.collectionPod.isAlreadyOpen = true

                    APILoadingManager.instance.hideMiniLoading()
                })
            )
            .subscribe()
    }

    private createCellPage(recipeBean: RecipeBean[]) {
        let { width, height } = this.scrollView.getWidthAndHeightScroll()
        if (DeviceChecker.instance.isDesktop()) {
            let rowCountColumn = 3
            let countGroupPerPage = 12

            let groupPage = this.recipePod.groupByPerCount(recipeBean, countGroupPerPage)

            groupPage.forEach((group, indexPage) => {
                let container = this.scene.add.container(0, 0)
                let page = this.scene.add.rectangle(0, 0, width, height, 0xff0000, 0)
                container.add(page)

                let halfPage = this.recipePod.groupByPerCount(group, countGroupPerPage / 2)
                halfPage.forEach((halfData, index) => {
                    let pageHalf = this.scene.add
                        .rectangle(0, 0, width / 2, height, index == 0 ? 0xffff00 : 0x00ffff, 0)
                        .setOrigin(index == 0 ? 1 : 0, 0.5)
                    container.add(pageHalf)

                    let centerHalfPagePosition = index == 0 ? -pageHalf.width / 2 : pageHalf.width / 2
                    this.createCellAndSetGrid(
                        container,
                        15,
                        10,
                        centerHalfPagePosition,
                        0,
                        halfData,
                        rowCountColumn,
                        2,
                        centerHalfPagePosition,
                        indexPage
                    )
                })

                this.scrollView.addChildIntoContainer(container)
            })
        } else {
            let rowCount = window.innerWidth >= GameConfig.MAX_SIZE_WIDTH_MOBILE_SCREEN ? 3 : 2
            let countGroupPerPage = window.innerWidth >= GameConfig.MAX_SIZE_WIDTH_MOBILE_SCREEN ? 6 : 4

            let groupPage = this.recipePod.groupByPerCount(recipeBean, countGroupPerPage)
            groupPage.forEach((group, index) => {
                let container = this.scene.add.container(0, 0)
                let page = this.scene.add.rectangle(0, 0, width, height, 0xff0000, 0)
                container.add([page])
                this.createCellAndSetGrid(container, 20, 10, 0, 0, group, rowCount, 2, 0, index)
                this.scrollView.addChildIntoContainer(container)
            })
        }
    }

    private createCellAndSetGrid(
        container: GameObjects.Container,
        spacingW: number,
        spacingH: number,
        containerGroupX: number,
        containerGroupY: number,
        beanArr: RecipeBean[],
        row: number,
        column: number,
        positionXRect: number,
        index: number
    ) {
        let spacingWidth = spacingW
        let spacingHeight = spacingH

        let containerGroupCell = this.scene.add.container(containerGroupX, containerGroupY).setScale(1)

        beanArr.forEach((x) => {
            let cell = new CollectionCellView(this.scene)
            cell.doInit(x, index)
            containerGroupCell.add(cell)
            this.collectionCellViews.push(cell)
        })

        let cellWidthContainer = containerGroupCell.getBounds().width
        let cellHeightContainer = containerGroupCell.getBounds().height

        container.width = container.getBounds().width
        container.height = container.getBounds().height

        Phaser.Actions.GridAlign(containerGroupCell.getAll(), {
            width: row,
            height: column,
            cellWidth: cellWidthContainer + spacingWidth,
            cellHeight: cellHeightContainer + spacingHeight,
            x: 0,
            y: 0,
        })

        container.add(containerGroupCell)

        let scrollViewRect = this.scene.add.rectangle(
            positionXRect,
            0,
            (cellWidthContainer + spacingWidth) * row - spacingWidth,
            (cellHeightContainer + spacingHeight) * column - spacingHeight,
            0xffff00,
            0
        )

        container.add(scrollViewRect)

        Phaser.Display.Align.In.TopLeft(
            containerGroupCell,
            scrollViewRect,
            -cellWidthContainer / 2,
            -cellHeightContainer / 2
        )
    }

    private setCellCollectionWithUser() {
        this.collectionPod.findCookedUserToPushNotification()
        this.recipePod.userRecipeBeans.forEach((userRecipe) => {
            let cell = this.collectionCellViews.find((x) => x.getBean().id == userRecipe.id)
            cell?.setCellWithUserRecipe(userRecipe)
        })

        this.recipePod.setTotalUnlockedCurrentSelectedFilter()
    }

    public setupUI() {
        this.dimButton = new DimButton(this.scene, 0.5, true, 'collection-bg')
        this.add(this.dimButton)

        if (DeviceChecker.instance.isDesktop()) {
            this.setupUIDesktop()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + this.collectionViewContainer.y,
                this.collectionsDesktopBackground.displayWidth / 1.06,
                this.collectionsDesktopBackground.displayHeight / 1.5,
                this.depth + 1,
                10,
                true,
                true,
                1,
                true,
                true,
                this.collectionsDesktopBackground.displayWidth / 1.7,
                24
            )

            this.scrollView.setCallbackOnEndScroll(() => {
                this.scrollView.doOnEndScroll(this.collectionCellViews)
            }, 0)

            this.collectionFilterView = new CollectionFilterView(this.scene)
            this.collectionFilterView.doInit(
                -78,
                -this.collectionsDesktopBackground.getBounds().height / 2 + 14,
                this.depth + 1
            )

            this.collectionViewContainer.add(this.collectionFilterView)

            this.createUICompletedDesktop()
        } else {
            this.setupUIMobile()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX + 15,
                this.scene.cameras.main.centerY + 53,
                this.collectionMobileBackground.displayWidth / 1.05,
                this.collectionMobileBackground.displayHeight / 1.5,
                this.depth + 1,
                10,
                true,
                true,
                1,
                true,
                true,
                this.collectionMobileBackground.displayWidth / 1.6,
                24,
                17
            )

            this.scrollView.setCallbackOnEndScroll(() => {
                this.scrollView.doOnEndScroll(this.collectionCellViews)
            }, -20)

            this.collectionFilterView = new CollectionFilterView(this.scene)
            this.collectionFilterView.doInit(
                this.collectionMobileBackground.getBounds().width,
                this.scene.cameras.main.centerY - this.scrollView.getWidthAndHeightScroll().height / 2 - 5,
                this.depth + 1
            )

            this.createUICompletedMobile()
        }

        //this.scrollView.moveToWithIndex(2)

        // timer(1000).subscribe((_) => {
        //     this.scrollView.bringToLast()
        // })

        // timer(2000).subscribe((_) => {
        //      this.scrollView.bringToFirst(false)

        // })

        // timer(3000).subscribe((_) => {
        //     this.scrollView.moveToWithIndex(5)
        // })

        // timer(4000).subscribe((_) => {
        //     this.scrollView.moveToWithIndex(3)
        // })

        // timer(5000).subscribe((_) => {
        //     this.scrollView.moveToWithIndex(6, false)
        // })
    }

    private setupUIDesktop() {
        this.collectionsDesktopBackground = this.scene.add.image(0, 0, 'book-background-desktop')
        // .setDisplaySize(UIUtil.getCanvasWidth() / 1.4, UIUtil.getCanvasHeight() / 1.15)

        this.headerBackground = this.scene.add.image(0, 0, 'header-background').setScale(1.3)

        this.iconHeader = this.scene.add.image(-95, -30, 'icon-header').setScale(1)

        this.headerText = new BoldText(this.scene, 35, -12, 'COLLECTIONS', 36)

        this.collectionHeaderContainer = this.scene.add.container(
            -this.collectionsDesktopBackground.displayWidth / 2 + 240,
            -this.collectionsDesktopBackground.displayHeight / 2 + 20
        )

        this.collectionHeaderContainer.add([this.headerBackground, this.iconHeader, this.headerText])

        this.collectionViewContainer = this.scene.add.container(0, -20)
        this.collectionViewContainer.add([this.collectionsDesktopBackground, this.collectionHeaderContainer])

        this.add(this.collectionViewContainer)
    }

    private setupUIMobile() {
        this.collectionMobileBackground = this.scene.add
            .nineslice(
                this.scene.cameras.main.width / 2,
                0,
                'book-background-mobile',
                '',
                this.scene.cameras.main.width - 8,
                window.innerHeight >= GameConfig.MAX_SIZE_HEIGHT_MOBILE_SCREEN
                    ? this.scene.cameras.main.height / 1.4
                    : 570,
                1,
                1,
                1,
                1
            )
            .setOrigin(1, 0.5)

        this.collectionHeaderContainer = this.scene.add.container(0, -this.scene.cameras.main.height / 2 + 22) //- 265

        this.headerBackground = this.scene.add.image(0, 0, 'header-background')

        this.iconHeader = this.scene.add.image(-75, -20, 'icon-header').setScale(0.8)

        this.headerText = new BoldText(this.scene, 28, -10, 'COLLECTIONS', 28)

        let positionButton = this.inverseNormalize(
            0.5,
            this.collectionMobileBackground.height / 2.1,
            this.scene.cameras.main.height / 2
        )

        this.collectionHeaderContainer.add([this.headerBackground, this.iconHeader, this.headerText])

        this.collectionViewContainer = this.scene.add.container(0, 30)
        this.collectionViewContainer.add([this.collectionMobileBackground, this.collectionHeaderContainer])

        this.add([this.collectionViewContainer])
    }

    private createUICompletedMobile() {
        this.collectionCollectedContainer = this.scene.add.container(
            15,
            -this.collectionMobileBackground.height / 3.81 - 30
        )

        this.currentCollectedImage = this.scene.add.nineslice(
            0,
            0,
            'white-bg-count',
            '',
            this.collectionMobileBackground.displayWidth / 1.05 - 30,
            32,
            20,
            20,
            10,
            10
        )

        this.currentCollectedText = new BoldText(this.scene, 0, -4, 'Collected ??/??', 22, '#0099FF')

        this.collectionCollectedContainer.add([this.currentCollectedImage, this.currentCollectedText])

        this.collectionViewContainer.add(this.collectionCollectedContainer)
    }

    private createUICompletedDesktop() {
        this.collectionCollectedContainer = this.scene.add.container(
            this.collectionsDesktopBackground.width / 2 - 65,
            -this.collectionsDesktopBackground.height / 2 + 75
        )

        this.currentCollectedImage = this.scene.add
            .nineslice(10, 0, 'white-bg-count', '', 30, 36, 20, 20, 10, 10)
            .setOrigin(1, 0.5)

        this.currentCollectedText = new BoldText(this.scene, 0, -2, 'Collected ?/??', 22, '#0099FF', 0, -4).setOrigin(
            1,
            0.5
        )

        this.currentCollectedImage.width = this.currentCollectedText.getBounds().width + 20

        this.collectionCollectedContainer.add([this.currentCollectedImage, this.currentCollectedText])

        this.collectionViewContainer.add(this.collectionCollectedContainer)
    }

    private setTextCompleted(currentUnlocked: number) {
        this.currentCollectedText.setText(`Collected ${currentUnlocked}/${this.recipePod.totalMasterRecipe}`)

        if (DeviceChecker.instance.isDesktop()) {
            this.currentCollectedImage.width = this.currentCollectedText.width + 20
        }

        switch (this.collectionPod.collectionFilterState.value) {
            case RecipeFilterType.All:
                this.currentCollectedText.setColor('#0099FF')
                break
            case RecipeFilterType.Easy:
                this.currentCollectedText.setColor('#29CC6A')
                break
            case RecipeFilterType.Normal:
                this.currentCollectedText.setColor('#FFBF3C')
                break
            case RecipeFilterType.Hard:
                this.currentCollectedText.setColor('#EE843C')
                break
            case RecipeFilterType.Challenge:
                this.currentCollectedText.setColor('#7B61FF')
                break
            case RecipeFilterType.Secret:
                this.currentCollectedText.setColor('#0060D0')
                break
        }
    }

    private setInteractiveObject() {
        this.collectionsDesktopBackground?.setInteractive()
        this.collectionMobileBackground?.setInteractive()

        this.dimButton.onClick(() => {
            if (
                !this.collectionPod.isDragScrollView &&
                !this.collectionPod.isDragScrollViewFilter &&
                this.tutorialManager.isCompletedTutorial()
            ) {
                this.townUIPod.changeUIState(TownUIState.MainMenu)
                this.townUIPod.setIsShowGuideline(true)
            }
        })
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }
}
