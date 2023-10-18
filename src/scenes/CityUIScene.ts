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

export class CityUIScene extends Scene {
    private townUIView: TownUIView
    private dailyLoginUIPanelView: DailyLoginUIPanelView
    private collectionsView: CollectionView
    private inventoryUIPanelView: InventoryUIPanelView
    private cookingUIPanelView: CookingUIPanelView
    private settingUIPanelView: SettingUIPanelView
    private firstInitSubscription: Subscription

    private townBuildingPod: TownBuildingPod

    private grayscalePipeline: GrayscalePipeline

    constructor() {
        super('CityUIScene')
    }

    public create(): void {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        APILoadingManager.instance.doInit(this)
        APILoadingManager.instance.showAPILoading()

        this.firstInitSubscription = this.townBuildingPod.firstInit.subscribe((_) => {
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

            this.firstInitSubscription?.unsubscribe()
        })
    }

    public update(): void {
        if (Input.Keyboard.JustDown(this.input.keyboard.addKey('Q'))) {
            PodProvider.instance.townUIPod.changeUIState(TownUIState.Collection)
        }
    }
}
