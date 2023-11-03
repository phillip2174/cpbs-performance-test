import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { Subscription } from 'rxjs'
import { CookingPod } from '../Pod/CookingPod'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'

export class CookingFilterCellView extends GameObjects.Container {
    private filterType: RecipeFilterType
    private buttonFilter: Button

    private filterBackground: GameObjects.NineSlice
    private selectedBackground: GameObjects.NineSlice
    private circleNotification: GameObjects.Arc

    private filterText: GameObjects.Text
    private stateFilterSubscription: Subscription
    private notificationFilterSubscription: Subscription

    private filterBackgroundHeight: number = 36
    private filterBackgroundColor: number

    private cookingPod: CookingPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(filterType: RecipeFilterType, color: number): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.filterType = filterType
        this.filterBackgroundColor = color
        this.setupCellUI()
        this.setupButtonListener()
        this.setupSubscribes()
    }

    private setupCellUI(): void {
        this.filterText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(this.filterType.toString())
            .setOrigin(0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#FFFFFF', fontSize: 20 })

        this.filterBackground = this.scene.add
            .nineslice(0, 0, 'selected-filter-bg', '', this.filterText.width + 48, 36, 10, 10, 10, 10)
            .setOrigin(0.5)
            .setTint(this.filterBackgroundColor)

        this.selectedBackground = this.scene.add
            .nineslice(
                0,
                1,
                'selected-filter-bg',
                '',
                this.filterText.width + 54,
                this.filterBackground.height + 8,
                10,
                10,
                10,
                10
            )
            .setOrigin(0.5)

        this.circleNotification = this.scene.add
            .circle(0, 0, 4, 0xdf2b41)
            .setVisible(false)
            .setPosition(this.filterBackground.width / 2 - 9, -this.filterBackground.height / 2 + 9)

        this.buttonFilter = new Button(
            this.scene,
            0,
            0,
            this.filterText.width + 48,
            this.filterBackgroundHeight,
            '',
            0
        ).setAlpha(0.01)

        this.add([
            this.selectedBackground,
            this.filterBackground,
            this.filterText,
            this.circleNotification,
            this.buttonFilter,
        ])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setupSubscribes(): void {
        this.stateFilterSubscription = this.cookingPod.cookingFilterState.subscribe((state) => {
            this.setActiveSelected(state == this.filterType)
        })
    }

    private setupButtonListener(): void {
        this.buttonFilter?.onClick(() => {
            if (!this.cookingPod.isDragScrollViewFilter) {
                this.cookingPod.changeCookingFilterState(this.filterType)
            }
        })

        this.notificationFilterSubscription = this.cookingPod.notificationFilterCooking.subscribe((arr) => {
            this.circleNotification.setVisible(false)
            if (arr.length != 0) {
                if (this.filterType == RecipeFilterType.All) {
                    this.circleNotification.setVisible(true)
                }

                arr.forEach((filter) => {
                    if (filter == this.filterType) this.circleNotification.setVisible(true)
                })
            }
        })
    }

    private setActiveSelected(isActive: boolean) {
        this.selectedBackground.setVisible(isActive)
        this.selectedBackground.setActive(isActive)
    }
}
