import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../../plugins/objects/GameObjectConstructor'
import { IngredientPreviewView } from '../../Recipe/IngredientPreviewView'
import { RewardPointCellView } from '../../Recipe/RewardPointCellView'
import { Subscription } from 'rxjs'
import { CollectionPod } from '../../Pod/CollectionPod'
import { PodProvider } from '../../../pod/PodProvider'
import { TextAdapter } from '../../../text-adapter/TextAdapter'
import { RecipeBean } from '../RecipeBean'
import { CookState } from '../type/CookState'
import { CollectionDetailRecipeTweenView } from '../../CollectionDetail/CollectionDetailRecipeTweenView'
import { RecipePreviewView } from '../../Recipe/RecipePreviewView'
import { IngredientDescPreviewGroupView } from '../../Recipe/IngredientDescPreviewGroupView'
import { CollectionDetailState } from '../type/CollectionDetailState'
import { BoldText } from '../../../../BoldText/BoldText'
import { DeviceChecker } from '../../../plugins/DeviceChecker'
import { TagRarityView } from '../../Recipe/TagRarityView'

export class CollectionDetailCellGroupView extends GameObjects.Container {
    public static readonly LENGTH_CUT_TEXT_TITLE_DESKTOP: number = 30
    public static readonly LENGTH_CUT_TEXT_TITLE_MOBILE: number = 25

    public static readonly WIDTH_SIZE_BG_MOBILE: number = 311
    public static readonly WIDTH_SIZE_BG_DESKTOP: number = 480
    public static readonly HEIGHT_FIRST_MIN_BG: number = 270
    public static readonly HEIGHT_TITLE_DESKTOP: number = 32
    public static readonly HEIGHT_TITLE_MOBILE: number = 28

    public static readonly HEIGHT_OFFSET_TAG: number = 25
    public static readonly HEIGHT_OFFSET_RECIPE: number = 25
    public static readonly HEIGHT_OFFSET_INGREDIENT: number = 25

    public static readonly TEXT_OFFSET_MOBILE: number = 16
    public static readonly TEXT_OFFSET_DESKTOP: number = 12

    private firstContainer: GameObjects.Container
    private firstDetailCellBG: GameObjects.NineSlice
    private recipePreview: RecipePreviewView
    private ingredientPreview: IngredientPreviewView

    private positionPointAndTagContainer: GameObjects.Container
    private positionPointAndTag: GameObjects.Rectangle
    private rewardPointCellView: RewardPointCellView
    private tagRarityView: TagRarityView

    private recipeNameMockPosition: GameObjects.Rectangle
    private recipeNameText: GameObjects.Text

    private isDesktop: boolean = false

    private selectedSubscription: Subscription

    private collectionPod: CollectionPod

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.collectionPod = PodProvider.instance.collectionPod
        this.setCellWithState()

        this.createFirstCell()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private createFirstCell() {
        this.firstContainer = this.scene.add.container(0, 0)

        let sizeWidthBG = DeviceChecker.instance.isDesktop()
            ? CollectionDetailCellGroupView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailCellGroupView.WIDTH_SIZE_BG_MOBILE

        this.firstDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, 0, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.recipePreview = new RecipePreviewView(this.scene, 0, 90).setScale(1)
        this.recipePreview.doInit()
        this.recipePreview.setSizeRecipe(154, 154)
        this.recipePreview.setSizeEffect(208, 160)

        this.ingredientPreview = new IngredientPreviewView(this.scene, 0, 180)
        this.ingredientPreview.doInit()

        this.recipeNameText = new BoldText(
            this.scene,
            0,
            225,
            '????????????',
            this.isDesktop
                ? CollectionDetailCellGroupView.HEIGHT_TITLE_DESKTOP
                : CollectionDetailCellGroupView.HEIGHT_TITLE_MOBILE,
            '#2B2B2B'
        )
            .setOrigin(0.5, 0.5)
            .setAlign('center')

        this.recipeNameText.width = this.recipeNameText.getBounds().width
        this.recipeNameText.height = this.recipeNameText.getBounds().height

        this.recipeNameText.setPosition(0, 20)

        this.recipeNameMockPosition = this.scene.add
            .rectangle(
                0,
                20,
                this.firstDetailCellBG.width,
                this.isDesktop
                    ? CollectionDetailCellGroupView.HEIGHT_TITLE_DESKTOP
                    : CollectionDetailCellGroupView.HEIGHT_TITLE_MOBILE,
                0xff00ff,
                0
            )
            .setOrigin(0.5, 0)

        this.createPointAndTag()

        this.setPositionElement()

        this.firstContainer.add([
            this.firstDetailCellBG,
            this.recipePreview,
            this.ingredientPreview,
            this.recipeNameMockPosition,
            this.recipeNameText,
            this.positionPointAndTagContainer,
        ])
        this.add([this.firstContainer])

        this.firstDetailCellBG.height = this.firstContainer.getBounds().height
    }

