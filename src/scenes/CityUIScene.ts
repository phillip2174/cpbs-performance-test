import { Input, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { CollectionView } from '../scripts/Town/Collection/CollectionView'
import { InventoryUIPanelView } from '../scripts/Town/Inventory/InventoryUIPanelView'
import { TownBuildingPod } from '../scripts/Town/Pod/TownBuildingPod'
import { TownUIView } from '../scripts/Town/TownUIView'
import { TownUIState } from '../scripts/Town/Type/TownUIState'
import { APILoadingManager } from '../scripts/api-loading/APILoadingManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { CookingUIPanelView } from './../scripts/Town/Cooking/CookingUIPanelView'
import { DailyLoginUIPanelView } from './../scripts/Town/DailyLogin/DailyLoginUIPanelView'
import { SettingUIPanelView } from './../scripts/Town/Settings/SettingUIPanelView'
import { GrayscalePipeline } from './../scripts/plugins/GrayscalePipeline'
import { MinigameSelectPanelView } from '../scripts/Town/MinigameSelect/MinigameSelectPanelView'
import { SceneState } from './SceneState'
import { CompleteIngredientsPanelView } from '../scripts/Guideline/CompleteIngredientsPanelView'
import { DayNightNoticeView } from '../scripts/Town/DayNight/DayNightNoticeView'
import { TutorialManager } from '../scripts/Manager/TutorialManager'
import { TutorialView } from '../Tutorial/TutorialView'
import { GameConfig } from '../scripts/GameConfig'
import { NextIngredientsPanelView } from './../scripts/Guideline/NextIngredientsPanelView'

export class CityUIScene extends Scene {
    private townUIView: TownUIView
    private dailyLoginUIPanelView: DailyLoginUIPanelView
    private collectionsView: CollectionView
    private inventoryUIPanelView: InventoryUIPanelView
    private cookingUIPanelView: CookingUIPanelView
    private settingUIPanelView: SettingUIPanelView
    private minigameSelectPanelView: MinigameSelectPanelView
    private tutorialView: TutorialView
    private dayNightNoticeView: DayNightNoticeView
    private completeIngredientsPanelView: CompleteIngredientsPanelView
    private nextIngredientsPanelView: NextIngredientsPanelView
    private firstInitSubscription: Subscription

    private townBuildingPod: TownBuildingPod

    private grayscalePipeline: GrayscalePipeline
    private tutorialManager: TutorialManager

    constructor() {
        super('CityUIScene')
    }

    preload(): void {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.tutorialManager = PodProvider.instance.tutorialManager

        APILoadingManager.instance.doInit(this, 1)
        APILoadingManager.instance.showSceneLoading(SceneState.TownScene)

        this.scene.launch('TownScene')
        this.firstInitSubscription = this.townBuildingPod.firstInit.subscribe((_) => {
            if (!this.tutorialManager.tutorialSaveBean.isCompletedTutorial && GameConfig.IS_START_WITH_TUTORIAL) {
                this.tutorialView = new TutorialView(this)
                this.tutorialView.doInit()
            }

            this.grayscalePipeline = new GrayscalePipeline(this.game)

            this.townUIView = new TownUIView(this)
            this.townUIView.doInit()

            this.dailyLoginUIPanelView = new DailyLoginUIPanelView(this)
            this.dailyLoginUIPanelView.doInit()

            this.collectionsView = new CollectionView(this, this.cameras.main.centerX, this.cameras.main.centerY)
            this.collectionsView.doInit()

            this.inventoryUIPanelView = new InventoryUIPanelView(this)
            if (this.sys.game.device.os.desktop) {
                this.inventoryUIPanelView.doInit(1045, 613)
            } else {
                this.inventoryUIPanelView.doInit(343, 560)
            }

            this.cookingUIPanelView = new CookingUIPanelView(this)
            this.cookingUIPanelView.doInit()

            this.settingUIPanelView = new SettingUIPanelView(this)
            this.settingUIPanelView.doInit()

            this.minigameSelectPanelView = new MinigameSelectPanelView(
                this,
                this.cameras.main.centerX,
                this.cameras.main.centerY
            )
            this.minigameSelectPanelView.doInit()

            this.dayNightNoticeView = new DayNightNoticeView(this, this.cameras.main.centerX, this.cameras.main.centerY)
            this.dayNightNoticeView.doInit()

            this.completeIngredientsPanelView = new CompleteIngredientsPanelView(this)
            this.completeIngredientsPanelView.doInit()

            this.nextIngredientsPanelView = new NextIngredientsPanelView(this)
            this.nextIngredientsPanelView.doInit()

            this.firstInitSubscription?.unsubscribe()
        })
    }
}
