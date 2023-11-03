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
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private cookingCompleteBackground: GameObjects.NineSlice

    private congratText: GameObjects.Text

    private congratDescTextContainer: GameObjects.Container

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

        this.congratDescTextContainer = this.scene.add.container(0, this.congratText.y + 50)

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.doInit()

        this.rewardPointCellView.setPosition(
            0,
            this.congratDescTextContainer.y + this.rewardPointCellView.height / 2 + 15
        )

        this.recipePreview = new RecipePreviewView(this.scene, 0, 0)
        this.recipePreview.doInit()
        this.recipePreview.setSizeRecipe(170, 170)

        this.recipePreview.setPosition(0, 50)

        this.cookingCompleteBackground.setInteractive()
        this.add([
            this.cookingCompleteBackground,
            this.congratText,
            this.congratDescTextContainer,
            this.rewardPointCellView,
            this.recipePreview,
            this.closeButton,
            this.viewCollectionButton,
        ])
    }

    private setupSubscribe(): void {
        this.currnetRecipeBeanSubscription = this.cookingPod.currentRecipeBean.subscribe((recipeBean) => {
            this.recipeBean = recipeBean

            // let testArr = ['ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง', 'ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง']

            this.createTextCongratDesc(this.recipeBean.secretUnlock ? ['เมนูลับมาสเตอร์เชฟ'] : recipeBean.title)
            this.rewardPointCellView.setDefaultPointCell()
            if (!this.recipeBean.secretUnlock) {
                this.rewardPointCellView.setPointRewardCell(recipeBean)
            }

            this.recipePreview.setSecretRecipe(0, false)
        })
    }

    private setupTexts(): void {
        this.congratText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setOrigin(0.5)
            .setText('ยินดีด้วย!!')
            .setStyle({ fill: '#29CC6A', fontSize: 36 })
            .setPosition(
                0,
                this.isDesktop
                    ? -this.cookingCompleteBackground.height / 2 + 50
                    : -this.cookingCompleteBackground.height / 2 + 40
            )
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
            this.townUIPod.setLayerScrollView(CookingDetailCookingCompleteView.SCROLL_VIEW_LAYER)
            this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
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

    private createTextCongratDesc(arrTitle: string[]) {
        this.congratDescTextContainer.removeAll(true)

        let mapDesc = arrTitle.map((x) => x)
        let maxArrIndex = mapDesc.length - 1
        mapDesc[0] = `"${mapDesc[0]}`
        mapDesc[maxArrIndex] = `${mapDesc[maxArrIndex]}"`
        mapDesc.push(`ปรุงเสร็จแล้ว คุณได้รับ`)

        mapDesc.forEach((line) => {
            let lineGroup: GameObjects.Container = this.scene.add.container()
            let positionMock = this.scene.add
                .rectangle(0, 0, this.cookingCompleteBackground.width - (this.isDesktop ? 100 : 80), 24, 0xff0000, 0)
                .setOrigin(0.5, 0.5)

            let titleText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded')
                .setText(line)
                .setOrigin(0.5, 0.5)
                .setPosition(0, -positionMock.height / 2 + 8)
                .setStyle({ fill: '#585858', fontSize: 24 })

            lineGroup.add([positionMock, titleText])

            lineGroup.width = lineGroup.getBounds().width
            lineGroup.height = 24

            this.congratDescTextContainer.add(lineGroup)
        })

        if (mapDesc.length > 1)
            Phaser.Actions.AlignTo(this.congratDescTextContainer.getAll(), Phaser.Display.Align.BOTTOM_CENTER, 0, 5)

        this.congratDescTextContainer.width = this.congratDescTextContainer.getBounds().width
        this.congratDescTextContainer.height = this.congratDescTextContainer.getBounds().height

        this.rewardPointCellView.setPosition(
            0,
            this.congratDescTextContainer.y + this.congratDescTextContainer.height - 10
        )
    }
}
