import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CollectionPanelState } from '../Collection/type/CollectionPanelState'
import { TownUIPod } from '../Pod/TownUIPod'
import { TownUIState } from '../Type/TownUIState'
import { CollectionPod } from './../Pod/CollectionPod'
import { CookingPod } from './../Pod/CookingPod'
import { CookingPanelState } from './CookingPanelState'
import { RewardPointCellView } from '../Recipe/RewardPointCellView'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { RecipeBean } from '../Collection/RecipeBean'
import { RecipePod } from '../../pod/RecipePod'

export class CookingDetailCookingCompleteView extends GameObjects.Container {
    private cookingCompleteBackground: GameObjects.NineSlice

    private congratText: GameObjects.Text
    private congratDescText: GameObjects.Text
    private receiveText: GameObjects.Text

    private closeButton: Button
    private viewCollectionButton: Button

    private rewardPointCellView: RewardPointCellView
    private recipePreview: RecipePreviewView

    private isDesktop: boolean

    private cookingPod: CookingPod
    private recipePod: RecipePod
    private collectionPod: CollectionPod
    private townUIPod: TownUIPod

    private recipeBean: RecipeBean

    private currnetRecipeBeanSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.collectionPod = PodProvider.instance.collectionPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.recipePod = PodProvider.instance.recipePod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.setupCookingCompleteUI()
        this.setupButtonListeners()
        this.setupSubscribe()
    }

    private setupCookingCompleteUI(): void {
        this.cookingCompleteBackground = this.scene.add.nineslice(
            0,
            0,
            'collection-card',
            '',
            this.isDesktop ? 432 : 349,
            494,
            30,
            30,
            30,
            30
        )

        this.setupTexts()
        this.setupButtons()

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.doInit()

        this.rewardPointCellView.setPosition(0, this.receiveText.y + this.rewardPointCellView.height / 2 + 15)

        this.recipePreview = new RecipePreviewView(this.scene, 0, 0)
        this.recipePreview.doInit()

        this.recipePreview.setPosition(0, this.rewardPointCellView.y + this.rewardPointCellView.height + 70)

        this.cookingCompleteBackground.setInteractive()
        this.add([
            this.cookingCompleteBackground,
            this.congratText,
            this.congratDescText,
            this.receiveText,
            this.rewardPointCellView,
            this.recipePreview,
            this.closeButton,
            this.viewCollectionButton,
        ])
    }

    private setupSubscribe(): void {
        this.currnetRecipeBeanSubscription = this.cookingPod.currentRecipeBean.subscribe((recipeBean) => {
            this.recipeBean = recipeBean
            this.congratDescText.setText('“' + recipeBean.title + '”' + ' ปรุงเสร็จแล้ว')
            this.rewardPointCellView.setPointRewardCell(recipeBean)
            this.recipePreview.setRecipePreviewMaster(recipeBean.id)
            this.recipePreview.setCellWithRecipeType(recipeBean.type)
        })
    }

    private setupTexts(): void {
        this.congratText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setOrigin(0.5)
            .setText('ยินดีด้วย!!')
            .setStyle({ fill: '#29CC6A', fontSize: 36 })
            .setPosition(0, -this.cookingCompleteBackground.height / 2 + 60)

        this.congratDescText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setOrigin(0.5)
            .setText('“???” ปรุงเสร็จแล้ว')
            .setStyle({ fill: '#585858', fontSize: 24 })
            .setPosition(0, this.congratText.y + 45)

        this.receiveText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setOrigin(0.5)
            .setText('คุณได้รับ')
            .setStyle({ fill: '#585858', fontSize: 24 })
            .setPosition(0, this.congratDescText.y + this.congratDescText.height / 2 + 5)
    }

    private setupButtons(): void {
        this.closeButton = this.createButton(98, 48, 'button-white-bg', 'CLOSE', 0xee843c)
        this.closeButton.setPosition(
            -this.cookingCompleteBackground.width / 2 + (this.isDesktop ? 115 : 75),
            this.cookingCompleteBackground.height / 2 - 55
        )

        this.viewCollectionButton = this.createButton(195, 48, 'button-white-bg', 'VIEW COLLECTIONS', 0x29cc6a)
        this.viewCollectionButton.setPosition(
            this.cookingCompleteBackground.width / 2 - (this.isDesktop ? 155 : 120),
            this.cookingCompleteBackground.height / 2 - 55
        )
    }

    private setupButtonListeners(): void {
        this.closeButton.onClick(() => {
            this.cookingPod.changeCookingPanelState(CookingPanelState.CookingListFromComplete)
        })

        this.viewCollectionButton.onClick(() => {
            this.collectionPod.setCurrentDetailSelectedRecipe(this.recipePod.getRecipeBeanWithID(this.recipeBean.id))
            this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
            this.townUIPod.changeUIState(TownUIState.Collection)
            this.collectionPod.changeState(CollectionPanelState.CollectionDetail)
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
