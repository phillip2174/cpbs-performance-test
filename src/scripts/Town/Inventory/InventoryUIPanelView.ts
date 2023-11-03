import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip, tap, timer } from 'rxjs'
import { GameConfig } from '../../GameConfig'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { TownUIPod } from '../Pod/TownUIPod'
import { TownUIState } from '../Type/TownUIState'
import { InventoryPod } from './InventoryPod'
import { InventorySlotCellView } from './InventorySlotCellView'
import { DimButton } from '../../button/DimButton'
import { AnimationController } from '../AnimationController'
import { InventoryFilterView } from './InventoryFilterView'
import { InventoryFilterType } from './InventoryFilterType'

export class InventoryUIPanelView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private dimButton: DimButton

    private inventoryUIContainer: GameObjects.Container
    private inventoryBackground: GameObjects.NineSlice
    private inventoryFilterView: InventoryFilterView
    private inventorySlotCellViews: InventorySlotCellView[] = []

    private inventoryHeaderContainer: GameObjects.Container
    private inventoryHeaderBackground: GameObjects.Image
    private inventoryHeaderText: GameObjects.Text
    private inventoryHeaderIcon: GameObjects.Image

    private paginationScrollView: ScrollViewNormalAndPagination

    private stateSubscription: Subscription
    private scrollViewLayerSubscription: Subscription
    private filterSubscription: Subscription

    private townUIPod: TownUIPod
    private inventoryPod: InventoryPod

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private isDesktop: boolean = false

    private isTween: boolean = false

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(width: number, height: number): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.inventoryPod = PodProvider.instance.inventoryPod
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.setDepth(200)
        if (this.scene.sys.game.device.os.desktop) {
            this.isDesktop = true
        } else {
            this.isDesktop = false
        }
        this.setupUI(width, height)
        this.createTween()
        this.setupSubscribe()
        this.setActionInventory()
    }

    private setupSubscribe(): void {
        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Inventory) {
                this.setActiveContainer(true)
                this.townUIPod.setIsFinishChangeUITween(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.scrollViewLayerSubscription = this.townUIPod.layerScrollView.subscribe((currentScrollViewLayer) => {
            this.paginationScrollView?.updateCurrentLayer(currentScrollViewLayer)
            this.inventoryFilterView?.updateCurrentScrollViewLayer(currentScrollViewLayer)
        })

        this.filterSubscription = this.inventoryPod.inventoryFilterState.subscribe((inventoryFilterType) => {
            if (this.townUIPod.townUIState.value == TownUIState.Inventory) this.setupScrollView(inventoryFilterType)
        })

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.Inventory, false)
    }

    private setActionInventory() {
        this.inventoryBackground?.setInteractive()

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

                this.townUIPod.setLayerScrollView(InventoryUIPanelView.SCROLL_VIEW_LAYER)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.paginationScrollView?.setActiveScrollView(false, this.isTween)
                this.inventoryPod.isAlreadyOpen = false

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.dimButton.setActiveDim(false, !this.townUIPod.isFinishChangeUITween)
            }
        } else {
            if (isActive) this.townUIPod.setLayerScrollView(InventoryUIPanelView.SCROLL_VIEW_LAYER)
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
            this.paginationScrollView?.setActiveScrollView(isActive)
            this.isTween = true
            this.inventoryPod.isAlreadyOpen = false
        }
    }

    private setupUI(width: number, height: number) {
        this.dimButton = new DimButton(this.scene, 0.5, true)

        this.setupInventoryUIContainer(width, height)

        this.add([this.dimButton, this.inventoryUIContainer])
    }

    private setupInventoryUIContainer(width: number, height: number): void {
        this.inventoryUIContainer = this.scene.add.container()
        if (!this.isDesktop) {
            this.inventoryUIContainer.setPosition(0, 30)
        }
        this.inventoryBackground = this.scene.add.nineslice(0, 0, 'inventory-bg', '', width, height, 24, 24, 24, 24)
        this.setupInventoryHeaderContainer()
        this.inventoryUIContainer.add([this.inventoryBackground, this.inventoryHeaderContainer])
        this.setupInventoryFilter()
        this.createScrollView()
    }

    private setupInventoryHeaderContainer(): void {
        this.inventoryHeaderContainer = this.scene.add.container()
        this.inventoryHeaderBackground = this.scene.add.image(0, 0, 'header-background').setOrigin(0.5)
        this.inventoryHeaderIcon = this.scene.add.image(0, 0, 'inventory-icon-header').setOrigin(0.5)
        this.inventoryHeaderText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('MY INVENTORY')
            .setOrigin(0.5)

        if (this.isDesktop) {
            this.inventoryHeaderContainer.setPosition(0, -this.inventoryBackground.height / 2)
            this.inventoryHeaderBackground.setScale(1.25)
            this.inventoryHeaderIcon.setScale(1.35).setPosition(-95, -25)
            this.inventoryHeaderText.setPosition(35, -12).setStyle({ fill: '#FFFFFF', fontSize: 36 })
        } else {
            this.inventoryHeaderContainer.setPosition(0, -this.scene.cameras.main.height / 2 + 18)
            this.inventoryHeaderIcon.setPosition(-75, -20)
            this.inventoryHeaderText.setPosition(28, -10).setStyle({ fill: '#FFFFFF', fontSize: 28 })
        }

        this.inventoryHeaderContainer.add([
            this.inventoryHeaderBackground,
            this.inventoryHeaderIcon,
            this.inventoryHeaderText,
        ])
    }

    private setupInventoryFilter(): void {
        this.inventoryFilterView = new InventoryFilterView(this.scene)
        if (this.isDesktop) {
            this.inventoryFilterView.doInit(
                -this.inventoryBackground.width / 2 + 77,
                -this.inventoryBackground.height / 2 + 60,
                this.depth,
                this.inventoryBackground.width
            )

            this.inventoryUIContainer.add(this.inventoryFilterView)
        } else {
            this.inventoryFilterView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - this.inventoryBackground.height / 2 + 65,
                this.depth,
                this.inventoryBackground.width
            )
        }
    }

    private createScrollView(): void {
        this.paginationScrollView = new ScrollViewNormalAndPagination(this.scene)
        this.paginationScrollView.doInit(
            this.scene.cameras.main.centerX,
            this.isDesktop ? this.scene.cameras.main.centerY : this.scene.cameras.main.centerY + 30,
            this.inventoryBackground.width / 1.05,
            this.isDesktop ? this.inventoryBackground.height / 1.45 : this.inventoryBackground.height / 1.3,
            this.depth + 1,
            10,
            true,
            true,
            1,
            true,
            true,
            this.inventoryBackground.width / 1.6,
            24,
            this.isDesktop ? 40 : 28
        )
    }

    private createTween() {
        let tweensOpen = AnimationController.instance.tweenOpenContainer(
            this.scene,
            this.inventoryUIContainer,
            () => {}
        )

        this.onOpenTween = tweensOpen.onOpenTween
        this.onOpenTweenChain = tweensOpen.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.inventoryUIContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseTweenChain = tweensClose.onCloseTweenChain
    }

    private setupScrollView(inventoryFilterType: InventoryFilterType): void {
        this.paginationScrollView?.clearAll()
        this.inventorySlotCellViews = []
        this.paginationScrollView?.bringToFirst(false)
        let { width, height } = this.paginationScrollView.getWidthAndHeightScroll()

        if (this.isDesktop) {
            this.setupScrollViewDesktop(width, height, inventoryFilterType)
        } else {
            this.setupScrollViewMobile(width, height, inventoryFilterType)
        }
    }

    private setupScrollViewDesktop(width: number, height: number, inventoryFilterType: InventoryFilterType): void {
        let rowCount = 4
        let columnCount = 10
        let countGroupPerPage = 40
        this.createScrollViewPageAndCellGrid(15, 15, width, height, countGroupPerPage, rowCount, columnCount)
        this.getInventoryItemAndSetCellView(
            15,
            15,
            width,
            height,
            countGroupPerPage,
            rowCount,
            columnCount,
            inventoryFilterType
        )
    }

    private setupScrollViewMobile(width: number, height: number, inventoryFilterType: InventoryFilterType): void {
        let rowCount = 5
        let columnCount = 4
        let countGroupPerPage = 20
        this.createScrollViewPageAndCellGrid(10, 10, width, height, countGroupPerPage, rowCount, columnCount)
        this.getInventoryItemAndSetCellView(
            10,
            10,
            width,
            height,
            countGroupPerPage,
            rowCount,
            columnCount,
            inventoryFilterType
        )
    }

    private createScrollViewPageAndCellGrid(
        spacingW: number,
        spacingH: number,
        width: number,
        height: number,
        countGroupPerPage: number,
        rowCount: number,
        columnCount: number
    ): void {
        let container = this.scene.add.container(0, 0)
        let page = this.scene.add.nineslice(0, 0, 'inventory-scroll-view-bg', '', width, height, 23, 23, 20, 20)
        container.add([page])

        this.createCellAndSetGrid(container, spacingW, spacingH, 0, 0, countGroupPerPage, columnCount, rowCount, 0)
        this.paginationScrollView.addChildIntoContainer(container)
    }

    private createCellAndSetGrid(
        container: GameObjects.Container,
        spacingW: number,
        spacingH: number,
        containerGroupX: number,
        containerGroupY: number,
        countGroupPerPage: number,
        row: number,
        column: number,
        positionXRect: number
    ): void {
        let spacingWidth = spacingW
        let spacingHeight = spacingH

        let containerGroupCell = this.scene.add.container(containerGroupX, containerGroupY).setScale(1)

        for (let i = 0; i < countGroupPerPage; i++) {
            let cell = new InventorySlotCellView(this.scene)
            cell.doInit(0, 0)
            containerGroupCell.add(cell)
            this.inventorySlotCellViews.push(cell)
        }

        let cellWidthContainer = containerGroupCell.getBounds().width
        let cellHeightContainer = containerGroupCell.getBounds().height

        container.width = container.getBounds().width
        container.height = container.getBounds().height

        Phaser.Actions.GridAlign(containerGroupCell.getAll(), {
            width: row,
            height: column,
            cellWidth: cellWidthContainer + spacingWidth,
            cellHeight: cellHeightContainer + spacingHeight,
            x: containerGroupCell.x,
            y: containerGroupCell.y,
        })

        container.add(containerGroupCell)

        let scrollViewRect = this.scene.add.rectangle(
            positionXRect,
            0,
            (cellWidthContainer + spacingWidth) * row - spacingWidth,
            (cellHeightContainer + spacingHeight) * column - spacingWidth,
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

    private getInventoryItemAndSetCellView(
        spacingW: number,
        spacingH: number,
        width: number,
        height: number,
        countGroupPerPage: number,
        rowCount: number,
        columnCount: number,
        inventoryFilterType: InventoryFilterType
    ): void {
        //TODO : Fetch data with isAlreadyOpen
        this.inventoryPod
            .getInventoryItemData(inventoryFilterType)
            .pipe(
                tap((itemBean) => {
                    if (Math.floor(itemBean.length / countGroupPerPage) > 0) {
                        for (let i = 0; i < Math.floor(itemBean.length / countGroupPerPage); i++) {
                            this.createScrollViewPageAndCellGrid(
                                spacingW,
                                spacingH,
                                width,
                                height,
                                countGroupPerPage,
                                rowCount,
                                columnCount
                            )
                        }
                    }

                    for (let j = 0; j < itemBean.length; j++) {
                        this.inventorySlotCellViews[j].setIngredientInCell(itemBean[j])
                    }

                    this.paginationScrollView?.setActiveScrollView(true, this.isTween)
                    this.isTween = true
                    this.inventoryPod.isAlreadyOpen = true
                })
            )
            .subscribe()
    }
}
