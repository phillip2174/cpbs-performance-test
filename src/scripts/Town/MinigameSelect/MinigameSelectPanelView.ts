import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TownUIPod } from '../Pod/TownUIPod'
import { Subscription, skip } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'
import { DimButton } from '../../button/DimButton'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { AnimationController } from '../AnimationController'
import { ScrollViewNormalAndPagination } from '../../ScrollView/ScrollViewNormalAndPagination'
import { MinigamePod } from './MinigamePod'
import { MinigameSelectCellView } from './MinigameSelectCellView'
import { AudioManager } from '../../Audio/AudioManager'
import { BoldText } from '../../../BoldText/BoldText'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { UIDepthConfig } from '../../UIDepthConfig'

export class MinigameSelectPanelView extends GameObjects.Container {
    public static readonly SCROLL_VIEW_LAYER: number = 1
    private dimButton: DimButton

    private minigameHeaderContainer: GameObjects.Container
    private areaRectangle: GameObjects.Rectangle
    private headerBackground: GameObjects.Image
    private iconHeader: GameObjects.Image
    private headerText: GameObjects.Text

    private scrollView: ScrollViewNormalAndPagination

    private audioManager: AudioManager

    private townUIPod: TownUIPod
    private minigamePod: MinigamePod

    private isTween: boolean = false

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private layerScrollViewSubscription: Subscription
    private isDragSubscription: Subscription
    private stateSubscription: Subscription

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.townUIPod = PodProvider.instance.townUIPod
        this.audioManager = PodProvider.instance.audioManager
        this.minigamePod = new MinigamePod(this.scene)
        this.setDepth(UIDepthConfig.MINIGAME_SELECT)

