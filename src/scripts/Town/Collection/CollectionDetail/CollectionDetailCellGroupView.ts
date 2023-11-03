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

export class CollectionDetailCellGroupView extends GameObjects.Container {
    public static readonly WIDTH_SIZE_BG_MOBILE: number = 311
    public static readonly WIDTH_SIZE_BG_DESKTOP: number = 480
    public static readonly HEIGHT_FIRST_MIN_BG: number = 250
    public static readonly HEIGHT_SECOND_MIN_BG: number = 65

    public static readonly TEXT_OFFSET_MOBILE: number = 16
    public static readonly TEXT_OFFSET_DESKTOP: number = 20

    private firstContainer: GameObjects.Container
    private firstDetailCellBG: GameObjects.NineSlice
    private recipePreview: RecipePreviewView
    private ingredientPreview: IngredientPreviewView
    private rewardPointCellView: RewardPointCellView
    private recipeNameText: GameObjects.Text
    private recipeDescText: GameObjects.Text

    private secondContainer: GameObjects.Container
    private secondDetailCellBG: GameObjects.NineSlice
    private headerText: GameObjects.Text

    private ingredientDescContainer: GameObjects.Container

    private selectedSubscription: Subscription

    private collectionPod: CollectionPod

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.collectionPod = PodProvider.instance.collectionPod
        this.setCellWithState()

        this.createFirstCell()
        this.createSecondCell()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setActiveSecondCell(isActive: boolean) {
        if (isActive) {
            this.secondContainer.setVisible(true)
            this.secondContainer.setActive(true)
        } else {
            this.ingredientDescContainer?.removeAll(true)
            this.secondContainer.y = 0
            this.secondDetailCellBG.height = 0
            this.secondContainer.setVisible(false)
            this.secondContainer.setActive(false)
        }
    }

    private createFirstCell() {
        this.firstContainer = this.scene.add.container(0, 0)

        let sizeWidthBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailCellGroupView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailCellGroupView.WIDTH_SIZE_BG_MOBILE

        this.firstDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, 0, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.rewardPointCellView = new RewardPointCellView(this.scene, this.firstDetailCellBG.width / 2, 25)
        this.rewardPointCellView.doInit()

        this.recipePreview = new RecipePreviewView(this.scene, 0, 90).setScale(1)
        this.recipePreview.doInit()
        this.recipePreview.setSizeEffect(168, 133)

        this.ingredientPreview = new IngredientPreviewView(this.scene, 0, 180)
        this.ingredientPreview.doInit()

        this.recipeNameText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('????????????')
            .setOrigin(0, 0.5)
            .setPosition(0, 225)
            .setStyle({ fill: '#2B2B2B', fontSize: 22 })

        this.recipeNameText.width = this.recipeNameText.getBounds().width
        this.recipeNameText.height = this.recipeNameText.getBounds().height

        this.recipeDescText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('????????????')
            .setOrigin(0, 0)
            .setPosition(0, 230)
            .setStyle({ fill: '#585858', fontSize: 18 })

        const positionXText = this.scene.sys.game.device.os.desktop
            ? -this.firstDetailCellBG.width / 2 + CollectionDetailCellGroupView.TEXT_OFFSET_DESKTOP
            : -this.firstDetailCellBG.width / 2 + CollectionDetailCellGroupView.TEXT_OFFSET_MOBILE
        this.recipeNameText.setPosition(positionXText, 225)
        this.recipeDescText.setPosition(positionXText, 230)

        this.firstContainer.add([
            this.firstDetailCellBG,
            this.rewardPointCellView,
            this.recipePreview,
            this.ingredientPreview,
            this.recipeNameText,
            this.recipeDescText,
        ])
        this.add([this.firstContainer])

        this.firstDetailCellBG.height = this.firstContainer.getBounds().height
    }

    private createSecondCell() {
        this.secondContainer = this.scene.add.container(0, 0)

        let sizeWidthBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailCellGroupView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailCellGroupView.WIDTH_SIZE_BG_MOBILE

        this.secondDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, 0, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.headerText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('ส่วนผสม')
            .setOrigin(0.5, 0.5)
            .setPosition(0, 25)
            .setStyle({ fill: '#2B2B2B', fontSize: 24 })

        const offsetText = this.scene.sys.game.device.os.desktop
            ? CollectionDetailCellGroupView.TEXT_OFFSET_DESKTOP
            : CollectionDetailCellGroupView.TEXT_OFFSET_MOBILE
        this.headerText.setPosition(-this.secondDetailCellBG.width / 2 + this.headerText.width / 2 + offsetText, 25)

        this.ingredientDescContainer = this.scene.add.container(0, 60)

        this.secondContainer.add([this.secondDetailCellBG, this.headerText, this.ingredientDescContainer])
        this.add([this.secondContainer])

        this.secondDetailCellBG.height = this.secondContainer.getBounds().height
    }

    private setCellWithState() {
        this.selectedSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((bean) => {
            this.recipePreview.setRecipePreviewMaster(bean.id)
            this.ingredientPreview.setPreviewView(bean, 0.77)
            this.rewardPointCellView.setPointRewardCell(bean, 0.778)
            this.rewardPointCellView.setPosition(
                this.firstDetailCellBG.width / 2 - this.rewardPointCellView.width / 2 - 10,
                this.rewardPointCellView.y
            )
            this.recipeNameText.setText(bean.title)
            this.recipeDescText.setText(bean.description)

            if (bean.userRecipeBean) {
                this.recipePreview.setCellWithRecipeType(bean.type)
                this.ingredientPreview.updateClearTintAllCell()
                this.setActiveSecondCell(true)
                this.createIngredientDesc(bean)
                this.resizeBackgroundWithDesc(true)
            } else {
                this.setActiveSecondCell(false)
                this.resizeBackgroundWithDesc(false)
            }
        })
    }

    private createIngredientDesc(bean: RecipeBean) {
        this.ingredientDescContainer.removeAll(true)

        let cellDesc = new IngredientDescPreviewGroupView(this.scene, 0, 0)
        cellDesc.doInit(bean.ingredientDescs, this.secondDetailCellBG.width)
        this.ingredientDescContainer.add(cellDesc)
    }

    public resizeBackgroundWithDesc(setSecondCell: boolean) {
        this.recipeDescText.height = this.recipeDescText.getBounds().height

        this.firstDetailCellBG.height = CollectionDetailCellGroupView.HEIGHT_FIRST_MIN_BG + this.recipeDescText.height

        if (setSecondCell) {
            this.secondContainer.y = this.firstContainer.getBounds().height

            this.secondDetailCellBG.height =
                CollectionDetailCellGroupView.HEIGHT_SECOND_MIN_BG + this.ingredientDescContainer.getBounds().height
        }

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setActiveElement(isActive: boolean) {
        this.recipeNameText.setVisible(isActive)
        this.recipeNameText.setActive(isActive)

        this.recipeDescText.setVisible(isActive)
        this.recipeDescText.setActive(isActive)

        this.recipePreview.setVisible(isActive)
        this.recipePreview.setActive(isActive)

        this.ingredientPreview.setVisible(isActive)
        this.ingredientPreview.setActive(isActive)
    }
}
