import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { RecipePod } from '../../pod/RecipePod'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeBean } from '../Collection/RecipeBean'
import { CollectionPanelState } from '../Collection/type/CollectionPanelState'
import { TownUIPod } from '../Pod/TownUIPod'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { TownUIState } from '../Type/TownUIState'
import { CollectionPod } from './../Pod/CollectionPod'
import { CookingPod } from './../Pod/CookingPod'
import { CookingPanelState } from './CookingPanelState'
import { TutorialManager } from '../../Manager/TutorialManager'
import { TutorialState } from '../../../Tutorial/TutorialState'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class CookingDetailCookingCompleteView extends GameObjects.Container {
    public static readonly LENGTH_CUT_TEXT_TITLE_DESKTOP: number = 40
    public static readonly LENGTH_CUT_TEXT_TITLE_MOBILE: number = 33
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private cookingCompleteBackground: GameObjects.NineSlice

    private congratText: GameObjects.Text

    private congratDescTextContainer: GameObjects.Container

    private viewCollectionButton: Button

    private recipePreview: RecipePreviewView

    private isDesktop: boolean

    private cookingPod: CookingPod
    private recipePod: RecipePod
    private collectionPod: CollectionPod
    private townUIPod: TownUIPod

    private recipeBean: RecipeBean
    private tutorialManager: TutorialManager

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
        this.tutorialManager = PodProvider.instance.tutorialManager
        this.isDesktop = DeviceChecker.instance.isDesktop()

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

        this.recipePreview = new RecipePreviewView(this.scene, 0, 0)
        this.recipePreview.doInit()
        this.recipePreview.setSizeRecipe(190, 190)

        this.recipePreview.setPosition(0, 30)

        this.cookingCompleteBackground.setInteractive()
        this.add([
            this.cookingCompleteBackground,
            this.congratText,
            this.congratDescTextContainer,
            this.recipePreview,
            this.viewCollectionButton,
        ])
    }

    private setupSubscribe(): void {
        this.currnetRecipeBeanSubscription = this.cookingPod.currentRecipeBean.subscribe((recipeBean) => {
            this.recipeBean = recipeBean

            // let testArr = ['ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง', 'ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง']
            const title = TextAdapter.splitThaiStringByLegth(
                recipeBean.title,
                this.isDesktop
                    ? CookingDetailCookingCompleteView.LENGTH_CUT_TEXT_TITLE_DESKTOP
                    : CookingDetailCookingCompleteView.LENGTH_CUT_TEXT_TITLE_MOBILE
            )
            this.createTextCongratDesc(this.recipeBean.secretUnlock ? ['เมนูลับมาสเตอร์เชฟ'] : title)

            this.recipePreview.setSecretRecipe(0, false)
        })

        this.on('destroy', () => {
            this.currnetRecipeBeanSubscription?.unsubscribe()
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
        this.viewCollectionButton = this.createButton(
            224,
            48,
            'button-white-bg',
            'COLLECT REWARD',
            0x29cc6a,
            'coin-tag',
            10
        )
        this.viewCollectionButton.setPosition(
            this.cookingCompleteBackground.width / 2 - this.cookingCompleteBackground.width / 2,
            this.cookingCompleteBackground.height / 2 - 55
        )
    }

    private setupButtonListeners(): void {
        this.viewCollectionButton.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.collectionPod.setCurrentDetailSelectedRecipe(
                    this.recipePod.getRecipeBeanWithID(this.recipeBean.id)
                )
                this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
                this.townUIPod.changeUIState(TownUIState.Collection)
                this.collectionPod.changeState(CollectionPanelState.CollectionDetail)
            } else {
                this.cookingPod.changeCookingPanelState(CookingPanelState.CookingList)
                this.townUIPod.changeUIState(TownUIState.Collection)

                this.tutorialManager.updateCurrentToNextTutorial()
                this.tutorialManager.setTutorialState(TutorialState.CountDown)
            }
        })
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        colorBG: number,
        iconKey?: string,
        offset?: number
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 21,
            bottomHeight: 23,
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

        button.setTextPosition(15, 2)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width + offset, -1)
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
        mapDesc.push(`ปรุงเสร็จแล้ว หน้าตาจะเป็นยังไงนะ?? ไปดูกัน`)

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
    }
}
