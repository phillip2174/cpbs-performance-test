import { GameObjects, Scene } from 'phaser'
import { Subscription, skip, timer } from 'rxjs'
import { GameConfig } from '../../GameConfig'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CollectionPod } from '../Pod/CollectionPod'
import { TownUIPod } from '../Pod/TownUIPod'
import { TownUIState } from '../Type/TownUIState'
import { CollectionFilterCellView } from './CollectionFilterCellView'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'

export class CollectionFilterView extends GameObjects.Container {
    private collectionFilterCellContainer: GameObjects.Container
    private collectionAlignFilterCellContainer: GameObjects.Container

    private scrollView: ScrollViewNormalAndPagination

    private stateSubscription: Subscription
    private delaySubscription: Subscription

    private collectionPod: CollectionPod
    private townUIPod: TownUIPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(widthBG: number, positionYFilter: number, depth: number) {
        this.collectionPod = PodProvider.instance.collectionPod
        this.townUIPod = PodProvider.instance.townUIPod

        if (this.scene.sys.game.device.os.desktop) {
            this.createFilterDesktop(widthBG, positionYFilter, depth)
        } else {
            this.createFilterMobile(widthBG, positionYFilter, depth)
        }

        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.Collection) {
                this.setActiveFilter(true)
            } else {
                this.setActiveFilter(false)
            }
        })

        this.scrollView?.isDrag.subscribe((x) => {
            this.collectionPod.isDragScrollViewFilter = x
        })

        this.setActiveFilter(this.townUIPod.townUIState.value == TownUIState.Collection, false)
    }

    public updateCurrentScrollViewLayer(layer: number) {
        this.scrollView?.updateCurrentLayer(layer)
    }

    private createFilterDesktop(widthBG: number, positionYFilter: number, depth: number) {
        this.collectionFilterCellContainer = this.scene.add.container(widthBG, positionYFilter)
        this.collectionAlignFilterCellContainer = this.scene.add.container(widthBG + 150, positionYFilter)

        let collectionAllFilterCellView = new CollectionFilterCellView(this.scene)
        collectionAllFilterCellView.doInit(RecipeFilterType.All, 28, 0x0099ff)
        this.collectionFilterCellContainer.add(collectionAllFilterCellView)

        let collectionEasyFilterCellView = new CollectionFilterCellView(this.scene)
        collectionEasyFilterCellView.doInit(RecipeFilterType.Easy, 28, 0x29cc6a)

        this.collectionAlignFilterCellContainer.add(collectionEasyFilterCellView)

        let collectionNormalFilterCellView = new CollectionFilterCellView(this.scene)
        collectionNormalFilterCellView.doInit(RecipeFilterType.Normal, 28, 0xffbf3c)
        this.collectionAlignFilterCellContainer.add(collectionNormalFilterCellView)

        let collectionHardFilterCellView = new CollectionFilterCellView(this.scene)
        collectionHardFilterCellView.doInit(RecipeFilterType.Hard, 28, 0xee843c)
        this.collectionAlignFilterCellContainer.add(collectionHardFilterCellView)

        let collectionChallengeFilterCellView = new CollectionFilterCellView(this.scene)
        collectionChallengeFilterCellView.doInit(RecipeFilterType.Challenge, 28, 0x7b61ff)
        this.collectionAlignFilterCellContainer.add(collectionChallengeFilterCellView)

        let collectionSecretFilterCellView = new CollectionFilterCellView(this.scene)
        collectionSecretFilterCellView.doInit(RecipeFilterType.Secret, 28, 0x0060d0)
        this.collectionAlignFilterCellContainer.add(collectionSecretFilterCellView)

        Phaser.Actions.AlignTo(this.collectionAlignFilterCellContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, -2)

        this.add([this.collectionFilterCellContainer, this.collectionAlignFilterCellContainer])
        this.setDepth(depth)
    }

    private createFilterMobile(widthBG: number, positionYScroll: number, depth: number) {
        this.scrollView = new ScrollViewNormalAndPagination(this.scene)
        this.scrollView.doInit(widthBG / 1.85, positionYScroll, widthBG / 1.042, 50, depth, 5, true, false, 1, false)
        this.scrollView.setInitPosXOffset(20)
        // this.scrollView.openDebugCheck()

        let collectionAllFilterCellView = new CollectionFilterCellView(this.scene)
        collectionAllFilterCellView.doInit(RecipeFilterType.All, 37, 0x0099ff)

        let collectionEasyFilterCellView = new CollectionFilterCellView(this.scene)
        collectionEasyFilterCellView.doInit(RecipeFilterType.Easy, 37, 0x29cc6a)

        let collectionNormalFilterCellView = new CollectionFilterCellView(this.scene)
        collectionNormalFilterCellView.doInit(RecipeFilterType.Normal, 37, 0xffbf3c)

        let collectionHardFilterCellView = new CollectionFilterCellView(this.scene)
        collectionHardFilterCellView.doInit(RecipeFilterType.Hard, 37, 0xee843c)

        let collectionChallengeFilterCellView = new CollectionFilterCellView(this.scene)
        collectionChallengeFilterCellView.doInit(RecipeFilterType.Challenge, 37, 0x7b61ff)

        let collectionSecretFilterCellView = new CollectionFilterCellView(this.scene)
        collectionSecretFilterCellView.doInit(RecipeFilterType.Secret, 37, 0x0060d0)

        this.scrollView.addChildIntoContainer(collectionAllFilterCellView)
        this.scrollView.addChildIntoContainer(collectionEasyFilterCellView)
        this.scrollView.addChildIntoContainer(collectionNormalFilterCellView)
        this.scrollView.addChildIntoContainer(collectionHardFilterCellView)
        this.scrollView.addChildIntoContainer(collectionChallengeFilterCellView)
        this.scrollView.addChildIntoContainer(collectionSecretFilterCellView)
    }

    private setActiveFilter(isActive: boolean, isTween: boolean = true) {
        if (this.scene.sys.game.device.os.desktop) {
            if (isActive) {
                this.collectionPod.changeStateFilter(RecipeFilterType.All)
                // this.setVisible(true)
            } else {
                // this.setVisible(false)
            }
        } else {
            if (isTween) {
                if (isActive) {
                    this.collectionPod.changeStateFilter(RecipeFilterType.All)
                    this.scrollView?.bringToFirst(false)
                    this.scrollView?.setActiveScrollView(true, true)
                } else {
                    this.delaySubscription?.unsubscribe()
                    this.scrollView?.setActiveScrollView(false, true)
                }
            } else {
                this.scrollView?.setActiveScrollView(isActive)
            }
        }
    }
}
