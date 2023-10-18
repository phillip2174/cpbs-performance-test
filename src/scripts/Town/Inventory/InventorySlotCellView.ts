import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { InventoryItemBean } from './InventoryItemBean'

export class InventorySlotCellView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    private slotBackground: GameObjects.NineSlice
    private ingredientImage: GameObjects.Image
    private ingredientCountText: GameObjects.Text
    private inventoryItemBean: InventoryItemBean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)

        this.scene.sys.game.device.os.desktop
            ? (this.slotBackground = this.scene.add.nineslice(0, 0, 'ingredient-slot', '', 80, 80, 16, 16, 15, 15))
            : (this.slotBackground = this.scene.add.nineslice(0, 0, 'ingredient-slot', '', 70, 70, 16, 16, 15, 15))

        this.add([this.slotBackground])
    }

    public setIngredientInCell(inventoryItemBean: InventoryItemBean): void {
        this.inventoryItemBean = inventoryItemBean

        this.ingredientImage = this.scene.add.image(
            0,
            0,
            InventorySlotCellView.INGREDIENT_IMAGE_KEY + this.inventoryItemBean.id
        )

        this.ingredientCountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('X' + this.inventoryItemBean.amount)
            .setOrigin(1, 0.5)

        if (this.scene.sys.game.device.os.desktop) {
            this.ingredientImage.setDisplaySize(56, 56)
            this.ingredientImage.setSize(56, 56)
            this.ingredientCountText.setStyle({ fill: '#585858', fontSize: 18 })
            this.ingredientCountText.setPosition(this.slotBackground.width / 2 - 4, this.slotBackground.height / 2 - 12)
        } else {
            this.ingredientImage.setDisplaySize(54, 54)
            this.ingredientImage.setSize(54, 54)
            this.ingredientCountText.setStyle({ fill: '#585858', fontSize: 14 })
            this.ingredientCountText.setPosition(this.slotBackground.width / 2 - 6, this.slotBackground.height / 2 - 10)
        }

        this.add([this.ingredientImage, this.ingredientCountText])
    }
}
