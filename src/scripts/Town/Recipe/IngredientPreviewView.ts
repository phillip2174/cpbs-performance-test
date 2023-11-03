import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { RecipeBean } from '../Collection/RecipeBean'
import { CookState } from '../Collection/type/CookState'
import { IngredientPreviewCellView } from './IngredientPreviewCellView'
import { RewardPointCellView } from './RewardPointCellView'
import { Observable, every, filter, map, tap, timer } from 'rxjs'
import { InventoryPod } from '../Inventory/InventoryPod'
import { PodProvider } from '../../pod/PodProvider'
import { InventoryFilterType } from '../Inventory/InventoryFilterType'

export class IngredientPreviewView extends GameObjects.Container {
    public static readonly NOT_READY_COLOR_CODE: number = 0xfdf3ec
    public static readonly READY_COLOR_CODE: number = 0xecf8f9

    private recipeBean: RecipeBean

    private rectMockPosition: GameObjects.Rectangle
    private ingredientContainer: GameObjects.Container
    private backgroundIngredientPreview: GameObjects.NineSlice

    private inventoryPod: InventoryPod

    private cellArrIngredientPreviewCellView: IngredientPreviewCellView[] = []
    private isAllFull: boolean = false
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.inventoryPod = PodProvider.instance.inventoryPod

        this.setDepth(204)
        this.createUI()
    }

    public setPreviewView(
        recipeBean: RecipeBean,
        scale: number = 1,
        spacing: number = 2.5,
        isOpenBG: boolean = false,
        moreOffset: number = 0
    ) {
        this.setVisible(true)

        this.ingredientContainer.removeAll(true)
        this.cellArrIngredientPreviewCellView = []

        this.recipeBean = recipeBean

        this.recipeBean.ingredients.forEach((bean) => {
            let ingredientPR = new IngredientPreviewCellView(this.scene)
            ingredientPR.doInit(scale, bean, isOpenBG ? true : this.recipeBean.secretUnlock != undefined, isOpenBG)
            ingredientPR.width = ingredientPR.getBounds().width
            ingredientPR.height = ingredientPR.getBounds().height
            this.ingredientContainer.add([ingredientPR])

            this.cellArrIngredientPreviewCellView.push(ingredientPR)
        })

        this.ingredientContainer.width = this.ingredientContainer.getBounds().width
        this.ingredientContainer.height = this.ingredientContainer.getBounds().height
        let cellHeight = this.ingredientContainer.height

        let spacingOffset = spacing
        this.rectMockPosition.setSize(
            this.ingredientContainer.width * this.recipeBean.ingredients.length +
                spacingOffset * (this.recipeBean.ingredients.length - 1),
            this.ingredientContainer.height
        )

        Phaser.Display.Align.In.LeftCenter(this.ingredientContainer, this.rectMockPosition)
        Phaser.Actions.AlignTo(this.ingredientContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacingOffset)

        if (isOpenBG) {
            if (this.backgroundIngredientPreview == undefined) {
                this.backgroundIngredientPreview = this.scene.add
                    .nineslice(
                        0,
                        7,
                        'white-ingredient-bg',
                        '',
                        this.ingredientContainer.getBounds().width + 10 + moreOffset,
                        cellHeight,
                        10,
                        10,
                        10,
                        10
                    )
                    .setTint(IngredientPreviewView.NOT_READY_COLOR_CODE)

                this.add(this.backgroundIngredientPreview).sendToBack(this.backgroundIngredientPreview)
            } else {
                this.backgroundIngredientPreview.setSize(
                    this.ingredientContainer.getBounds().width + 10 + moreOffset,
                    cellHeight
                )
            }
        }
    }

    public updateCellIngredientPreviewUser(): boolean {
        let allFulls = this.cellArrIngredientPreviewCellView.map((cell) => {
            let data = this.inventoryPod.inventoryItemBeans.find((item) => item.id == cell.getBean().id)

            return cell.updateCellUser(data ? data.amount : 0, data != undefined)
        })

        let notReadyColor = IngredientPreviewView.NOT_READY_COLOR_CODE
        let readyColor = IngredientPreviewView.READY_COLOR_CODE

        this.isAllFull = allFulls.every((x) => x == true)
        this.backgroundIngredientPreview.setTint(this.isAllFull ? readyColor : notReadyColor)

        return this.isAllFull
    }

    public updateClearTintAllCell() {
        this.cellArrIngredientPreviewCellView.map((cell) => cell.clearTintCell())
    }

    public getStatusIsAllFull(): boolean {
        return this.isAllFull
    }

    private createUI() {
        this.ingredientContainer = this.scene.add.container(0, 0)

        this.rectMockPosition = this.scene.add.rectangle(0, 0, 160, 40, 0xff00ff, 0)

        this.add([this.ingredientContainer, this.rectMockPosition])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }
}
