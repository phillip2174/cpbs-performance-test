import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { IngredientDesc } from '../Collection/IngredientDescBean'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { BoldText } from '../../../BoldText/BoldText'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class IngredientDescPreviewGroupView extends GameObjects.Container {
    public static readonly LENGTH_CUT_TEXT_TITLE_DESKTOP: number = 42
    public static readonly LENGTH_CUT_TEXT_TITLE_MOBILE: number = 24
    public static readonly MIN_SPACE_UNIT_AMOUNT: number = 50

    private rectRecipeDesc: GameObjects.Rectangle
    private cellRecipeGroup: GameObjects.Group
    private cellRecipeContainer: GameObjects.Container
    private widthSize: number

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(ingredientDesc: IngredientDesc[], width: number) {
        this.widthSize = width

        this.cellRecipeGroup = this.scene.add.group()

        ingredientDesc.forEach((iDesc, index) => {
            this.createUI(iDesc, index == 0)
        })

        if (ingredientDesc.length > 1)
            Phaser.Actions.AlignTo(this.cellRecipeGroup.getChildren(), Phaser.Display.Align.BOTTOM_CENTER, 0, 5)

        this.add(this.cellRecipeGroup.getChildren())

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public createUI(ingredientDesc: IngredientDesc, isFirstCell: boolean) {
        let cellRecipe = this.scene.add.container(0, 0)

        const isDesktop = DeviceChecker.instance.isDesktop()
        const title = TextAdapter.splitThaiStringByLegth(
            ingredientDesc.title,
            isDesktop
                ? IngredientDescPreviewGroupView.LENGTH_CUT_TEXT_TITLE_DESKTOP
                : IngredientDescPreviewGroupView.LENGTH_CUT_TEXT_TITLE_MOBILE
        )
        let positionMock = this.scene.add
            .rectangle(0, 0, this.widthSize - (isDesktop ? 40 : 32), 17 * title.length, 0xff0000, 0)
            .setOrigin(0.5, 0.5)

        cellRecipe.add(positionMock)

        let titleLineGroup: GameObjects.Container = this.scene.add.container()

        title.forEach((titleLine) => {
            var titleText: GameObjects.Text
            if (ingredientDesc.isCPProduct) {
                titleText = new BoldText(
                    this.scene,
                    0,
                    -positionMock.height / 2 + 8,
                    titleLine,
                    18,
                    '#585858'
                ).setOrigin(0, 0.5)
            } else {
                titleText = TextAdapter.instance
                    .getVectorText(this.scene, 'DB_HeaventRounded')
                    .setText(titleLine)
                    .setOrigin(0, 0.5)
                    .setPosition(0, -positionMock.height / 2 + 8)
                    .setStyle({ fill: '#585858', fontSize: 18 })
            }

            titleText.height = 17

            titleLineGroup.add(titleText)
        })

        Phaser.Actions.AlignTo(titleLineGroup.getAll(), Phaser.Display.Align.BOTTOM_LEFT)
        Phaser.Display.Align.In.LeftCenter(titleLineGroup, positionMock)

        if (ingredientDesc.isCPProduct) {
            let cpLogo = this.scene.add.image(0, 0, 'is-cp-logo')

            let lastText = titleLineGroup.getAll()[titleLineGroup.length - 1] as GameObjects.Text
            cpLogo.setPosition(titleLineGroup.x + lastText.width + cpLogo.width / 2, lastText.y)

            cellRecipe.add([cpLogo])
        }

        let yPositionText = titleLineGroup.getAll().length > 1 ? -positionMock.height / 2 + 8 : 0

        let unitText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(ingredientDesc.unit)
            .setOrigin(1, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#585858', fontSize: 18 })

        unitText.height = 17

        Phaser.Display.Align.In.RightCenter(unitText, positionMock)

        unitText.setPosition(unitText.x, yPositionText)

        let amountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(ingredientDesc.amount)
            .setOrigin(1, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#585858', fontSize: 18 })

        amountText.height = 17

        let minXPosition = unitText.width > 40 ? 50 + unitText.width - 40 : 50
        amountText.setPosition(positionMock.width / 2 - minXPosition, yPositionText)

        cellRecipe.add([unitText, amountText])

        cellRecipe.add([titleLineGroup])

        cellRecipe.width = cellRecipe.getBounds().width
        cellRecipe.height = cellRecipe.getBounds().height

        if (isFirstCell) {
            cellRecipe.setPosition(0, positionMock.height / 2 - 12)
        }

        this.cellRecipeGroup.add(cellRecipe)
    }
}
