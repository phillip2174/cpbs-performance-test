import { GameObjects, Scene } from 'phaser'
import { Subscription, delay, tap, timer } from 'rxjs'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CookingPod } from './../Pod/CookingPod'
import { CookingDetailState } from './CookingDetailState'
import { CookingPanelState } from './CookingPanelState'
import { TagRarityView } from '../Recipe/TagRarityView'
import { RewardPointCellView } from '../Recipe/RewardPointCellView'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { IngredientPreviewView } from '../Recipe/IngredientPreviewView'
import { RecipeBean } from '../Collection/RecipeBean'
import { RecipePod } from '../../pod/RecipePod'
import { TownUIPod } from '../Pod/TownUIPod'

export class CookingDetailSelectRecipeView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private cookingRecipeBackground: GameObjects.NineSlice
    private cookingRecipeNameText: GameObjects.Text

    private positionPointAndTagContainer: GameObjects.Container
    private positionPointAndTag: GameObjects.Rectangle

    private tagRarityView: TagRarityView
    private rewardPointCellView: RewardPointCellView

    private recipeAndIngredientContainer: GameObjects.Container
    private recipePreview: RecipePreviewView
    private ingredientPreview: IngredientPreviewView

    private positionButtonRect: GameObjects.Rectangle
    private buttonContainer: GameObjects.Container
    private cancelButton: Button
    private letsCookButton: Button

    private cookingPod: CookingPod

    private isDesktop: boolean
    private isIngredientAllFull: boolean = false

    private currnetRecipeBeanSubscription: Subscription
    private closeTimerSubscription: Subscription

    private recipeBean: RecipeBean
    private recipePod: RecipePod
    private townUIPod: TownUIPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.recipePod = PodProvider.instance.recipePod
        this.townUIPod = PodProvider.instance.townUIPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.setupCookingRecipeUI()
        this.setupSubscribe()
    }

    private setupCookingRecipeUI(): void {
        this.cookingRecipeBackground = this.scene.add.nineslice(
            0,
            0,
            'collection-card',
            '',
            this.isDesktop ? 420 : 328,
            490,
            30,
            30,
            30,
            30
        )

        this.setupTexts()
        this.createPointAndTag()
        this.createRecipeAndIngredient()
        this.setupButtons()
        this.setupButtonListeners()

        this.cookingRecipeBackground.setInteractive()
        this.add([
            this.cookingRecipeBackground,
            this.cookingRecipeNameText,
            this.recipeAndIngredientContainer,
            this.positionPointAndTagContainer,
            this.positionButtonRect,
            this.buttonContainer,
        ])
    }

    private setupSubscribe(): void {
        this.currnetRecipeBeanSubscription = this.cookingPod.currentRecipeBean.subscribe((recipeBean) => {
            this.cookingRecipeNameText.setText(recipeBean.secretUnlock ? 'เมนูลับมาสเตอร์เชฟ' : recipeBean.title)
            this.positionPointAndTagContainer.setPosition(
                0,
                this.cookingRecipeNameText.y +
                    this.cookingRecipeNameText.height / 2 +
                    this.cookingRecipeNameText.height / 2 +
                    15
            )

            console.log(this.cookingRecipeNameText.height)
            this.setCellMasterData(recipeBean)
            this.recipeBean = recipeBean
        })
    }

    private setupTexts(): void {
        this.cookingRecipeNameText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setOrigin(0.5, 0)
            .setText('?????????????????')
            .setStyle({ fill: '#585858', fontSize: 28 })
            .setPosition(0, -this.cookingRecipeBackground.height / 2 + 10)
    }

    private createPointAndTag() {
        this.positionPointAndTagContainer = this.scene.add.container(
            0,
            this.cookingRecipeNameText.y +
                this.cookingRecipeNameText.height / 2 +
                this.cookingRecipeNameText.height / 2 +
                15
        )

        this.positionPointAndTag = this.scene.add.rectangle(0, 0, 0, 0, 0xff00ff, 0)

        this.tagRarityView = new TagRarityView(this.scene, 0, 0)
        this.tagRarityView.doInit()

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.doInit()

        this.positionPointAndTagContainer.add([this.positionPointAndTag, this.tagRarityView, this.rewardPointCellView])
    }

    private createRecipeAndIngredient() {
        this.recipeAndIngredientContainer = this.scene.add.container(0, -30)

        this.recipePreview = new RecipePreviewView(this.scene, 0, 0).setScale(1)
        this.recipePreview.doInit()

        this.ingredientPreview = new IngredientPreviewView(this.scene, 0, 135)
        this.ingredientPreview.doInit()

        this.recipeAndIngredientContainer.add([this.recipePreview, this.ingredientPreview])
    }

    private setCellMasterData(recipeBean: RecipeBean) {
        let bean = recipeBean
        if (bean.secretUnlock) {
            this.tagRarityView.setSecretTag()
            this.recipePreview.setSecretRecipe(0x9bd6f8)
            this.rewardPointCellView.setDefaultPointCell(0.778)
        } else {
            this.recipePreview.setRecipePreviewMaster(bean.id)
            this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase())
            this.rewardPointCellView.setPointRewardCell(bean, 0.778)
        }

        this.ingredientPreview.setPreviewView(bean, 1, 5, true, 50)
        this.isIngredientAllFull = this.ingredientPreview.updateCellIngredientPreviewUser()
        this.recipePreview.setCellWithRecipeType(bean.type)

        this.letsCookButton.setCanInteract(this.isIngredientAllFull)

        this.setPointAndTagPosition()
    }

    public setCellWithUserRecipe() {}

    private setPointAndTagPosition() {
        let spacing = 10
        let sumWidth = this.tagRarityView.getBounds().width + this.rewardPointCellView.getBounds().width + spacing

        this.positionPointAndTag.setSize(sumWidth, 20)

        Phaser.Display.Align.To.LeftCenter(
            this.tagRarityView,
            this.positionPointAndTag,
            -this.tagRarityView.getBounds().width / 2
        )
        Phaser.Display.Align.To.RightCenter(
            this.rewardPointCellView,
            this.positionPointAndTag,
            -this.rewardPointCellView.width
        )
    }

    private setupButtons(): void {
        this.positionButtonRect = this.scene.add.rectangle(
            0,
            this.cookingRecipeBackground.height / 2 - 40,
            278,
            40,
            0xff00ff,
            0
        )

        this.buttonContainer = this.scene.add.container(0, 0)

        this.cancelButton = this.createButton(93, 40, 'button-white-bg', 'CANCEL', 0xee843c)

        this.letsCookButton = this.createButton(175, 40, 'button-white-bg', "LET'S COOK", 0x29cc6a)

        this.buttonContainer.add([this.cancelButton, this.letsCookButton])

        this.buttonContainer.width = this.buttonContainer.getBounds().width
        this.buttonContainer.height = this.buttonContainer.getBounds().height

        Phaser.Display.Align.To.LeftCenter(
            this.buttonContainer,
            this.positionButtonRect,
            -this.buttonContainer.width / 2 - this.cancelButton.width / 2
        )
        Phaser.Actions.AlignTo(this.buttonContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, 10)
    }

    private setupButtonListeners(): void {
        this.cancelButton.onClick(() => {
            this.townUIPod.setLayerScrollView(CookingDetailSelectRecipeView.SCROLL_VIEW_LAYER)
            this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
        })

        this.letsCookButton.onClick(() => {
            this.cookingPod.changeCookingDetailState(CookingDetailState.CookingAnimation)

            this.recipePod
                .cookedRecipeMenu(this.recipeBean)
                .pipe(
                    delay(4000),
                    tap((_) => {
                        this.cookingPod.changeCookingDetailState(CookingDetailState.CookingComplete)
                    })
                )
                .subscribe()
        })
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        colorBG: number,
        iconKey?: string
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 20,
            rightWidth: 20,
            topHeight: 1,
            bottomHeight: 1,
            safeAreaOffset: 0,
        })

        button.setTextStyle({
            fontFamily: 'DB_HeaventRounded_Bd',
            fill: 'white',
            fontSize: 22,
        })

        button.setTextPosition(0, 2)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }
}
