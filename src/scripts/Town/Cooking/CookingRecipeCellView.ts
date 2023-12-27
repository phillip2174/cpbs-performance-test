import { GameObjects, Scene, Tweens } from 'phaser'
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
import { Subscription } from 'rxjs'
import { AnimationController } from '../AnimationController'
import { BoldText } from '../../../BoldText/BoldText'
import { TutorialState } from '../../../Tutorial/TutorialState'
import { TutorialStepState } from '../../../Tutorial/TutorialStepState'
import { TutorialManager } from '../../Manager/TutorialManager'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { IScrollViewCallBack } from '../../ScrollView/IScrollViewCallBack'

export class CookingRecipeCellView extends GameObjects.Container implements IScrollViewCallBack {
    public static readonly LENGTH_CUT_TEXT: number = 20
    public cellPageIndex: number
    private cookingCellState: CookingCellState
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

    private cellButton: Button
    private selectButton: Button

    private isDesktop: boolean = false
    public isReady: boolean = false

    private onClickDownTweener: Tweens.Tween
    private onClickUpTweener: Tweens.Tween
    private onHoverButtonIconTween: Tweens.TweenChain
    private onLeaveButtonIconTween: Tweens.TweenChain

    private onLeaveButtonTextTween: Tweens.Tween
    private onHoverButtonTextTween: Tweens.Tween

    private cookingPod: CookingPod
    private recipePod: RecipePod
    private tutorialManager: TutorialManager

    public recipeBean: RecipeBean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(recipeBean: RecipeBean, cellPageIndex: number): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.recipePod = PodProvider.instance.recipePod
        this.tutorialManager = PodProvider.instance.tutorialManager

        this.cellPageIndex = cellPageIndex

        this.isDesktop = DeviceChecker.instance.isDesktop()
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

        const title = TextAdapter.splitThaiStringByLegth(this.recipeBean.title, CookingRecipeCellView.LENGTH_CUT_TEXT)
        this.recipeNameText = new BoldText(
            this.scene,
            0,
            -this.recipeBackgroundHeight / 2 + 25,
            this.recipeBean.secretUnlock ? 'เมนูลับมาสเตอร์เชฟ' : title.length > 1 ? `${title[0]}...` : title[0],
            18,
            '#585858'
        )

        this.createPointAndTag()
        this.createRecipeAndIngredient()

        this.isDesktop ? this.setupCellDesktop() : this.setupCellMobile()

        this.cellButton = new Button(
            this.scene,
            0,
            -this.recipeBackgroundHeight / 2 + this.recipeBackgroundHeight / 4 + 20,
            this.recipeBackgroundWidth,
            this.recipeBackgroundHeight / 2 + 20,
            ''
        ).setAlpha(0.01)

        this.selectButton = this.createButton(89, 40, 'small-button-white-bg', 'SELECT', 0x29cc6a)
        this.selectButton.setPosition(0, this.recipeBackgroundHeight / 2 - 40)

        this.setActionButton()
        this.setCellMasterData()
        this.createTween()

        this.add([
            this.recipeBackground,
            this.recipeNameText,
            this.positionPointAndTagContainer,
            this.recipeAndIngredientContainer,
            this.cellButton,
            this.selectButton,
        ])

        this.width = this.getBounds().width
        this.height = this.getBounds().height

