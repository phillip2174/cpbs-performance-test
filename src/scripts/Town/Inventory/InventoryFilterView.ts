import { GameObjects, Scene } from 'phaser'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { TownUIPod } from './../Pod/TownUIPod'
import { InventoryPod } from './InventoryPod'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { InventoryFilterCellView } from './InventoryFilterCellView'
import { InventoryFilterType } from './InventoryFilterType'
import { Subscription, skip, timer } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class InventoryFilterView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1

    private filterScrollView: ScrollViewNormalAndPagination
    private filterCells: InventoryFilterCellView[] = []
    private townUIPod: TownUIPod
    private inventoryPod: InventoryPod

    private stateDisposable: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, depth: number, widthBG: number): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.inventoryPod = PodProvider.instance.inventoryPod
        this.setPosition(x, y)
        this.setDepth(depth)
        if (DeviceChecker.instance.isDesktop()) {
            this.createFilterCellsDesktop()
        } else {
            this.createFilterCellsMobile(widthBG)
        }

        this.setupSubscribes()
    }

    public updateCurrentScrollViewLayer(layer: number) {
        this.filterScrollView?.updateCurrentLayer(layer)
    }

    private createFilterCellsDesktop(): void {
        let inventoryFilterButtons: InventoryFilterCellView[] = []

        let inventoryFilterAllButton = new InventoryFilterCellView(this.scene)
        inventoryFilterAllButton.doInit(InventoryFilterType.All)
        inventoryFilterButtons.push(inventoryFilterAllButton)

        let inventoryFilterMeatButton = new InventoryFilterCellView(this.scene)
        inventoryFilterMeatButton.doInit(InventoryFilterType.Meat)
        inventoryFilterButtons.push(inventoryFilterMeatButton)

        let inventoryFilterVegetableButton = new InventoryFilterCellView(this.scene)
        inventoryFilterVegetableButton.doInit(InventoryFilterType.Vegetable)
        inventoryFilterButtons.push(inventoryFilterVegetableButton)

        let inventoryFilterFreshFoodButton = new InventoryFilterCellView(this.scene)
        inventoryFilterFreshFoodButton.doInit(InventoryFilterType.FreshFood)
        inventoryFilterButtons.push(inventoryFilterFreshFoodButton)

        let inventoryFilterSausageButton = new InventoryFilterCellView(this.scene)
        inventoryFilterSausageButton.doInit(InventoryFilterType.Sausage)
        inventoryFilterButtons.push(inventoryFilterSausageButton)

        let inventoryFilterCondimentButton = new InventoryFilterCellView(this.scene)
        inventoryFilterCondimentButton.doInit(InventoryFilterType.Condiment)
        inventoryFilterButtons.push(inventoryFilterCondimentButton)

        let inventoryFilterNoodleButton = new InventoryFilterCellView(this.scene)
        inventoryFilterNoodleButton.doInit(InventoryFilterType.Noodle)
        inventoryFilterButtons.push(inventoryFilterNoodleButton)

        Phaser.Actions.AlignTo(inventoryFilterButtons, Phaser.Display.Align.RIGHT_CENTER, 5)

        this.add([
            inventoryFilterAllButton,
            inventoryFilterMeatButton,
            inventoryFilterVegetableButton,
            inventoryFilterFreshFoodButton,
            inventoryFilterSausageButton,
            inventoryFilterCondimentButton,
            inventoryFilterNoodleButton,
        ])
    }

    private createFilterCellsMobile(widthBG: number): void {
        this.filterScrollView = new ScrollViewNormalAndPagination(this.scene)
        this.filterScrollView.doInit(this.x, this.y, widthBG / 1.045, 50, this.depth + 1, 5, true, false, 1, false)

        this.filterScrollView.setCallbackOnEndScroll(
            () => {
                this.filterScrollView.doOnEndScroll(this.filterCells)
            },
            0,
            2
        )

        let inventoryFilterAllButton = new InventoryFilterCellView(this.scene)
        inventoryFilterAllButton.doInit(InventoryFilterType.All, 0)
        this.filterCells.push(inventoryFilterAllButton)

        let inventoryFilterMeatButton = new InventoryFilterCellView(this.scene)
        inventoryFilterMeatButton.doInit(InventoryFilterType.Meat, 1)
        this.filterCells.push(inventoryFilterMeatButton)

        let inventoryFilterVegetableButton = new InventoryFilterCellView(this.scene)
        inventoryFilterVegetableButton.doInit(InventoryFilterType.Vegetable, 2)
        this.filterCells.push(inventoryFilterVegetableButton)

        let inventoryFilterFreshFoodButton = new InventoryFilterCellView(this.scene)
        inventoryFilterFreshFoodButton.doInit(InventoryFilterType.FreshFood, 3)
        this.filterCells.push(inventoryFilterFreshFoodButton)

        let inventoryFilterSausageButton = new InventoryFilterCellView(this.scene)
        inventoryFilterSausageButton.doInit(InventoryFilterType.Sausage, 4)
        this.filterCells.push(inventoryFilterSausageButton)

        let inventoryFilterCondimentsButton = new InventoryFilterCellView(this.scene)
        inventoryFilterCondimentsButton.doInit(InventoryFilterType.Condiment, 5)
        this.filterCells.push(inventoryFilterCondimentsButton)

        let inventoryFilterNoodlesButton = new InventoryFilterCellView(this.scene)
        inventoryFilterNoodlesButton.doInit(InventoryFilterType.Noodle, 6)
        this.filterCells.push(inventoryFilterNoodlesButton)

        this.filterScrollView.addChildIntoContainer(inventoryFilterAllButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterMeatButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterVegetableButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterFreshFoodButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterSausageButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterCondimentsButton)
        this.filterScrollView.addChildIntoContainer(inventoryFilterNoodlesButton)
    }

    private setupSubscribes(): void {
        this.stateDisposable = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Inventory) {
                this.setActiveFilter(true)
            } else {
                this.setActiveFilter(false)
            }
        })

        this.setActiveFilter(this.townUIPod.townUIState.value == TownUIState.Inventory, false)

        this.on('destroy', () => {
            this.stateDisposable?.unsubscribe()
        })
    }

    private setActiveFilter(isActive: boolean, isTween: boolean = true) {
        if (DeviceChecker.instance.isDesktop()) {
            if (isActive) {
                this.inventoryPod.changeInventoryFilterState(InventoryFilterType.All)

                this.townUIPod.setLayerScrollView(InventoryFilterView.SCROLL_VIEW_LAYER)
            }
        } else {
            if (isTween) {
                if (isActive) {
                    this.inventoryPod.changeInventoryFilterState(InventoryFilterType.All)
                    this.filterScrollView?.bringToFirst(false)
                    this.filterScrollView?.setActiveScrollView(true, true)
                    this.townUIPod.setLayerScrollView(InventoryFilterView.SCROLL_VIEW_LAYER)
                } else {
                    this.filterScrollView?.setActiveScrollView(false)
                    this.filterScrollView?.setActiveScrollView(false, false)
                }
            } else {
                this.filterScrollView?.setActiveScrollView(isActive)
            }
        }
    }
}
