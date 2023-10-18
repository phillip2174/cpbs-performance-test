import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../../plugins/objects/GameObjectConstructor'
import { CollectionPod } from '../../Pod/CollectionPod'
import { PodProvider } from '../../../pod/PodProvider'
import { RecipePreviewView } from '../../Recipe/RecipePreviewView'
import { IngredientPreviewView } from '../../Recipe/IngredientPreviewView'
import { RewardPointCellView } from '../../Recipe/RewardPointCellView'
import { Subscription } from 'rxjs'
import { TextAdapter } from '../../../text-adapter/TextAdapter'
import { SecretRecipeBean } from '../SecretRecipeBean'
import { RecipePod } from '../../../pod/RecipePod'

export class CollectionDetailSecretCellView extends GameObjects.Container {
    public static readonly WIDTH_SIZE_BG_MOBILE: number = 311
    public static readonly HEIGHT_SIZE_BG_MOBILE: number = 381
    public static readonly WIDTH_SIZE_BG_DESKTOP: number = 480
    public static readonly HEIGHT_SIZE_BG_DESKTOP: number = 392
    public static readonly SPACING_TEXT_PROGRESS: number = 5
    public static readonly PROGRESS_COLOR_CODE: string = '#E8AE37'
    public static readonly SUCCESS_COLOR_CODE: string = '#29CC6A'

    private secretContainer: GameObjects.Container
    private textContainer: GameObjects.Container

    private firstDetailCellBG: GameObjects.NineSlice

    private headerText: GameObjects.Text
    private footerFirstText: GameObjects.Text
    private footerSecondText: GameObjects.Text
    private footerThirdText: GameObjects.Text

    private positionTextRect: GameObjects.Rectangle

    private currentRecipeText: GameObjects.Text
    private goalRecipeText: GameObjects.Text

    private selectedSubscription: Subscription

    private recipePreview: RecipePreviewView
    private ingredientPreview: IngredientPreviewView
    private rewardPointCellView: RewardPointCellView

    private collectionPod: CollectionPod
    private recipePod: RecipePod
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.collectionPod = PodProvider.instance.collectionPod
        this.recipePod = PodProvider.instance.recipePod
        this.createUI()
        this.setSubscription()
    }

    public setTextAndPosition(secretUnlock: SecretRecipeBean) {
        let totalUnlocked = this.recipePod.totalUnlockedRecipe

        this.currentRecipeText.setColor(
            totalUnlocked >= secretUnlock.unlockRecipeAmount
                ? CollectionDetailSecretCellView.SUCCESS_COLOR_CODE
                : CollectionDetailSecretCellView.PROGRESS_COLOR_CODE
        )

        this.currentRecipeText.setText(totalUnlocked.toString())
        this.goalRecipeText.setText(`/${secretUnlock.unlockRecipeAmount.toString()}`)
        this.setPositionProgressText()
    }

    private setSubscription() {
        this.selectedSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((bean) => {
            if (bean.secretUnlock) {
                this.ingredientPreview.setPreviewView(bean, 0.77)
                this.setTextAndPosition(bean.secretUnlock)
                this.recipePreview.setSecretRecipe(0xe1e1e1)
            }
        })
    }

    private createUI() {
        let isDesktop = this.scene.sys.game.device.os.desktop

        this.secretContainer = this.scene.add.container()

        let sizeWidthBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailSecretCellView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailSecretCellView.WIDTH_SIZE_BG_MOBILE

        let sizeHeightBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailSecretCellView.HEIGHT_SIZE_BG_DESKTOP
            : CollectionDetailSecretCellView.HEIGHT_SIZE_BG_MOBILE

        this.firstDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, sizeHeightBG, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.rewardPointCellView = new RewardPointCellView(this.scene, this.firstDetailCellBG.width / 2 - 43, 30)
        this.rewardPointCellView.doInit(0.778)

        this.recipePreview = new RecipePreviewView(this.scene, 0, isDesktop ? 130 : 100).setScale(1)
        this.recipePreview.doInit()
        this.recipePreview.setSizeEffect(168, 133)

        this.ingredientPreview = new IngredientPreviewView(this.scene, 0, isDesktop ? 220 : 190)
        this.ingredientPreview.doInit()

        this.headerText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(
                this.scene.sys.game.device.os.desktop
                    ? 'เมนูลับมาสเตอร์เชฟ จะเป็นเมนูแบบไหนนะ??'
                    : 'เมนูลับมาสเตอร์เชฟ\nจะเป็นเมนูแบบไหนนะ??'
            )
            .setOrigin(0.5)
            .setPosition(0, isDesktop ? this.firstDetailCellBG.height - 115 : this.firstDetailCellBG.height - 125)
            .setStyle({ fill: '#EE843C', fontSize: 28 })
            .setAlign('center')

        this.textContainer = this.scene.add.container(0, isDesktop ? 320 : 315)

        this.footerFirstText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('ปรุงอาหารให้ครบ')
            .setOrigin(0, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#585858', fontSize: 24 })

        this.currentRecipeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('0')
            .setOrigin(0, 0.5)
            .setPosition(0, -2)
            .setStyle({ fill: CollectionDetailSecretCellView.PROGRESS_COLOR_CODE, fontSize: 32 })

        this.goalRecipeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('/99')
            .setOrigin(0, 0.5)
            .setPosition(0, -2)
            .setStyle({ fill: '#585858', fontSize: 32 })

        this.footerSecondText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('เมนู')
            .setOrigin(0, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#585858', fontSize: 24 })

        this.textContainer.add([
            this.footerFirstText,
            this.currentRecipeText,
            this.goalRecipeText,
            this.footerSecondText,
        ])

        this.footerThirdText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('เพื่อปลดล็อกเมนูลับ!!')
            .setOrigin(0.5)
            .setPosition(0, isDesktop ? 345 : 340)
            .setStyle({ fill: '#585858', fontSize: 24 })

        this.positionTextRect = this.scene.add.rectangle(0, isDesktop ? 320 : 315, this.sunTextWidth(), 20, 0xff00ff, 0)

        this.secretContainer.add([
            this.firstDetailCellBG,
            this.rewardPointCellView,
            this.recipePreview,
            this.ingredientPreview,
            this.headerText,
            this.textContainer,
            this.footerThirdText,
            this.positionTextRect,
        ])

        this.add(this.secretContainer)

        this.setPositionProgressText()
    }

    private setPositionProgressText() {
        this.positionTextRect.setSize(this.sunTextWidth(), 20)

        let spacing = CollectionDetailSecretCellView.SPACING_TEXT_PROGRESS / 2
        Phaser.Display.Align.To.LeftCenter(this.textContainer, this.positionTextRect)

        this.currentRecipeText.x = this.footerFirstText.x + this.footerFirstText.width + spacing
        this.goalRecipeText.x = this.currentRecipeText.x + this.currentRecipeText.width
        this.footerSecondText.x = this.goalRecipeText.x + this.goalRecipeText.width + spacing
    }

    private sunTextWidth() {
        return (
            this.footerFirstText.width +
            this.currentRecipeText.width +
            this.goalRecipeText.width +
            this.footerSecondText.width +
            CollectionDetailSecretCellView.SPACING_TEXT_PROGRESS
        )
    }
}
