import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { IngredientBean } from '../../Guideline/IngredientBean'

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

    public doInit(scale: number = 1, ingredient: IngredientBean, isTineFill: boolean, isCreateText: boolean = false) {
        this.ingredientBean = ingredient

        this.backgroundIngredient = this.scene.add
            .image(0, 0, 'white-ingredient-bg')
            .setTint(isCreateText ? 0xffffff : 0xedf1f8)

        this.ingredientImage = this.scene.add
            .image(0, 0, IngredientPreviewCellView.INGREDIENT_IMAGE_KEY + ingredient.id)
            .setDisplaySize(40, 40)
            .setSize(40, 40)

        if (isTineFill) {
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

            this.currentTotalIngredientText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
                .setText('??')
                .setOrigin(0, 0.5)
                .setStyle({ fill: '#EE843C', fontSize: fontSize })
                .setPosition(0, 0)

            this.craftUseIngredientText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
                .setText(`/${ingredient.amount}`)
                .setOrigin(0, 0.5)
                .setStyle({ fill: '#A7A7A7', fontSize: fontSize })
                .setPosition(0, 0)

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
