import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip } from 'rxjs'
import { ScrollViewNormalAndPagination } from '../../../ScrollView/ScrollViewNormalAndPagination'
import { Button } from '../../../button/Button'
import { DimButton } from '../../../button/DimButton'
import { GameObjectConstructor } from '../../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../../pod/PodProvider'
import { AnimationController } from '../../AnimationController'
import { CollectionPod } from '../../Pod/CollectionPod'
import { TownUIPod } from '../../Pod/TownUIPod'
import { CollectionDetailState } from '../type/CollectionDetailState'
import { CollectionPanelState } from '../type/CollectionPanelState'
import { CookState } from '../type/CookState'
import { CollectionDetailCellGroupView } from './CollectionDetailCellGroupView'
import { CollectionDetailCongratCellView } from './CollectionDetailCongratCellView'
import { CollectionDetailSecretCellView } from './CollectionDetailSecretCellView'
import { TutorialManager } from '../../../Manager/TutorialManager'
import { TutorialState } from '../../../../Tutorial/TutorialState'
import { DeviceChecker } from '../../../plugins/DeviceChecker'

export class CollectionDetailView extends GameObjects.Container {
    public static readonly SIZE_WIDTH_BG_DESKTOP: number = 528
    public static readonly SIZE_WIDTH_BG_MOBILE: number = 343
    public static readonly MAX_HEIGHT_BG_DESKTOP: number = 710
    public static readonly MAX_HEIGHT_BG_MOBILE: number = 530
    public static readonly SCROLL_VIEW_LAYER: number = 2

    private dimButton: DimButton
    private paperBG: GameObjects.NineSlice

    private headerIcon: GameObjects.Image
    private detailContainer: GameObjects.Container

    private scrollView: ScrollViewNormalAndPagination

    private collectionDetailCellGroupView: CollectionDetailCellGroupView
    private collectionDetailCongratCellView: CollectionDetailCongratCellView
    private collectionDetailSecretCellView: CollectionDetailSecretCellView

    private onOpenCollectionCongratDetail: Tweens.TweenChain
    private onOpenTween: Tweens.Tween
    private onOpenScaleTween: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseScaleTween: Tweens.TweenChain

    private buttonContainer: GameObjects.Container
    private shareButton: Button
    private viewRecipeButton: Button

    private stateSubscription: Subscription
    private recipeSubscription: Subscription

    private isTween: boolean = false
    private isDesktop: boolean

    private townUIPod: TownUIPod
    private collectionPod: CollectionPod
    private tutorialManager: TutorialManager

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.collectionPod = PodProvider.instance.collectionPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.tutorialManager = PodProvider.instance.tutorialManager
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.setDepth(203)
        this.createUI()
        this.createButtonGroup()
        this.createTween()
        this.setInteractiveObject()

        this.stateSubscription = this.collectionPod.collectionPanelState.pipe(skip(1)).subscribe((state) => {
            this.setActiveDetail(state == CollectionPanelState.CollectionDetail)
        })

        this.recipeSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((recipeBean) => {
            if (recipeBean.userRecipeBean) {
                this.collectionPod.setStateDetail(
                    recipeBean.userRecipeBean.state == CookState.Cooked
                        ? CollectionDetailState.CongratDetail
                        : CollectionDetailState.UnlockedDetail
                )
            } else {
                this.collectionPod.setStateDetail(
                    recipeBean.secretUnlock ? CollectionDetailState.SecretDetail : CollectionDetailState.UncookDetail
                )
            }

            this.collectionPod.currentRecipeURL = recipeBean.linkoutUrl
        })

        this.scrollView?.isDrag.subscribe((x) => {
            this.collectionPod.isDragScrollViewDetail = x
        })

