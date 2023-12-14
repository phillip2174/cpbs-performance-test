import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { CookingPod } from '../Pod/CookingPod'
import { TownUIPod } from '../Pod/TownUIPod'
import { PodProvider } from '../../pod/PodProvider'
import { CookingFilterCellView } from './CookingFilterCellView'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'
import { Subscription, skip } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'
import { AnimationController } from '../AnimationController'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class CookingFilterView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1

    private filterScrollView: ScrollViewNormalAndPagination

    private cellFilters: CookingFilterCellView[] = []

    private cookingPod: CookingPod
    private townUIPod: TownUIPod

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private stateDisposable: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, depth: number, widthBG: number): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.setPosition(x, y)
        this.setDepth(depth + 2)
        this.createTween()
        DeviceChecker.instance.isDesktop() ? this.createFilterCellsDesktop() : this.createFilterCellsMobile(widthBG)
        this.setupSubscribes()
    }

    public updateCurrentScrollViewLayer(layer: number) {
        this.filterScrollView?.updateCurrentLayer(layer)
    }

    private setupSubscribes(): void {
        this.stateDisposable = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Cooking) {
                this.setActiveFilter(true)
            } else {
                this.setActiveFilter(false)
            }
        })

        this.filterScrollView?.isDrag.subscribe((x) => {
            this.cookingPod.isDragScrollViewFilter = x
        })

        this.setActiveFilter(this.townUIPod.townUIState.value == TownUIState.Cooking, false)
        this.on('destroy', () => {
            this.stateDisposable?.unsubscribe()
        })
    }

    private createFilterCellsDesktop(): void {
        let cookingFilterButtons: CookingFilterCellView[] = []

        let cookingFilterAllButton = new CookingFilterCellView(this.scene)
        cookingFilterAllButton.doInit(RecipeFilterType.All, 0x0099ff)
        cookingFilterButtons.push(cookingFilterAllButton)

        let cookingFilterEasyButton = new CookingFilterCellView(this.scene)
        cookingFilterEasyButton.doInit(RecipeFilterType.Easy, 0x29cc6a)
        cookingFilterButtons.push(cookingFilterEasyButton)

        let cookingFilterNormalButton = new CookingFilterCellView(this.scene)
        cookingFilterNormalButton.doInit(RecipeFilterType.Normal, 0xffbf3c)
        cookingFilterButtons.push(cookingFilterNormalButton)

        let cookingFilterHardButton = new CookingFilterCellView(this.scene)
        cookingFilterHardButton.doInit(RecipeFilterType.Hard, 0xee843c)
        cookingFilterButtons.push(cookingFilterHardButton)

        let cookingFilterChallengeButton = new CookingFilterCellView(this.scene)
        cookingFilterChallengeButton.doInit(RecipeFilterType.Challenge, 0x7b61ff)
        cookingFilterButtons.push(cookingFilterChallengeButton)

        let cookingFilterSecretButton = new CookingFilterCellView(this.scene)
        cookingFilterSecretButton.doInit(RecipeFilterType.Secret, 0x0060d0)
        cookingFilterButtons.push(cookingFilterSecretButton)

        Phaser.Actions.AlignTo(cookingFilterButtons, Phaser.Display.Align.RIGHT_CENTER, 5)

        this.add([
            cookingFilterAllButton,
            cookingFilterEasyButton,
            cookingFilterNormalButton,
            cookingFilterHardButton,
            cookingFilterChallengeButton,
            cookingFilterSecretButton,
        ])
    }

    private createFilterCellsMobile(widthBG: number): void {
        this.filterScrollView = new ScrollViewNormalAndPagination(this.scene)
        this.filterScrollView.doInit(this.x, this.y - 5, widthBG / 1.025, 50, this.depth, 3, true, false, 1, false)
        this.filterScrollView.setInitPosXOffset(5)

        this.filterScrollView.setCallbackOnEndScroll(
            () => {
                this.filterScrollView.doOnEndScroll(this.cellFilters)
            },
            0,
            3
        )

        let cookingFilterAllButton = new CookingFilterCellView(this.scene)
        cookingFilterAllButton.doInit(RecipeFilterType.All, 0x0099ff, 0)
        this.cellFilters.push(cookingFilterAllButton)

        let cookingFilterEasyButton = new CookingFilterCellView(this.scene)
        cookingFilterEasyButton.doInit(RecipeFilterType.Easy, 0x29cc6a, 1)
        this.cellFilters.push(cookingFilterEasyButton)

        let cookingFilterNormalButton = new CookingFilterCellView(this.scene)
        cookingFilterNormalButton.doInit(RecipeFilterType.Normal, 0xffbf3c, 2)
        this.cellFilters.push(cookingFilterNormalButton)

        let cookingFilterHardButton = new CookingFilterCellView(this.scene)
        cookingFilterHardButton.doInit(RecipeFilterType.Hard, 0xee843c, 3)
        this.cellFilters.push(cookingFilterHardButton)

        let cookingFilterChallengeButton = new CookingFilterCellView(this.scene)
        cookingFilterChallengeButton.doInit(RecipeFilterType.Challenge, 0x7b61ff, 4)
        this.cellFilters.push(cookingFilterChallengeButton)

        let cookingFilterSecrectButton = new CookingFilterCellView(this.scene)
        cookingFilterSecrectButton.doInit(RecipeFilterType.Secret, 0x0060d0, 5)
        this.cellFilters.push(cookingFilterSecrectButton)

        this.filterScrollView.addChildIntoContainer(cookingFilterAllButton)
        this.filterScrollView.addChildIntoContainer(cookingFilterEasyButton)
        this.filterScrollView.addChildIntoContainer(cookingFilterNormalButton)
        this.filterScrollView.addChildIntoContainer(cookingFilterHardButton)
        this.filterScrollView.addChildIntoContainer(cookingFilterChallengeButton)
        this.filterScrollView.addChildIntoContainer(cookingFilterSecrectButton)
    }

    private setActiveFilter(isActive: boolean, isTween: boolean = true) {
        if (DeviceChecker.instance.isDesktop()) {
            if (isTween) {
                if (isActive) {
                    this.onCloseTween?.pause()
                    this.onCloseTweenChain?.pause()
                    this.onOpenTween.restart()
                    this.onOpenTweenChain?.restart()

                    this.setActive(true)
                    this.setVisible(true)

                    this.cookingPod.changeCookingFilterState(RecipeFilterType.All)
                    this.townUIPod.setLayerScrollView(CookingFilterView.SCROLL_VIEW_LAYER)
                } else {
                    this.onOpenTween?.pause()
                    this.onOpenTweenChain?.pause()

                    this.onCloseTween?.restart()
                    this.onCloseTweenChain?.restart()
                }
            } else {
                if (isActive) this.townUIPod.setLayerScrollView(CookingFilterView.SCROLL_VIEW_LAYER)
                this.setActive(isActive)
                this.setVisible(isActive)
            }
        } else {
            if (isTween) {
                if (isActive) {
                    this.cookingPod.changeCookingFilterState(RecipeFilterType.All)
                    this.filterScrollView?.bringToFirst(false)
                    this.filterScrollView?.setActiveScrollView(true, true)
                    this.townUIPod.setLayerScrollView(CookingFilterView.SCROLL_VIEW_LAYER)
                } else {
                    this.filterScrollView?.setActiveScrollView(false)
                    this.filterScrollView?.setActiveScrollView(false, false)
                }
            } else {
                this.filterScrollView?.setActiveScrollView(isActive)
            }
        }
    }

    private createTween(): void {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this, () => {})

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweenClose = AnimationController.instance.tweenCloseContainer(this.scene, this, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = tweenClose.onCloseTween
        this.onCloseTweenChain = tweenClose.onCloseTweenChain
    }
}