        this.setupUI()
        this.createTween()
        this.setInteractiveObject()

        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state == TownUIState.MiniGameSelect) {
                this.setActiveContainer(true)
                this.townUIPod.setIsFinishChangeUITween(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.layerScrollViewSubscription = this.townUIPod.layerScrollView.subscribe((currentScrollViewLayer) => {
            this.scrollView?.updateCurrentLayer(currentScrollViewLayer)
        })

        this.isDragSubscription = this.scrollView?.isDrag.subscribe((x) => {
            this.minigamePod.isDragScrollView = x
        })

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.MiniGameSelect, false)

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.layerScrollViewSubscription?.unsubscribe()
            this.isDragSubscription?.unsubscribe()
        })
    }

    private setupUI() {
        this.dimButton = new DimButton(this.scene, 0.5, true, 'background-book')
        this.add(this.dimButton)

        if (DeviceChecker.instance.isDesktop()) {
            this.setupUIDesktop()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + 20,
                this.scene.cameras.main.width,
                this.scene.cameras.main.height / 1.39,
                this.depth + 1,
                50,
                true,
                true,
                1
            )

            this.scrollView.setCanDragScrollSizeLimit()
            this.scrollView.createButtonNextAndBack(
                this.scene.cameras.main.width - 46,
                this.scene.cameras.main.centerY,
                46,
                this.scene.cameras.main.centerY,
                72
            )
        } else {
            this.setupUIMobile()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + 25,
                this.scene.cameras.main.width,
                this.scene.cameras.main.height / 1.2,
                this.depth + 1,
                10,
                true,
                true,
                1
            )

            this.scrollView.setCanDragScrollSizeLimit()
            this.scrollView.createButtonNextAndBack(
                this.scene.cameras.main.width - 46,
                this.scene.cameras.main.height - 38,
                46,
                this.scene.cameras.main.height - 38,
                56,
                0.8
            )
        }
    }

    private setupUIDesktop() {
        this.headerBackground = this.scene.add.image(0, 0, 'header-background').setScale(1.2)

        this.iconHeader = this.scene.add.image(-80, -25, 'minigame-header-icon').setScale(1)

        this.headerText = new BoldText(this.scene, 35, -12, 'MINI GAME', 36)

        this.minigameHeaderContainer = this.scene.add.container(0, -this.scene.cameras.main.height / 2 + 80)

        this.areaRectangle = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height / 1.5,
            0xff00ff,
            0
        )

        this.minigameHeaderContainer.add([this.headerBackground, this.iconHeader, this.headerText])

        this.add([this.minigameHeaderContainer, this.areaRectangle])
    }

    private setupUIMobile() {
        this.minigameHeaderContainer = this.scene.add.container(0, -this.scene.cameras.main.height / 2 + 50) //- 265

        this.headerBackground = this.scene.add.image(0, 0, 'header-background').setScale(0.85, 1)

        this.iconHeader = this.scene.add.image(-60, -15, 'minigame-header-icon').setScale(0.7)

        this.headerText = new BoldText(this.scene, 28, -10, 'MINI GAME', 28)

        this.areaRectangle = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height / 1.3,
            0xff00ff,
            0
        )

        this.minigameHeaderContainer.add([this.headerBackground, this.iconHeader, this.headerText])

        this.add([this.minigameHeaderContainer, this.areaRectangle])
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        this.isTween = isTween
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true, !this.townUIPod.isFinishChangeUITween)

                this.scrollView?.bringToFirst(false)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()
                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.setActive(true)
                this.setVisible(true)

                this.townUIPod.setLayerScrollView(MinigameSelectPanelView.SCROLL_VIEW_LAYER)

                this.audioManager.stopAmbientSound()

                this.audioManager.playBGMSound('select_minigame_bgm', true)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.scrollView?.setActiveScrollView(false, this.isTween)
                this.dimButton.setActiveDim(false, !this.townUIPod.isFinishChangeUITween)
            }
        } else {
            this.setActive(isActive)
            this.setVisible(isActive)
            this.pauseAllTween()
            this.dimButton.setActiveDim(isActive, false)
            this.scrollView?.setActiveScrollView(isActive)
            this.isTween = true

            if (isActive) {
                this.townUIPod.setLayerScrollView(MinigameSelectPanelView.SCROLL_VIEW_LAYER)
                this.audioManager.playBGMSound('select_minigame_bgm', true)
            }
        }

        if (isActive && !this.minigamePod.isFirstOpen) {
            this.minigamePod.isFirstOpen = true
            this.minigamePod.getAllMiniGame().subscribe((minigameBeans) => {
                minigameBeans.forEach((bean) => {
                    let cell = new MinigameSelectCellView(this.scene, 0, 0)
                    cell.doInit(bean.gameID)
                    this.scrollView.addChildIntoContainer(cell)
                })

                this.scrollView?.setActiveScrollView(true, this.isTween)
                this.isTween = true
            })
        } else if (isActive && this.minigamePod.isFirstOpen) {
            this.scrollView?.setActiveScrollView(true, this.isTween)
        }
    }

    private pauseAllTween() {
        this.onCloseTween?.pause()
        this.onCloseTweenChain?.pause()
        this.onOpenTween?.pause()
        this.onOpenTweenChain?.pause()
    }

    private setInteractiveObject() {
        this.areaRectangle?.setInteractive()

        this.dimButton.onClick(() => {
            if (!this.minigamePod.isDragScrollView) {
                this.townUIPod.changeUIState(TownUIState.MainMenu)
                this.townUIPod.setIsShowGuideline(true)
            }
        })
    }

    private createTween() {
        let tweensOpen = AnimationController.instance.tweenOpenContainer(
            this.scene,
            this.minigameHeaderContainer,
            () => {}
        )

        this.onOpenTween = tweensOpen.onOpenTween
        this.onOpenTweenChain = tweensOpen.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(
            this.scene,
            this.minigameHeaderContainer,
            () => {
                this.setActive(false)
                this.setVisible(false)
            }
        )
        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseTweenChain = tweensClose.onCloseTweenChain
    }
}