    private createPointAndTag() {
        this.positionPointAndTagContainer = this.scene.add.container(
            0,
            this.recipeNameMockPosition.y +
                this.recipeNameMockPosition.height +
                CollectionDetailCellGroupView.HEIGHT_OFFSET_TAG
        )

        this.positionPointAndTag = this.scene.add.rectangle(0, 0, 0, 0, 0xff00ff, 0)

        this.tagRarityView = new TagRarityView(this.scene, 0, 0)
        this.tagRarityView.createTagLarge()

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.createMediumTag()

        this.positionPointAndTagContainer.add([this.positionPointAndTag, this.tagRarityView, this.rewardPointCellView])
    }

    private setPointAndTagPosition() {
        let spacing = 10
        let sumWidth = this.tagRarityView.getWidthBG() + this.rewardPointCellView.getWidthBG() + spacing

        this.positionPointAndTag.setSize(sumWidth, 28)

        this.tagRarityView.x = -this.positionPointAndTag.width / 2 + this.tagRarityView.getWidthBG() / 2
        this.rewardPointCellView.x = this.positionPointAndTag.width / 2 - this.rewardPointCellView.getWidthBG() / 2
    }

    private setPositionElement() {
        this.setPointAndTagPosition()
        this.recipePreview.setPosition(
            0,
            this.positionPointAndTagContainer.y +
                this.recipePreview.height / 2 +
                CollectionDetailCellGroupView.HEIGHT_OFFSET_RECIPE
        )

        this.ingredientPreview.setPosition(
            0,
            this.recipePreview.y +
                this.recipePreview.height / 2 +
                CollectionDetailCellGroupView.HEIGHT_OFFSET_INGREDIENT
        )
    }

    private setCellWithState() {
        this.selectedSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((bean) => {
            this.recipePreview.setRecipePreviewMaster(bean.id)
            this.ingredientPreview.setPreviewView(bean, 1.1, 8, true, 15, 15, false, 0)
            this.ingredientPreview.setBackgroundToReady()
            this.rewardPointCellView.setPointCell(bean.rewardPoint.toString())
            this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase())

            this.setPointAndTagPosition()

            const title = TextAdapter.splitThaiStringByLegth(
                bean.title,
                this.isDesktop
                    ? CollectionDetailCellGroupView.LENGTH_CUT_TEXT_TITLE_DESKTOP
                    : CollectionDetailCellGroupView.LENGTH_CUT_TEXT_TITLE_MOBILE
            )
            this.recipeNameText.setText(title)
            this.recipeNameText.height = 0
            this.recipeNameText.height =
                (this.isDesktop
                    ? CollectionDetailCellGroupView.HEIGHT_TITLE_DESKTOP
                    : CollectionDetailCellGroupView.HEIGHT_TITLE_MOBILE + 2) * title.length //+ (title.length > 1 ? CollectionDetailCellGroupView.HEIGHT_TITLE_OFFSET : 0) //22 * title.length
            this.recipeNameMockPosition.setSize(this.firstDetailCellBG.width - 30, this.recipeNameText.height)

            Phaser.Display.Align.In.Center(this.recipeNameText, this.recipeNameMockPosition, 0, -5)

            this.positionPointAndTagContainer.setPosition(
                0,
                this.recipeNameMockPosition.y +
                    this.recipeNameMockPosition.height +
                    CollectionDetailCellGroupView.HEIGHT_OFFSET_TAG
            )

            if (bean.userRecipeBean) {
                this.recipePreview.setCellWithRecipeType(bean.type)
                this.ingredientPreview.updateClearTintAllCell()

                this.resizeBackground()
            } else {
                this.resizeBackground()
            }

            this.setPositionElement()
        })

        this.on('destroy', () => {
            this.selectedSubscription?.unsubscribe()
        })
    }

    private resizeBackground() {
        this.firstDetailCellBG.height =
            CollectionDetailCellGroupView.HEIGHT_FIRST_MIN_BG +
            this.recipeNameMockPosition.height +
            this.positionPointAndTag.height +
            this.ingredientPreview.height

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public getHeightBGFirst(): number {
        return this.firstDetailCellBG.height + 8
    }

    private setActiveElement(isActive: boolean) {
        this.recipeNameText.setVisible(isActive)
        this.recipeNameText.setActive(isActive)

        this.recipePreview.setVisible(isActive)
        this.recipePreview.setActive(isActive)

        this.ingredientPreview.setVisible(isActive)
        this.ingredientPreview.setActive(isActive)
    }
}
