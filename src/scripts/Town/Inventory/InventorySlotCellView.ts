import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { InventoryItemBean } from './InventoryItemBean'
import { BoldText } from '../../../BoldText/BoldText'

export class InventorySlotCellView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    private slotBackground: GameObjects.NineSlice
    private ingredientImage: GameObjects.Image
    private circleNotification: GameObjects.Image
    private ingredientCountText: GameObjects.Text
    private inventoryItemBean: InventoryItemBean

    private isDesktop: boolean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.isDesktop = this.scene.sys.game.device.os.desktop
        this.setPosition(x, y)

        if (this.isDesktop) {
            this.slotBackground = this.scene.add.nineslice(0, 0, 'ingredient-slot', '', 80, 80, 16, 16, 15, 15)
            this.circleNotification = this.scene.add
                .image(
                    this.slotBackground.width / 2 - 13,
                    -this.slotBackground.height / 2 + 13,
                    'button-notification-bg'
                )
                .setScale(0.5)
        } else {
            this.slotBackground = this.scene.add.nineslice(0, 0, 'ingredient-slot', '', 70, 70, 16, 16, 15, 15)
            this.circleNotification = this.scene.add
                .image(
                    this.slotBackground.width / 2 - 11,
                    -this.slotBackground.height / 2 + 11,
                    'button-notification-bg'
                )
                .setScale(0.48)
        }

        this.circleNotification.setVisible(false)

        this.add([this.slotBackground, this.circleNotification])
    }

    public setIngredientInCell(inventoryItemBean: InventoryItemBean): void {
        this.inventoryItemBean = inventoryItemBean

        this.ingredientImage = this.scene.add.image(
            0,
            0,
            InventorySlotCellView.INGREDIENT_IMAGE_KEY + this.inventoryItemBean.id
        )

        this.ingredientCountText = new BoldText(this.scene, 0, 0, 'X' + this.inventoryItemBean.amount).setOrigin(1, 0.5)

        if (this.isDesktop) {
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

    public setNotificationVisible(isVisible: boolean): void {
        this.circleNotification.setVisible(isVisible)
    }
}
