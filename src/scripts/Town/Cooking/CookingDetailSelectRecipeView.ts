import { GameObjects, Scene } from 'phaser'
import { Observable, Subscription, forkJoin, timer } from 'rxjs'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { RecipePod } from '../../pod/RecipePod'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeBean } from '../Collection/RecipeBean'
import { TownUIPod } from '../Pod/TownUIPod'
import { IngredientPreviewView } from '../Recipe/IngredientPreviewView'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { RewardPointCellView } from '../Recipe/RewardPointCellView'
import { TagRarityView } from '../Recipe/TagRarityView'
import { CookingPod } from './../Pod/CookingPod'
import { CookingDetailState } from './CookingDetailState'
import { CookingPanelState } from './CookingPanelState'
import { BoldText } from '../../../BoldText/BoldText'
import { TutorialManager } from '../../Manager/TutorialManager'
import { TutorialState } from '../../../Tutorial/TutorialState'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class CookingDetailSelectRecipeView extends GameObjects.Container {
    public static readonly LENGTH_CUT_TEXT_TITLE_DESKTOP: number = 33
    public static readonly LENGTH_CUT_TEXT_TITLE_MOBILE: number = 28
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
    private tutorialManager: TutorialManager

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
        this.tutorialManager = PodProvider.instance.tutorialManager
        this.isDesktop = DeviceChecker.instance.isDesktop()
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
            const title = TextAdapter.splitThaiStringByLegth(
                recipeBean.title,
                this.isDesktop
                    ? CookingDetailSelectRecipeView.LENGTH_CUT_TEXT_TITLE_DESKTOP
                    : CookingDetailSelectRecipeView.LENGTH_CUT_TEXT_TITLE_MOBILE
            )
            this.cookingRecipeNameText.setText(recipeBean.secretUnlock ? 'เมนูลับมาสเตอร์เชฟ' : title)
            this.positionPointAndTagContainer.setPosition(
                0,
                this.cookingRecipeNameText.y +
                    this.cookingRecipeNameText.height / 2 +
                    this.cookingRecipeNameText.height / 2 +
                    15
            )

            this.setCellMasterData(recipeBean)
            this.recipeBean = recipeBean
        })

        this.on('destroy', () => {
            this.currnetRecipeBeanSubscription?.unsubscribe()
        })
    }

    private setupTexts(): void {
        this.cookingRecipeNameText = new BoldText(
            this.scene,
            0,
            -this.cookingRecipeBackground.height / 2 + 10,
            '?????????????????',
            28,
            '#585858'
        )
            .setOrigin(0.5, 0)
            .setAlign('center')
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
        this.tagRarityView.createTagLarge()

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.createMediumTag()

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
            this.rewardPointCellView.setPointCell('??', -1, -1)
        } else {
            this.recipePreview.setRecipePreviewMaster(bean.id)
            this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase())
            this.rewardPointCellView.setPointCell(bean.rewardPoint.toString(), -1, -1)
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
        let sumWidth = this.tagRarityView.getWidthBG() + this.rewardPointCellView.getWidthBG() + spacing

        this.positionPointAndTag.setSize(sumWidth, 28)

        this.tagRarityView.x = -this.positionPointAndTag.width / 2 + this.tagRarityView.getWidthBG() / 2
        this.rewardPointCellView.x = this.positionPointAndTag.width / 2 - this.rewardPointCellView.getWidthBG() / 2
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

        this.cancelButton = this.createButton(93, 40, 'small-button-white-bg', 'CANCEL', 0xee843c)

        this.letsCookButton = this.createButton(175, 40, 'small-button-white-bg', "LET'S COOK", 0x29cc6a)

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

        if (!this.tutorialManager.isCompletedTutorial()) {
            this.cancelButton.setCanInteract(false, true)
        }

        this.letsCookButton.onClick(() => {
            this.cookingPod.changeCookingDetailState(CookingDetailState.CookingAnimation)

            let observableInit: Observable<any>[] = []

            let cookedMenu = this.recipePod.cookedRecipeMenu(this.recipeBean)
            observableInit.push(cookedMenu)

            let timerLoadingDelay = timer(4000)
            observableInit.push(timerLoadingDelay)

            forkJoin(observableInit).subscribe((_) => {
                if (!this.tutorialManager.isCompletedTutorial()) {
                    this.tutorialManager.updateCurrentToNextTutorial()
                    this.tutorialManager.setTutorialState(TutorialState.CountDown)
                }

                this.cookingPod.changeCookingDetailState(CookingDetailState.CookingComplete)
            })
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
            rightWidth: 22,
            topHeight: 17,
            bottomHeight: 20,
            safeAreaOffset: 0,
        })

        button.setTextStyle(
            {
                fontFamily: 'DB_HeaventRounded_Bd',
                fill: 'white',
                fontSize: 22,
            },
            !DeviceChecker.instance.isAppleOS()
        )

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
