import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { RecipeBean } from '../Collection/RecipeBean'
import { InventoryPod } from '../Inventory/InventoryPod'
import { IngredientPreviewCellView } from './IngredientPreviewCellView'
import { IngredientBean } from './../../Ingredient/IngredientBean'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { UIDepthConfig } from '../../UIDepthConfig'

export class IngredientPreviewView extends GameObjects.Container {
    public static readonly NOT_READY_COLOR_CODE: number = 0xfdf3ec
    public static readonly READY_COLOR_CODE: number = 0xecf8f9

    private recipeBean: RecipeBean
    private ingredientBeans: IngredientBean[] = []

    private rectMockPosition: GameObjects.Rectangle
    private ingredientContainer: GameObjects.Container
    private backgroundIngredientPreview: GameObjects.NineSlice

    private inventoryPod: InventoryPod

    private cellArrIngredientPreviewCellView: IngredientPreviewCellView[] = []
    private isAllFull: boolean = false
    private isDesktop: boolean

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.inventoryPod = PodProvider.instance.inventoryPod
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.createUI()
    }

    public setPreviewView(
        recipeBean: RecipeBean,
        scale: number = 1,
        spacing: number = 2.5,
        isOpenBG: boolean = false,
        moreOffsetX: number = 0,
        moreOffsetY: number = 0,
        isShowText: boolean = false,
        backgroundYPosition: number = 7
    ) {
        this.setVisible(true)

        this.ingredientContainer.removeAll(true)
        this.cellArrIngredientPreviewCellView = []

        this.recipeBean = recipeBean

        this.recipeBean.ingredients.forEach((bean) => {
            let ingredientPR = new IngredientPreviewCellView(this.scene)
            ingredientPR.doInit(
                scale,
                bean,
                isOpenBG ? (isShowText ? true : false) : this.recipeBean.secretUnlock != undefined,
                isShowText,
                false,
                isOpenBG ? 0xffffff : 0xedf1f8
            )
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
                        backgroundYPosition,
                        'white-ingredient-bg',
                        '',
                        this.ingredientContainer.getBounds().width + moreOffsetX,
                        cellHeight + moreOffsetY,
                        10,
                        10,
                        10,
                        10
                    )
                    .setTint(IngredientPreviewView.NOT_READY_COLOR_CODE)

                this.add(this.backgroundIngredientPreview).sendToBack(this.backgroundIngredientPreview)
            } else {
                this.backgroundIngredientPreview.setSize(
                    this.ingredientContainer.getBounds().width + moreOffsetX,
                    cellHeight + moreOffsetY
                )
            }
        }
    }

    public setCompleteNextPreviewView(
        ingredientBeans: IngredientBean[],
        scale: number = 1,
        spacing: number = 2.5,
        isShowMultipleRow: boolean = false,
        isNext: boolean = false,
        moreOffset: number = 0
    ): void {
        this.setVisible(true)

        this.ingredientContainer.removeAll(true)
        this.cellArrIngredientPreviewCellView = []

        this.ingredientBeans = ingredientBeans

        this.ingredientBeans.forEach((bean) => {
            let ingredientPR = new IngredientPreviewCellView(this.scene)
            ingredientPR.doInit(scale, bean, isNext, false, true)
            ingredientPR.width = ingredientPR.getBounds().width
            ingredientPR.height = ingredientPR.getBounds().height

            this.cellArrIngredientPreviewCellView.push(ingredientPR)
        })

        this.backgroundIngredientPreview = this.scene.add
            .nineslice(
                0,
                0,
                isNext ? 'next-ingredients-guideline-bg' : 'complete-ingredients-guideline-bg',
                '',
                isShowMultipleRow ? 336 : 396,
                isShowMultipleRow ? 168 : 92,
                14,
                14,
                14,
                16
            )
            .setScale(scale)

        this.add(this.backgroundIngredientPreview).sendToBack(this.backgroundIngredientPreview)

        if (isShowMultipleRow) {
            this.setupMultipleRowCompleteNextPreview(spacing)
        } else {
            this.setupSingleRowCompleteNextPreview(scale, spacing)
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

    public setBackgroundToReady() {
        let readyColor = IngredientPreviewView.READY_COLOR_CODE
        this.backgroundIngredientPreview.setTint(readyColor)
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

    private setupSingleRowCompleteNextPreview(scale: number, spacing: number): void {
        this.cellArrIngredientPreviewCellView.forEach((cellView) => {
            this.ingredientContainer.add([cellView])
        })

        this.ingredientContainer.width = this.ingredientContainer.getBounds().width
        this.ingredientContainer.height = this.ingredientContainer.getBounds().height

        const spacingOffset = spacing
        this.rectMockPosition.setSize(
            this.ingredientContainer.width * this.ingredientBeans.length +
                spacingOffset * (this.ingredientBeans.length - 1),
            this.ingredientContainer.height
        )

        this.backgroundIngredientPreview.setSize(
            (this.rectMockPosition.width + this.cellArrIngredientPreviewCellView[0].width) / scale,
            (this.rectMockPosition.height + this.cellArrIngredientPreviewCellView[0].height / 2) / scale
        )

        Phaser.Display.Align.In.LeftCenter(this.ingredientContainer, this.rectMockPosition)
        Phaser.Actions.AlignTo(this.ingredientContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacingOffset)
    }

    private setupMultipleRowCompleteNextPreview(spacing: number): void {
        this.setupPreviewIngredientCells(spacing)
        this.setupIngredientContainer()
    }

    private setupPreviewIngredientCells(spacing: number, cellViewIndex: number = 0): void {
        if (cellViewIndex + 1 > this.cellArrIngredientPreviewCellView.length - 1) return

        let cellCount = 0
        const offset = 5

        let rowContainer = this.scene.add.container()
        let containerGroupCell = this.scene.add.container(0, 0)

        for (let i = cellViewIndex; i < this.cellArrIngredientPreviewCellView.length; i++) {
            cellCount += 1
            containerGroupCell.add(this.cellArrIngredientPreviewCellView[i])
            if (cellCount >= 4 || i == this.cellArrIngredientPreviewCellView.length - 1) {
                containerGroupCell.width = containerGroupCell.getBounds().width
                containerGroupCell.height = containerGroupCell.getBounds().height
                const rowPage = this.scene.add.rectangle(
                    0,
                    0,
                    (this.cellArrIngredientPreviewCellView[i].width + spacing) * containerGroupCell.getAll().length,
                    containerGroupCell.height + 5,
                    0xff0000,
                    0
                )

                rowContainer.add(rowPage).sendToBack(rowPage)
                rowContainer.width = rowContainer.getBounds().width
                rowContainer.height = rowContainer.getBounds().height
                this.setupCellRowContainer(containerGroupCell, rowContainer, offset, spacing)
                this.setupPreviewIngredientCells(spacing, i + 1)
                break
            }
        }
    }

    private setupCellRowContainer(
        containerGroupCell: GameObjects.Container,
        rowContainer: GameObjects.Container,
        offset: number,
        spacing: number
    ): void {
        containerGroupCell.width = containerGroupCell.getBounds().width
        containerGroupCell.height = containerGroupCell.getBounds().height
        let cellGroup = containerGroupCell.getAll()[0] as GameObjects.Container
        containerGroupCell.setPosition(-rowContainer.width / 2 + cellGroup.width / 2 + offset, 0)
        rowContainer.add(containerGroupCell)
        Phaser.Actions.AlignTo(containerGroupCell.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacing)
        this.ingredientContainer.add([rowContainer])
    }

    private setupIngredientContainer(): void {
        this.ingredientContainer.setPosition(
            0,
            -this.backgroundIngredientPreview.height / 2 + (this.isDesktop ? 50 : 58)
        )
        Phaser.Actions.AlignTo(this.ingredientContainer.getAll(), Phaser.Display.Align.BOTTOM_CENTER, 0, 5)
    }
}
