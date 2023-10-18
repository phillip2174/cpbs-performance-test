import { GameObjects, Scene } from 'phaser'
import { InventoryFilterType } from './InventoryFilterType'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { InventoryPod } from './InventoryPod'
import { PodProvider } from '../../pod/PodProvider'
import { Subscription } from 'rxjs'
import { TextAdapter } from '../../text-adapter/TextAdapter'

export class InventoryFilterCellView extends GameObjects.Container {
    public static readonly FILTER_TYPE_ICON_KEY: string = 'inventory-filter-type-icon-'

    private filterType: InventoryFilterType
    private filterTypeIcon: GameObjects.Image
    private filterTypeText: GameObjects.Text

    private filterBackground: GameObjects.NineSlice
    private filterSelectedBackground: GameObjects.NineSlice

    private filterButton: Button

    private inventoryPod: InventoryPod

    private filterStateDisposable: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(filterType: InventoryFilterType): void {
        this.inventoryPod = PodProvider.instance.inventoryPod
        this.filterType = filterType

        if (this.scene.sys.game.device.os.desktop) {
            this.setupFilterCellDesktop()
        } else {
            this.setupFilterCellMobile()
        }

        this.setupSubscribes()
    }

    private setupFilterCellDesktop(): void {
        this.filterTypeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(this.filterType.toString())
            .setOrigin(0, 0.5)
            .setStyle({ fill: '#FFFFFF', fontSize: 22 })

        if (this.filterType == InventoryFilterType.FreshFood) {
            this.filterTypeText.setText('FRESH FOOD')
        }

        this.filterTypeIcon = this.scene.add
            .image(0, 0, InventoryFilterCellView.FILTER_TYPE_ICON_KEY + this.filterType.toString().toLowerCase())
            .setOrigin(1, 0.5)

        this.filterBackground = this.scene.add
            .nineslice(
                0,
                0,
                'filter-bg',
                '',
                this.filterTypeText.width + this.filterTypeIcon.width + 38,
                36,
                10,
                10,
                10,
                10
            )
            .setOrigin(0.5)

        this.filterTypeText.setPosition(-this.filterBackground.width / 2 + 45, -1)
        this.filterTypeIcon.setPosition(-this.filterBackground.width / 2 + 40, 0)

        this.filterSelectedBackground = this.scene.add
            .nineslice(0, 0, 'selected-filter-bg', '', this.filterBackground.width + 4, 40, 10, 10, 10, 10)
            .setOrigin(0.5)
            .setTintFill(0xffffff)
            .setVisible(false)

        this.filterButton = new Button(this.scene, 0, 0, this.filterBackground.width, 36, '', 0).setAlpha(0.01)
        this.filterButton.onClick(() => {
            this.inventoryPod.changeInventoryFilterState(this.filterType)
            console.log('Clicking Inventory Filter Button: ' + this.filterType.toString())
        })

        this.add([
            this.filterSelectedBackground,
            this.filterBackground,
            this.filterTypeIcon,
            this.filterTypeText,
            this.filterButton,
        ])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setupFilterCellMobile(): void {
        this.filterBackground = this.scene.add.nineslice(0, 0, 'filter-bg', '', 56, 36, 10, 10, 10, 10).setOrigin(0.5)

        this.filterSelectedBackground = this.scene.add
            .nineslice(0, 0, 'selected-filter-bg', '', 60, 40, 10, 10, 10, 10)
            .setOrigin(0.5)
            .setTintFill(0xffffff)
            .setVisible(false)

        this.filterTypeIcon = this.scene.add
            .image(0, 0, InventoryFilterCellView.FILTER_TYPE_ICON_KEY + this.filterType.toString().toLowerCase())
            .setOrigin(0.5)

        this.filterButton = new Button(this.scene, 0, 0, this.filterBackground.width, 36, '', 0).setAlpha(0.01)
        this.filterButton.onClick(() => {
            this.inventoryPod.changeInventoryFilterState(this.filterType)
            console.log('Clicking Inventory Filter Button: ' + this.filterType.toString())
        })

        this.add([this.filterSelectedBackground, this.filterBackground, this.filterTypeIcon, this.filterButton])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setActiveSelected(isActive: boolean) {
        this.filterSelectedBackground.setVisible(isActive)
        this.filterSelectedBackground.setActive(isActive)
        isActive ? this.filterBackground.setTint(0x0099ff) : this.filterBackground.setTint(0xaeaec1)
    }

    private setupSubscribes(): void {
        this.filterStateDisposable = this.inventoryPod.inventoryFilterState.subscribe((state) => {
            this.setActiveSelected(state == this.filterType)
        })
    }
}
