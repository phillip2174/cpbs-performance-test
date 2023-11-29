import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { IngredientBean } from '../../Ingredient/IngredientBean'
import { BoldText } from '../../../BoldText/BoldText'

export class IngredientPreviewCellView extends GameObjects.Container {
    private backgroundIngredient: GameObjects.Image
    private ingredientImage: GameObjects.Image
    private positionTextRect: GameObjects.Rectangle
    private textContainer: GameObjects.Container
    private currentTotalIngredientText: GameObjects.Text
    private craftUseIngredientText: GameObjects.Text
    private ingredientBean: IngredientBean

    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(
        scale: number = 1,
        ingredient: IngredientBean,
        isTintFill: boolean,
        isCreateText: boolean = false,
        isUseGuidelineBg: boolean = false
    ) {
        this.ingredientBean = ingredient

        if (isUseGuidelineBg) {
            this.backgroundIngredient = this.scene.add.image(0, 0, 'ingredient-slot')
        } else {
            this.backgroundIngredient = this.scene.add
                .image(0, 0, 'white-ingredient-bg')
                .setTint(isCreateText ? 0xffffff : 0xedf1f8)
        }

        this.ingredientImage = this.scene.add
            .image(0, 0, IngredientPreviewCellView.INGREDIENT_IMAGE_KEY + ingredient.id)
            .setDisplaySize(40, 40)
            .setSize(40, 40)

        if (isTintFill) {
            this.ingredientImage.setTintFill(0xaeaec1)
        }
        this.add([this.backgroundIngredient, this.ingredientImage])

        if (isCreateText) {
            this.positionTextRect = this.scene.add.rectangle(
                0,
                this.backgroundIngredient.height / 2 + 12.5,
                30,
                15,
                0xff00ff,
                0
            )

            this.textContainer = this.scene.add.container(0, this.ingredientImage.height / 2 + 5)

            let fontSize = scale == 1 ? 16 : 16 / scale / 1.2

            this.currentTotalIngredientText = new BoldText(this.scene, 0, 0, '??', fontSize, '#EE843C').setOrigin(
                0,
                0.5
            )

            this.craftUseIngredientText = new BoldText(
                this.scene,
                0,
                0,
                `/${ingredient.amount}`,
                fontSize,
                '#A7A7A7'
            ).setOrigin(0, 0.5)

            this.textContainer.add([this.currentTotalIngredientText, this.craftUseIngredientText])

            this.add([this.textContainer, this.positionTextRect])

            this.updateCell(scale)
        } else {
            this.setScale(scale)
        }
    }

    public getBean(): IngredientBean {
        return this.ingredientBean
    }

    public updateCellUser(userItemAmount: number, isFound: boolean): boolean {
        this.currentTotalIngredientText.setText(userItemAmount.toString())

        let isFull = userItemAmount >= this.ingredientBean.amount
        this.currentTotalIngredientText.setColor(isFull ? '#29CC6A' : '#EE843C')
        if (isFound) this.clearTintCell()

        this.updateCell(this.scale)

        return isFull
    }

    public updateCell(scale: number) {
        this.setScale(1)
        let sumWidth = this.currentTotalIngredientText.getBounds().width + this.craftUseIngredientText.getBounds().width
        this.positionTextRect.setSize(sumWidth, this.positionTextRect.height)

        this.textContainer.width = this.textContainer.getBounds().width
        this.textContainer.height = this.textContainer.getBounds().height

        Phaser.Display.Align.In.LeftCenter(this.textContainer, this.positionTextRect, this.textContainer.width / 2, -2)
        Phaser.Actions.AlignTo(this.textContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER)

        this.setScale(scale)
    }

    public clearTintCell() {
        this.ingredientImage.clearTint()
    }
}
