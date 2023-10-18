import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TownUICircleButtonView } from './TownUICircleButtonView'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { TownUIPod } from './Pod/TownUIPod'
import { PodProvider } from '../pod/PodProvider'
import { TownUIState } from './Type/TownUIState'

export class AccessibilityButtonGroupView extends GameObjects.Container {
    private cpCityButton: TownUICircleButtonView
    private menuGroupButton: TownUICircleButtonView

    private townUIPod: TownUIPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.setPosition(x, y)

        this.cpCityButton = new TownUICircleButtonView(this.scene)
        this.cpCityButton.doInit(
            -this.scene.cameras.main.width / 2 + 35,
            -this.scene.cameras.main.height / 2 + 39,
            'cp-city',
            TownUIButtonType.CPCity
        )

        this.menuGroupButton = new TownUICircleButtonView(this.scene)
        this.menuGroupButton.doInit(
            this.scene.cameras.main.width / 2 - 35,
            -this.scene.cameras.main.height / 2 + 39,
            'menu-group',
            TownUIButtonType.MenuGroup
        )

        this.setupButtons()
        this.add([this.cpCityButton, this.menuGroupButton])
    }

    private setupButtons(): void {
        this.cpCityButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
            this.townUIPod.setIsShowGuideline(true)
        })

        this.menuGroupButton.onClick(() => {
            this.townUIPod.setIsShowMenuGroup(true)
        })
    }
}
