import { GameObjects, Scene } from 'phaser'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CookingPod } from '../Pod/CookingPod'
import { IngredientPreviewView } from '../Recipe/IngredientPreviewView'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { RewardPointCellView } from '../Recipe/RewardPointCellView'
import { TagRarityView } from '../Recipe/TagRarityView'
import { RecipeBean } from './../Collection/RecipeBean'
import { CookingDetailState } from './CookingDetailState'
import { CookingPanelState } from './CookingPanelState'
import { UserRecipe } from '../Collection/UserRecipe'
import { CookState } from '../Collection/type/CookState'
import { CookingCellState } from './type/CookingCellState'
import { RecipePod } from '../../pod/RecipePod'

export class CookingRecipeCellView extends GameObjects.Container {
    private recipeBackground: GameObjects.NineSlice
    private recipeNameText: GameObjects.Text

    private positionPointAndTagContainer: GameObjects.Container
    private positionPointAndTag: GameObjects.Rectangle

    private tagRarityView: TagRarityView
    private rewardPointCellView: RewardPointCellView

    private recipeAndIngredientContainer: GameObjects.Container
    private recipePreview: RecipePreviewView
    private ingredientPreview: IngredientPreviewView

    private recipeBackgroundWidth: number
    private recipeBackgroundHeight: number

    private selectButton: Button

    private isDesktop: boolean = false
    public isIngredientAllFull: boolean = false

    private cookingPod: CookingPod
    private recipePod: RecipePod

    private recipeBean: RecipeBean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(recipeBean: RecipeBean): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.recipePod = PodProvider.instance.recipePod

        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.recipeBackgroundWidth = this.isDesktop ? 196 : 170
        this.recipeBackgroundHeight = this.isDesktop ? 299 : 293
        this.recipeBean = recipeBean

        this.recipeBackground = this.scene.add.nineslice(
            0,
            0,
            'collection-card',
            '',
            this.recipeBackgroundWidth,
            this.recipeBackgroundHeight,
            30,
            30,
            30,
            30
        )

        this.recipeNameText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(this.recipeBean.secretUnlock ? 'เมนูลับมาสเตอร์เชฟ' : this.recipeBean.title)
            .setOrigin(0.5)
            .setStyle({ fill: '#585858' })
            .setPosition(0, -this.recipeBackgroundHeight / 2 + 25)

        this.createPointAndTag()
        this.createRecipeAndIngredient()

        this.isDesktop ? this.setupCellDesktop() : this.setupCellMobile()

        this.selectButton = this.createButton(89, 43, 'button-white-bg', 'SELECT', 0x29cc6a)
        this.selectButton.setPosition(0, this.recipeBackgroundHeight / 2 - 40)
        this.selectButton.onClick(() => {
            if (!this.cookingPod.isDragScrollViewCooking && !this.cookingPod.isDragScrollViewFilter) {
                this.cookingPod.setCurrentRecipeBean(this.recipeBean)
                this.cookingPod.changeCookingPanelState(CookingPanelState.CookingDetail)
                this.cookingPod.changeCookingDetailState(CookingDetailState.CookingSelectRecipe)
            }
        })

        this.setCellMasterData()

        this.add([
            this.recipeBackground,
            this.recipeNameText,
            this.positionPointAndTagContainer,
            this.recipeAndIngredientContainer,
            this.selectButton,
        ])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setCellWithUserRecipe(userRecipe: UserRecipe) {
        let bean: RecipeBean = this.recipeBean

        switch (userRecipe.state) {
            case CookState.Cooked:
                if (!bean.secretUnlock) this.setCellToUnlocked()
                this.handleButton(CookingCellState.Completed)
                break
            case CookState.Unlocked:
                this.handleButton(CookingCellState.Completed)
                this.setCellToUnlocked()
                break
        }

        this.isIngredientAllFull = false
    }

    private setCellToUnlocked() {
        let bean: RecipeBean = this.recipeBean
        this.recipeNameText.setText(this.recipeBean.title)
        this.recipePreview.setRecipePreviewMaster(bean.id)
        this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase(), 0.643)
        this.recipePreview.setCellWithRecipeType(bean.type)
    }

    public getBean(): RecipeBean {
        return this.recipeBean
    }

    private createPointAndTag() {
        this.positionPointAndTagContainer = this.scene.add.container(0, this.recipeNameText.y + 27)

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
        this.recipePreview.setSizeRecipe(94, 94)
        this.recipePreview.setSizeEffect(122, 100)

        this.ingredientPreview = new IngredientPreviewView(this.scene, 0, 70)
        this.ingredientPreview.doInit()

        this.recipeAndIngredientContainer.add([this.recipePreview, this.ingredientPreview])
    }

    private setCellMasterData() {
        let bean = this.recipeBean

        if (bean.secretUnlock) {
            // this.tagRarityView.setSecretTag()
            this.recipePreview.setSecretRecipe(0x9bd6f8)
        } else {
            this.recipePreview.setRecipePreviewMaster(bean.id)
        }

        this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase(), 0.643)
        this.rewardPointCellView.setPointRewardCell(bean, 0.5)
        this.ingredientPreview.setPreviewView(bean, this.isDesktop ? 0.693 : 0.65, 5, true)
        this.handleButton(CookingCellState.Uncook)

        this.isIngredientAllFull = this.ingredientPreview.updateCellIngredientPreviewUser()
        if (this.isIngredientAllFull && !bean.secretUnlock) {
            this.recipePreview.setCellWithRecipeType(bean.type)
            this.handleButton(CookingCellState.Ready)

            this.isIngredientAllFull = true
        } else if (this.isIngredientAllFull && bean.secretUnlock) {
            if (this.recipePod.totalUnlockedRecipe >= bean.secretUnlock.unlockRecipeAmount) {
                this.handleButton(CookingCellState.Ready)

                this.isIngredientAllFull = true
            } else {
                this.isIngredientAllFull = false
            }
        }

        this.setPointAndTagPosition()
    }

    private handleButton(cookingState: CookingCellState) {
        switch (cookingState) {
            case CookingCellState.Uncook:
            case CookingCellState.Secret:
                this.selectButton.setCanInteract(false, false)
                this.selectButton.clearTint()
                this.selectButton.setTintColorBackground(0xcecece)
                break
            case CookingCellState.Ready:
                this.selectButton.setCanInteract(true, false)
                this.selectButton.clearTint()
                this.selectButton.setTintColorBackground(0x29cc6a)
                break
            case CookingCellState.Completed:
                this.selectButton.setCanInteract(false, false)
                this.selectButton.setBackgroundButtonTexture('completed-icon')
                this.selectButton.setText('')
                this.selectButton.clearTint()
                break
        }
    }

    private setPointAndTagPosition() {
        let spacing = 5
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

    private setupCellMobile(): void {
        this.recipeNameText.setFontSize(18)
    }

    private setupCellDesktop(): void {
        this.recipeNameText.setFontSize(22)
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

        button.setTextPosition(0, 1)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }
}