        //IF TUTORIAL RECIPE > 1 MUST HANDLE CHECK ID RECIPE TO OPEN
        if (!this.tutorialManager.isCompletedTutorial()) {
            switch (this.tutorialManager.tutorialStepID.value) {
                case TutorialStepState.SelectCooking:
                    this.tutorialManager.currentActionOnClick = () => {
                        this.doOnClickButton()
                        this.tutorialManager.currentActionOnClick = undefined
                    }
                    break
                case TutorialStepState.CompleteCooking:
                    this.tutorialManager.currentActionOnClick = () => {
                        this.doOnReopenTutorialCompletedCooked()
                        this.tutorialManager.currentActionOnClick = undefined
                    }
                    break
            }
        }
    }

    public setCellWithUserRecipe(userRecipe: UserRecipe) {
        let bean: RecipeBean = this.recipeBean

        switch (userRecipe.state) {
            case CookState.Cooked:
                if (!bean.secretUnlock) this.setCellToCompleted()
                this.handleButton(CookingCellState.Completed)
                this.cookingCellState = CookingCellState.Completed
                break
            case CookState.Unlocked:
                this.handleButton(CookingCellState.Completed)
                this.setCellToCompleted()
                this.cookingCellState = CookingCellState.Completed
                break
        }

        this.setPointAndTagPosition()
        this.isReady = false
    }

    public setInteractButtonScrollView(isCanInteract: boolean) {
        if (isCanInteract) {
            //this.setVisible(true)
            this.handleButton(this.cookingCellState)
            this.cellButton.setCanInteract(true, false)
        } else {
            //this.setVisible(false)
            this.selectButton.setCanInteract(false, false)
            this.cellButton.setCanInteract(false, false)
        }
    }

    private doOnClickButton() {
        if (!this.cookingPod.isDragScrollViewCooking && !this.cookingPod.isDragScrollViewFilter) {
            this.cookingPod.setCurrentRecipeBean(this.recipeBean)
            this.cookingPod.changeCookingPanelState(CookingPanelState.CookingDetail)
            this.cookingPod.changeCookingDetailState(CookingDetailState.CookingSelectRecipe)
        }
    }

    private doOnReopenTutorialCompletedCooked() {
        this.cookingPod.setCurrentRecipeBean(this.recipeBean)
        this.cookingPod.changeCookingPanelState(CookingPanelState.CookingDetail)
        this.cookingPod.changeCookingDetailState(CookingDetailState.CookingComplete)
    }

    private setActionButton() {
        // this.cellButton.onClick(
        //     () => {
        //         this.doOnClickButton()
        //         this.onClickUpTweener?.restart()
        //         if (this.isReady) {
        //         }
        //     },
        //     () => {
        //         if (this.isReady) this.onClickDownTweener?.restart()
        //     },
        //     () => {
        //         if (this.isReady) this.onClickUpTweener?.restart()
        //     }
        // )

        this.selectButton.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.doOnClickButton()

                if (DeviceChecker.instance.isDesktop()) {
                    if (this.isReady) this.onLeaveButton()
                }
            } else {
                this.tutorialManager.updateCurrentToNextTutorial()
                this.tutorialManager.setTutorialState(TutorialState.ShowUI)

                this.tutorialManager.currentActionOnClick = () => {
                    this.doOnClickButton()
                }
                if (DeviceChecker.instance.isDesktop()) {
                    if (this.isReady) this.onLeaveButton()
                }
            }
        })

        if (DeviceChecker.instance.isDesktop()) {
            this.cellButton.on('pointerover', () => {
                if (this.isReady) this.onHoverButton()
            })

            this.selectButton.on('pointerover', () => {
                if (this.isReady) this.onHoverButton()
            })

            this.cellButton.on('pointerout', () => {
                if (this.isReady) this.onLeaveButton()
            })

            this.selectButton.on('pointerout', () => {
                if (this.isReady) this.onLeaveButton()
            })
        }
    }

    private setCellToCompleted() {
        let bean: RecipeBean = this.recipeBean
        const title = TextAdapter.splitThaiStringByLegth(this.recipeBean.title, CookingRecipeCellView.LENGTH_CUT_TEXT)
        this.recipeNameText.setText(title.length > 1 ? `${title[0]}...` : title[0])
        this.recipePreview.setRecipePreviewMaster(bean.id)
        this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase())
        this.recipePreview.setCellWithRecipeType(bean.type)
        this.rewardPointCellView.setPointCell(bean.rewardPoint.toString())
    }

    public getBean(): RecipeBean {
        return this.recipeBean
    }

    private createPointAndTag() {
        this.positionPointAndTagContainer = this.scene.add.container(0, this.recipeNameText.y + 27)

        this.positionPointAndTag = this.scene.add.rectangle(0, 0, 0, 0, 0xff00ff, 0)

        this.tagRarityView = new TagRarityView(this.scene, 0, 0)
        this.tagRarityView.createTagSmall()

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.createSmallTag()

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
            this.tagRarityView.setSecretTag(0.643)
            this.recipePreview.setSecretRecipe(0x9bd6f8)
            this.rewardPointCellView.setPointCell('??')
        } else {
            this.recipePreview.setRecipePreviewMaster(bean.id)
            this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase())
            this.rewardPointCellView.setPointCell(bean.rewardPoint.toString())
        }

        this.ingredientPreview.setPreviewView(bean, this.isDesktop ? 0.693 : 0.65, 5, true, 10, 0, true)
        this.handleButton(bean.secretUnlock ? CookingCellState.Secret : CookingCellState.Uncook)
        this.cookingCellState = bean.secretUnlock ? CookingCellState.Secret : CookingCellState.Uncook

        this.isReady = this.ingredientPreview.updateCellIngredientPreviewUser()
        if (this.isReady && !bean.secretUnlock) {
            this.recipePreview.setCellWithRecipeType(bean.type)
            this.handleButton(CookingCellState.Ready)
            this.cookingCellState = CookingCellState.Ready

            this.isReady = true
        } else if (this.isReady && bean.secretUnlock) {
            if (this.recipePod.totalUnlockedRecipe >= bean.secretUnlock.unlockRecipeAmount) {
                this.handleButton(CookingCellState.Ready)
                this.cookingCellState = CookingCellState.Ready

                this.isReady = true
            } else {
                this.isReady = false
            }
        } else if (!this.isReady && bean.secretUnlock) {
            if (this.recipePod.totalUnlockedRecipe >= bean.secretUnlock.unlockRecipeAmount) {
                this.handleButton(CookingCellState.Uncook)
                this.cookingCellState = CookingCellState.Uncook
            }
        }

        this.setPointAndTagPosition()
    }

    private handleButton(cookingState: CookingCellState) {
        switch (cookingState) {
            case CookingCellState.Uncook:
                this.selectButton.setCanInteract(false, false)
                this.selectButton.clearTint()
                this.selectButton.setTintColorBackground(0xcecece)
                this.setButtonTextDefault()
                break
            case CookingCellState.Ready:
                this.isReady = true
                this.selectButton.setCanInteract(true, false)
                this.selectButton.clearTint()
                this.selectButton.setTintColorBackground(0x29cc6a)
                this.setButtonTextDefault()
                break
            case CookingCellState.Completed:
                this.selectButton.setCanInteract(false, false)
                this.selectButton.setBackgroundButtonTexture('completed-icon')
                this.selectButton.setText('')
                this.selectButton.setButtonSize(80, 40)
                this.selectButton.clearTint()
                break
            case CookingCellState.Secret:
                this.selectButton.setCanInteract(false, false)
                this.selectButton.clearTint()
                this.selectButton.setTintColorBackground(0xcecece)
                this.setButtonTextSecret()
                break
        }
    }

    private setButtonTextDefault() {
        this.selectButton.setText('SELECT')
        this.selectButton.setButtonSize(89, 43)
    }

    private setButtonTextSecret() {
        this.selectButton.setText(
            `COLLECTED ${this.recipePod.totalUnlockedRecipe}/${this.recipeBean.secretUnlock.unlockRecipeAmount}`
        )
        this.selectButton.setButtonSize(this.selectButton.label.width + 30, 43)
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

        button.setTextPosition(0, 1)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }

    private onHoverButton(): void {
        this.onHoverButtonIconTween?.restart()
        this.onHoverButtonTextTween?.restart()

        this.recipePreview?.onHover()
    }

    private onLeaveButton(): void {
        this.onLeaveButtonIconTween?.restart()
        this.onLeaveButtonTextTween?.restart()

        this.recipePreview?.onLeave()
    }

    private createTween() {
        this.onClickDownTweener = this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: `Quad.easeInOut`,
            props: {
                scale: { from: this.scale, to: 0.9 },
            },
            persist: true,
            paused: true,
        })

        this.onClickUpTweener = this.scene.tweens.add({
            targets: this,
            ease: 'Cubic.easeInOut',
            duration: 200,
            props: {
                scale: { from: this.scale, to: 1 },
            },
            persist: true,
            paused: true,
        })

        if (DeviceChecker.instance.isDesktop()) {
            let tweenOnHover = AnimationController.instance.tweenHoverButton(
                this.scene,
                undefined, //Change when have notification tag
                () => {
                    this.recipeNameText?.setStyle({ fill: '#EE843C' })
                }
            )
            let tweenOnLeaveHover = AnimationController.instance.tweenLeaveHoverButton(
                this.scene,
                undefined, //Change when have notification tag
                () => {
                    this.recipeNameText?.setStyle({ fill: '#585858' })
                }
            )
            this.onHoverButtonIconTween = tweenOnHover.onHoverButtonIconTween

            this.onLeaveButtonIconTween = tweenOnLeaveHover.onLeaveHoverButtonIconTween

            this.onHoverButtonTextTween = tweenOnHover.onHoverButtonTextTween

            this.onLeaveButtonTextTween = tweenOnLeaveHover.onLeaveHoverButtonTextTween
        }
    }

    destroy(fromScene?: boolean): void {
        this.onHoverButtonIconTween?.destroy()
        this.onHoverButtonTextTween?.destroy()

        this.onLeaveButtonIconTween?.destroy()
        this.onLeaveButtonTextTween?.destroy()
        super.destroy(fromScene)
    }
}