        this.setActiveDetail(
            this.collectionPod.collectionPanelState.value == CollectionPanelState.CollectionDetail,
            false
        )

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.recipeSubscription?.unsubscribe()
        })
    }

    private createUI() {
        if (DeviceChecker.instance.isDesktop()) {
            this.createUIDesktop()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - 70,
                this.paperBG.width / 1.1,
                this.paperBG.height / 1.3,
                this.depth + 1,
                0,
                false,
                false,
                2,
                false,
                false,
                0,
                0,
                0
            )
            this.scrollView.setMaskRounded()
            this.scrollView.setOriginChild(0)
            this.scrollView.setInitPosXOffset(5)
            this.scrollView.setOffsetMaxMove(5)
            this.scrollView.setCanDragOnLimitTotalCell()

            this.scrollView?.addChildIntoContainer(this.collectionDetailCellGroupView.setVisible(true))
        } else {
            this.createUIMobile()

            this.scrollView = new ScrollViewNormalAndPagination(this.scene)
            this.scrollView.doInit(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - 20,
                this.paperBG.width / 1.1,
                this.paperBG.height / 1.3,
                this.depth + 1,
                0,
                false,
                false,
                2,
                false,
                false,
                0,
                0,
                0
            )
            this.scrollView.setMaskRounded()
            this.scrollView.setOriginChild(0)
            this.scrollView.setInitPosXOffset(5)
            this.scrollView.setOffsetMaxMove(5)
            this.scrollView.setCanDragOnLimitTotalCell()

            this.scrollView?.addChildIntoContainer(this.collectionDetailCellGroupView.setVisible(true))
        }
    }

    private createUIDesktop() {
        this.dimButton = new DimButton(this.scene, 0.2)

        this.detailContainer = this.scene.add.container(0, 0)
        this.paperBG = this.scene.add.nineslice(0, 0, 'paper-bg', '', 528, 710, 45, 45, 70, 70)

        this.headerIcon = this.scene.add.image(0, -this.paperBG.height / 2 + 10, 'detail-header-icon')

        this.collectionDetailCongratCellView = new CollectionDetailCongratCellView(
            this.scene,
            0,
            -this.paperBG.height / 2 + 120
        ).setVisible(false)
        this.collectionDetailCongratCellView.doInit()

        this.collectionDetailSecretCellView = new CollectionDetailSecretCellView(
            this.scene,
            0,
            -this.paperBG.height / 2 + 170
        ).setVisible(false)
        this.collectionDetailSecretCellView.doInit()

        this.collectionDetailCellGroupView = new CollectionDetailCellGroupView(this.scene, 0, 0).setVisible(false)
        this.collectionDetailCellGroupView.doInit()

        this.detailContainer.add([
            this.paperBG,

            this.headerIcon,
            this.collectionDetailCongratCellView,
            this.collectionDetailSecretCellView,
        ])

        this.add([this.dimButton, this.detailContainer])
    }

    private createUIMobile() {
        this.dimButton = new DimButton(this.scene, 0.2)
        this.detailContainer = this.scene.add.container(0, 0)
        this.paperBG = this.scene.add.nineslice(0, 0, 'paper-bg', '', 343, 530, 45, 45, 70, 70)

        this.headerIcon = this.scene.add.image(0, -this.paperBG.height / 2 + 10, 'detail-header-icon')

        this.collectionDetailCongratCellView = new CollectionDetailCongratCellView(
            this.scene,
            0,
            -this.paperBG.height / 2 + 40
        ).setVisible(false)
        this.collectionDetailCongratCellView.doInit()

        this.collectionDetailSecretCellView = new CollectionDetailSecretCellView(
            this.scene,
            0,
            -this.paperBG.height / 2 + 80
        ).setVisible(false)
        this.collectionDetailSecretCellView.doInit()

        this.collectionDetailCellGroupView = new CollectionDetailCellGroupView(this.scene, 0, 0).setVisible(false)
        this.collectionDetailCellGroupView.doInit()

        this.detailContainer.add([
            this.paperBG,
            this.paperBG,
            this.headerIcon,
            this.collectionDetailCongratCellView,
            this.collectionDetailSecretCellView,
        ])

        this.add([this.dimButton, this.detailContainer])
    }

    private createButtonGroup() {
        let isDesktopOffset = this.isDesktop ? 16 : 0

        this.buttonContainer = this.scene.add.container(0, this.paperBG.height / 2 - 45)

        let rectButtonAlign = this.scene.add.rectangle(0, 0, this.paperBG.width - 35, 50, 0xff00ff, 0)
        this.buttonContainer.add([rectButtonAlign])

        let buttonGroup: GameObjects.Container = this.scene.add.container()

        this.shareButton = this.createButton(
            122 + isDesktopOffset,
            48,
            'button-white-bg',
            'SHARE',
            'share-icon',
            0x0099ff
        )

        this.viewRecipeButton = this.createButton(
            166 + isDesktopOffset,
            48,
            'button-white-bg',
            'VIEW RECIPE',
            'linkout-recipe-icon',
            0x29cc6a
        )
        buttonGroup.add([this.shareButton, this.viewRecipeButton])

        Phaser.Actions.AlignTo(buttonGroup.getAll(), Phaser.Display.Align.RIGHT_CENTER, 20)
        let spacing = (rectButtonAlign.width - buttonGroup.getBounds().width) / 2
        Phaser.Display.Align.In.LeftCenter(buttonGroup, rectButtonAlign, -this.shareButton.width / 2 - spacing)

        this.buttonContainer.add(buttonGroup)

        this.detailContainer.add([this.buttonContainer])
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        iconKey: string,
        colorBG: number
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
                fontFamily: 'DB_HeaventRounded',
                fill: 'white',
                fontSize: 22,
            },
            !DeviceChecker.instance.isAppleOS()
        )

        button.setTextPosition(20, 1.5)

        let icon = this.scene.add.image(0, 0, iconKey)
        icon.setPosition(-button.width / 2 + icon.width, 0)
        button.add(icon)

        button.setTintColorBackground(colorBG)

        return button
    }

    private setInteractiveObject() {
        this.paperBG?.setInteractive()

        this.dimButton?.onClick(() => {
            if (
                !this.collectionPod.isDragScrollViewDetail &&
                this.collectionPod.collectionDetailState != CollectionDetailState.CongratDetail
            ) {
                this.collectionPod.changeState(CollectionPanelState.CollectionList)
                PodProvider.instance.townUIPod.setLayerScrollView(CollectionDetailView.SCROLL_VIEW_LAYER - 1)
            }
        })

        this.viewRecipeButton?.onClick(() => {
            window.open(this.collectionPod.currentRecipeURL)
        })

        this.shareButton?.onClick(() => {
            window.open('https://praneat.com/')
        })
    }

    public updateCurrentScrollViewLayer(layer: number) {
        this.scrollView?.updateCurrentLayer(layer)
    }

    private setActiveDetail(isActive: boolean, isTween: boolean = true) {
        this.isTween = isTween
        if (isTween) {
            if (isActive) {
                PodProvider.instance.townUIPod.setLayerScrollView(CollectionDetailView.SCROLL_VIEW_LAYER)

                this.setActiveWithDetailState()

                this.dimButton?.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseScaleTween?.pause()
                this.onOpenTween?.restart()
                this.scrollView?.bringToFirst(false)

                this.setVisible(isActive)
                this.setActive(isActive)
            } else {
                this.dimButton?.setActiveDim(false)

                this.onOpenCollectionCongratDetail?.pause()
                this.onOpenScaleTween?.pause()
                this.onOpenTween?.pause()
                this.onCloseTween?.restart()
                this.onCloseScaleTween?.restart()
                this.scrollView?.setActiveScrollView(false, this.isTween)
            }
        } else {
            this.dimButton?.setActiveDim(isActive)
            this.setVisible(isActive)
            this.setActive(isActive)

            this.scrollView?.setActiveScrollView(isActive)
        }
    }

    private setActiveWithDetailState() {
        const isDesktop = this.isDesktop
        const currentState = this.collectionPod.collectionDetailState

        const widthBG = isDesktop
            ? CollectionDetailView.SIZE_WIDTH_BG_DESKTOP
            : CollectionDetailView.SIZE_WIDTH_BG_MOBILE
        const offsetUnCook = 60
        const offsetUnlocked = 140
        const offsetSpacing = 10

        const offsetResult =
            currentState == CollectionDetailState.UncookDetail
                ? offsetUnCook - offsetSpacing
                : offsetUnlocked - offsetSpacing

        const heightContainer = this.collectionDetailCellGroupView.getBounds().height + offsetResult

        const heightBG = isDesktop
            ? heightContainer >= CollectionDetailView.MAX_HEIGHT_BG_DESKTOP
                ? CollectionDetailView.MAX_HEIGHT_BG_DESKTOP
                : heightContainer + offsetSpacing
            : heightContainer >= CollectionDetailView.MAX_HEIGHT_BG_MOBILE
            ? CollectionDetailView.MAX_HEIGHT_BG_MOBILE
            : heightContainer + offsetSpacing

        switch (currentState) {
            case CollectionDetailState.UncookDetail:
                this.collectionDetailCongratCellView.setVisible(false)
                this.collectionDetailSecretCellView.setVisible(false)

                this.buttonContainer?.setVisible(false)

                this.setNewBGNineSlice(widthBG, heightBG)

                const heightScrollViewUncook = heightBG - offsetResult

                this.headerIcon.setPosition(0, -this.paperBG.height / 2 + 10)

                this.scrollView.setNewMinMaxMove()
                this.scrollView.resizeScrollView(this.paperBG.width / 1.1, heightScrollViewUncook)
                this.scrollView.setPositionScrollView(
                    this.scene.cameras.main.centerX,
                    this.scene.cameras.main.centerY + 10
                )

                this.onOpenScaleTween?.restart()
                this.scrollView?.setActiveScrollView(true, this.isTween)
                break
            case CollectionDetailState.CongratDetail:
                this.buttonContainer?.setVisible(false)
                this.collectionDetailSecretCellView.setVisible(false)
                this.collectionDetailCongratCellView.setVisible(true)

                this.setNewBGNineSlice(widthBG, isDesktop ? 560 : 530)

                this.headerIcon.setPosition(0, -this.paperBG.height / 2 + 10)

                this.onOpenCollectionCongratDetail?.restart()
                break
            case CollectionDetailState.SecretDetail:
                this.buttonContainer?.setVisible(false)

                this.collectionDetailCongratCellView.setVisible(false)
                this.collectionDetailSecretCellView.setVisible(true)

                this.setNewBGNineSlice(widthBG, isDesktop ? 450 : 446)

                this.headerIcon.setPosition(0, -this.paperBG.height / 2 + 10)
                this.onOpenScaleTween?.restart()
                break
            case CollectionDetailState.UnlockedDetail:
                this.buttonContainer?.setVisible(true)

                this.collectionDetailCongratCellView.setVisible(false)
                this.collectionDetailSecretCellView.setVisible(false)

                this.setNewBGNineSlice(widthBG, heightBG)
                const heightScrollViewUnlocked = heightBG - offsetResult

                this.headerIcon.setPosition(0, -this.paperBG.height / 2 + 10)
                this.buttonContainer.setPosition(0, this.paperBG.height / 2 - 50)
                this.scrollView.setNewMinMaxMove()
                this.scrollView.resizeScrollView(this.paperBG.width / 1.1, heightScrollViewUnlocked)
                this.scrollView.setPositionScrollView(
                    this.scene.cameras.main.centerX,
                    this.scene.cameras.main.centerY - 20
                )

                this.onOpenScaleTween?.restart()
                this.scrollView?.setActiveScrollView(true, this.isTween)
                break
        }
    }

    private setNewBGNineSlice(widthBG: number, heightBG: number) {
        this.paperBG.destroy()
        this.paperBG = this.scene.add
            .nineslice(0, 0, 'paper-bg', '', widthBG, heightBG, 45, 45, 70, 70)
            .setInteractive()
        this.detailContainer.add(this.paperBG).sendToBack(this.paperBG)
    }

    private createTween() {
        this.onOpenCollectionCongratDetail = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.detailContainer,
                    delay: 150,
                },
                {
                    targets: this.detailContainer,
                    duration: 250,
                    props: {
                        scale: {
                            from: 0,
                            to: 1,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.detailContainer,
                    duration: 100,
                    props: {
                        scale: {
                            from: 1,
                            to: 0.95,
                        },
                    },
                    onComplete: () => {
                        if (this.collectionPod.collectionDetailState == CollectionDetailState.CongratDetail)
                            this.collectionDetailCongratCellView.showCookedTween()
                    },
                    ease: 'linear',
                },
                {
                    targets: this.detailContainer,
                    duration: 100,
                    props: {
                        scale: {
                            from: 0.95,
                            to: 1,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        let tweensOpen = AnimationController.instance.tweenOpenContainer(this.scene, this.detailContainer, () => {
            if (!this.tutorialManager.isCompletedTutorial()) {
                this.tutorialManager.updateCurrentToNextTutorial()
                this.tutorialManager.saveCheckPointTutorialAndCompleted(7, false)
            }
        })
        this.onOpenScaleTween = tweensOpen.onOpenTweenChain
        this.onOpenTween = tweensOpen.onOpenTween

        let tweenClose = AnimationController.instance.tweenCloseContainer(this.scene, this.detailContainer, () => {
            this.setActive(false)
            this.setVisible(false)
            if (!this.tutorialManager.isCompletedTutorial()) {
                this.tutorialManager.setTutorialState(TutorialState.CountDown)
            }
        })

        this.onCloseTween = tweenClose.onCloseTween
        this.onCloseScaleTween = tweenClose.onCloseTweenChain
    }
}
