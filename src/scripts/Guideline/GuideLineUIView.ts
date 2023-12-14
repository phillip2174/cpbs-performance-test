import { Actions, Display, GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip, tap, timer } from 'rxjs'
import { ScrollView } from '../ScrollView/ScrollView'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { CountdownManager } from './../Countdown/CountdownManager'
import { TownDayNightPod } from './../pod/TownDayNightPod'
import { GuideLineUICellView } from './GuideLineUICellView'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { TownUIState } from '../Town/Type/TownUIState'
import { BoldText } from '../../BoldText/BoldText'
import { GuideLineUIManager } from './GuideLineUIManager'
import { TutorialState } from '../../Tutorial/TutorialState'
import { Button } from '../button/Button'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { UserType } from '../User/UserType'

export class GuideLineUIView extends GameObjects.Container {
    private guideLineUI: GameObjects.NineSlice

    private ingredientBeans: IngredientBean[] = []
    private currentTimeGuideLineUICellViewList: GuideLineUICellView[] = []

    private gridCellWidth: number = 70
    private gridCellHeight: number = 70
    private gridCellOffset: number
    private scrollViewPosX: number
    private scrollViewPosY: number

    private currentTownTimeState: TownTimeState
    private guideLineScrollView: ScrollView = undefined

    private isHaveScrollView: boolean
    private isFirstInit: boolean = true
    private isDesktop: boolean

    private textCountContainer: GameObjects.Container
    private currentFoundIngredientCountText: GameObjects.Text
    private maxIngredientCountText: GameObjects.Text

    private clockButton: Button

    private townTimeStateDisposable: Subscription
    private ingredientCountDisposable: Subscription
    private foundAllIngredientDisposable: Subscription
    private scrollViewLayerDisposable: Subscription
    private showHideGuidelineDisposable: Subscription
    private hideTextTimerDisposable: Subscription

    private townBuildingPod: TownBuildingPod
    private townDayNightPod: TownDayNightPod
    private townUIPod: TownUIPod
    private countdownManager: CountdownManager
    private guideLineUIManager: GuideLineUIManager

    private onShowContainerTween: Tweens.TweenChain
    private onShowContainerTextTween: Tweens.TweenChain
    private onShowScrollViewTween: Tweens.TweenChain
    private onHideContainerTween: Tweens.Tween
    private onHideScrollViewTween: Tweens.Tween
    private onHideContainerTextTween: Tweens.Tween
    private currentIngredientCountTextTween: Tweens.Tween

    private isShowing: boolean = true

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.townUIPod = PodProvider.instance.townUIPod
        this.guideLineUIManager = PodProvider.instance.guideLineUIManager
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.setPosition(x, y + 150)
        this.setDepth(202)
        this.clockButton = new Button(
            this.scene,
            0,
            0,
            this.isDesktop ? 28 : 22,
            this.isDesktop ? 28 : 22,
            'clock-button'
        ).setVisible(false)

        this.getIngredientBeansAndSetupUI()

        if (
            PodProvider.instance.tutorialManager.isCompletedTutorial() &&
            PodProvider.instance.userPod.userLoginType == UserType.Login
        ) {
            this.countdownManager = new CountdownManager(this.scene)
            this.countdownManager.doInit(0, -50)
            this.add([this.countdownManager])
        }
    }

    private setupSubscribe(): void {
        this.townTimeStateDisposable = this.townDayNightPod.townTimeState.subscribe((state) => {
            this.currentTownTimeState = state
        })

        this.scrollViewLayerDisposable = this.townUIPod.layerScrollView.subscribe((layer) => {
            this.guideLineScrollView?.updateCurrentLayerScrollView(layer)
        })

        this.ingredientCountDisposable = this.guideLineUIManager.currentFoundIngredientCount.subscribe(
            (currentCount) => {
                if (this.currentFoundIngredientCountText != null || this.currentFoundIngredientCountText != undefined) {
                    this.currentFoundIngredientCountText.setText(currentCount.toString())
                    this.isFirstInit ? (this.isFirstInit = false) : this.currentIngredientCountTextTween?.restart()
                }
            }
        )

        //Need To Add Condition Checks For When All Found For Login First Time
        if (!this.guideLineUIManager.isAllFound.value) {
            this.foundAllIngredientDisposable = this.guideLineUIManager.isAllFound.subscribe((isAllFound) => {
                if (isAllFound) {
                    this.currentFoundIngredientCountText?.setStyle({ fill: '#29CC6A' })
                    if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                        this.hideTextTimerDisposable = timer(800).subscribe((_) => {
                            this.textCountContainer.setVisible(false)
                            this.clockButton.setVisible(true)
                            this.townUIPod.changeUIState(TownUIState.CompleteIngredients)
                            this.hideTextTimerDisposable?.unsubscribe()
                        })
                    } else {
                        PodProvider.instance.tutorialManager.updateCurrentToNextTutorial()
                        PodProvider.instance.tutorialManager.setTutorialState(TutorialState.CountDown)
                    }
                }
            })
        }

        this.showHideGuidelineDisposable = this.townUIPod.isShowGuideline.pipe(skip(1)).subscribe((isShow) => {
            if (isShow) {
                this.onShow()
            } else {
                this.onHide()
            }
        })

        this.setFirstActive(false)

        this.on('destroy', () => {
            this.showHideGuidelineDisposable?.unsubscribe()
            this.foundAllIngredientDisposable?.unsubscribe()
            this.townTimeStateDisposable?.unsubscribe()
            this.scrollViewLayerDisposable?.unsubscribe()
            this.ingredientCountDisposable?.unsubscribe()
        })
    }

    private updateCurrentTimeStateCellViewList(): void {
        this.currentTimeGuideLineUICellViewList.length = 0

        this.ingredientBeans.forEach((cellBean) => {
            const isNotFound = this.townBuildingPod
                .getIngredientBeanNotFoundWithUser()
                .some((x) => x.id === cellBean.id)
            let cellView: GuideLineUICellView = new GuideLineUICellView(this.scene, cellBean, !isNotFound)
            this.currentTimeGuideLineUICellViewList.push(cellView)
        })
        this.guideLineUIManager.addGuideLineUICellViewList(this.currentTimeGuideLineUICellViewList)

        this.guideLineUIManager.updateCurrentFoundIngredientCount()
        if (this.guideLineUIManager.checkAllIsFound()) {
            this.currentFoundIngredientCountText?.setStyle({ fill: '#29CC6A' })
            if (
                PodProvider.instance.tutorialManager.isCompletedTutorial() &&
                PodProvider.instance.userPod.userLoginType == UserType.Login
            ) {
                this.textCountContainer.setVisible(false)
                this.clockButton.setVisible(true)
            }
        }
        this.setupGuideLineUI()
    }

    private setupGuideLineUI(): void {
        this?.removeAll()
        if (this.currentTimeGuideLineUICellViewList.length > 0) {
            this.guideLineUI = this.scene.add
                .nineslice(
                    0,
                    0,
                    'guideline-bg',
                    '',
                    (this.currentTimeGuideLineUICellViewList.length >= this.getMaxGuidelineUILengthFromDeviceCheck()
                        ? !DeviceChecker.instance.isDesktop()
                            ? 5.25
                            : 7.25
                        : this.currentTimeGuideLineUICellViewList.length + 0.65) * this.gridCellWidth,
                    105,
                    35,
                    35,
                    18,
                    18
                )
                .setOrigin(0.5)
                .setInteractive()

            this.setupGuideLineScrollView()
            this.setupGuideLineCellViewGrid()
            this.setIngredientCountTextsPosition()
            this.setupClockButton()
            this.addComponentsInContainer()
            this.setupGuidelineTweens()
        }
    }

    private setupGuideLineScrollView(): void {
        if (this.currentTimeGuideLineUICellViewList.length > this.getMaxGuidelineUILengthFromDeviceCheck()) {
            this.isHaveScrollView = true
            this.scrollViewPosX = this.x - this.guideLineUI.width / 2 + 10
            this.scrollViewPosY = this.y - this.guideLineUI.height / 2 + 20

            this.guideLineScrollView = new ScrollView(
                this.scene,
                this.scrollViewPosX,
                this.scrollViewPosY - 150,
                this.guideLineUI.width - 20,
                this.guideLineUI.height,
                202,
                this.gridCellWidth,
                this.gridCellHeight,
                1,
                0,
                this.gridCellWidth *
                    (this.currentTimeGuideLineUICellViewList.length - this.getMaxGuidelineUILengthFromDeviceCheck()) -
                    this.getMaxGuidelineUILengthFromDeviceCheck() -
                    15,
                0
            )
            this.guideLineScrollView.getContainer().y = this.guideLineScrollView.getContainer().y + 150
        } else {
            this.isHaveScrollView = false
        }
    }

    private setupGuideLineCellViewGrid(): void {
        this.gridCellOffset = ((this.currentTimeGuideLineUICellViewList.length - 1) * this.gridCellWidth) / 2

        Actions.GridAlign(this.currentTimeGuideLineUICellViewList, {
            position: Display.Align.LEFT_TOP,
            cellWidth: !this.isHaveScrollView ? this.gridCellWidth : this.gridCellWidth - 2.5,
            cellHeight: this.gridCellHeight,
            x: !this.isHaveScrollView
                ? this.guideLineUI.getLeftCenter().x + this.gridCellWidth / this.getGridCellOffsetRatio()
                : 32,
            y: !this.isHaveScrollView ? this.guideLineUI.height / 2 - 45 : 40,
        })

        this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
            this.setupGuideLineUICellView(cellView)
        })
    }

    private setupGuideLineUICellView(cellView: GuideLineUICellView): void {
        cellView.doInit(0, 0)
        cellView.addImagesToContainer()
        if (this.isHaveScrollView) {
            this.guideLineScrollView.addChildIntoContainer(cellView)
        }
    }

    private getGridCellOffsetRatio(): number {
        let gridCellOffsetRatio: number
        if (!this.isHaveScrollView) {
            if (this.currentTimeGuideLineUICellViewList.length >= this.getMaxGuidelineUILengthFromDeviceCheck()) {
                gridCellOffsetRatio = 1.65
            } else {
                gridCellOffsetRatio = 1.25
            }
        }
        return gridCellOffsetRatio
    }

    private setIngredientCountTextsPosition(): void {
        let maxIngredientCount = this.currentTimeGuideLineUICellViewList.length
        this.textCountContainer.setPosition(
            this.textCountContainer.x + this.guideLineUI.width / 2 - 37,
            this.textCountContainer.y + this.guideLineUI.y - 35
        )

        this.maxIngredientCountText.setPosition(0, 0).setText(`/${maxIngredientCount}`).setVisible(true)

        this.currentFoundIngredientCountText
            .setPosition(this.maxIngredientCountText.x - 1, this.maxIngredientCountText.y)
            .setVisible(true)
    }

    private addComponentsInContainer(): void {
        this.add([this.guideLineUI, this.clockButton])

        if (!this.isHaveScrollView) {
            this.add(this.currentTimeGuideLineUICellViewList)
        }
    }

    private getIngredientBeansAndSetupUI(): void {
        this.townBuildingPod
            .getCurrentHiddenIngredientData()
            .pipe(
                tap((x) => {
                    this.ingredientBeans = x
                })
            )
            .subscribe((_) => {
                this.setupFoundIngredientCountTexts()
                this.updateCurrentTimeStateCellViewList()
                this.setupSubscribe()
            })
    }

    private getMaxGuidelineUILengthFromDeviceCheck(): number {
        return !DeviceChecker.instance.isDesktop() ? 5 : 7
    }

    private setupFoundIngredientCountTexts(): void {
        this.textCountContainer = this.scene.add
            .container(this.scene.cameras.main.centerX, this.scene.cameras.main.height + 83)
            .setDepth(202)

        this.currentFoundIngredientCountText = new BoldText(this.scene, 0, 0, '0', 18, '#F19D63')
            .setOrigin(1, 0.5)
            .setDepth(4)
            .setVisible(false)

        this.maxIngredientCountText = new BoldText(this.scene, 0, 0, '/??', 18, '#A7A7A7')
            .setOrigin(0, 0.5)
            .setDepth(4)
            .setVisible(false)

        this.textCountContainer.add([this.currentFoundIngredientCountText, this.maxIngredientCountText])
    }

    private setupClockButton(): void {
        this.clockButton.setPosition(this.guideLineUI.width / 2 - 30, this.guideLineUI.y - 35)

        this.clockButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.NextIngredients)
        })
    }

    private setupGuidelineTweens(): void {
        this.onShowContainerTween = this.scene.tweens.chain({
            targets: this,
            tweens: [
                {
                    ease: 'cubic.inout',
                    duration: 500,
                    props: {
                        y: { from: this.y, to: this.y - 160 },
                    },
                },
                {
                    ease: 'linear',
                    duration: 100,
                    props: { y: { from: this.y - 160, to: this.y - 150 } },
                },
            ],
            persist: true,
            paused: true,
        })

        this.onHideContainerTween = this.scene.add.tween({
            targets: this,
            ease: 'cubic.inout',
            duration: 500,
            persist: true,
            paused: true,
            props: { y: { from: this.y - 150, to: this.y } },
        })

        this.onShowContainerTextTween = this.scene.tweens.chain({
            targets: this.textCountContainer,
            tweens: [
                {
                    ease: 'cubic.inout',
                    duration: 500,
                    props: {
                        y: { from: this.textCountContainer.y, to: this.textCountContainer.y - 160 },
                    },
                },
                {
                    ease: 'linear',
                    duration: 100,
                    props: { y: { from: this.textCountContainer.y - 160, to: this.textCountContainer.y - 150 } },
                },
            ],
            persist: true,
            paused: true,
        })

        this.onHideContainerTextTween = this.scene.add.tween({
            targets: this.textCountContainer,
            ease: 'cubic.inout',
            duration: 500,
            persist: true,
            paused: true,
            props: { y: { from: this.textCountContainer.y - 150, to: this.textCountContainer.y } },
        })

        if (this.isHaveScrollView) {
            this.onShowScrollViewTween = this.scene.tweens.chain({
                targets: this.guideLineScrollView.getContainer(),
                tweens: [
                    {
                        ease: 'cubic.inout',
                        duration: 500,
                        props: {
                            y: {
                                from: this.guideLineScrollView.getContainer().y,
                                to: this.guideLineScrollView.getContainer().y - 160,
                            },
                        },
                    },
                    {
                        ease: 'linear',
                        duration: 100,
                        props: {
                            y: {
                                from: this.guideLineScrollView.getContainer().y - 160,
                                to: this.guideLineScrollView.getContainer().y - 150,
                            },
                        },
                    },
                ],
                persist: true,
                paused: true,
            })

            this.onHideScrollViewTween = this.scene.add.tween({
                targets: this.guideLineScrollView.getContainer(),
                ease: 'cubic.inout',
                duration: 500,
                persist: true,
                paused: true,
                props: {
                    y: {
                        from: this.guideLineScrollView.getContainer().y - 150,
                        to: this.guideLineScrollView.getContainer().y,
                    },
                },
                onComplete: () => {
                    this.setGuidelineAndScrollViewActive(false)
                },
            })
        }

        this.currentIngredientCountTextTween = this.scene.add.tween({
            targets: this.currentFoundIngredientCountText,
            duration: 300,
            ease: 'cubic.inout',
            props: { scale: { from: 1, to: 2.5 } },
            yoyo: true,
            paused: true,
            persist: true,
        })
    }

    private onShow(): void {
        if (this.isShowing) return
        this.setGuidelineAndScrollViewActive(true)
        this.isShowing = true
        this.onHideContainerTween?.pause()
        this.onHideContainerTextTween?.pause()
        this.onHideScrollViewTween?.pause()
        this.onShowContainerTween?.restart()
        this.onShowContainerTextTween?.restart()
        this.onShowScrollViewTween?.restart()
    }

    private onHide(): void {
        if (!this.isShowing) return
        this.isShowing = false
        this.onShowContainerTween?.pause()
        this.onShowContainerTextTween?.pause()
        this.onShowScrollViewTween?.pause()
        this.onHideContainerTween?.restart()
        this.onHideContainerTextTween?.restart()
        this.onHideScrollViewTween?.restart()
    }

    private setFirstActive(isActive: boolean): void {
        this.setGuidelineAndScrollViewActive(isActive)
        this.isShowing = isActive
    }

    private setGuidelineAndScrollViewActive(isActive: boolean): void {
        this.setActive(isActive)
        this.setVisible(isActive)
        this.guideLineScrollView?.setActiveScrollView(isActive)
        if (!this.guideLineUIManager.checkAllIsFound()) {
            this.textCountContainer.setVisible(isActive)
        }
    }

    destroy(fromScene?: boolean): void {
        this.onShowContainerTween?.destroy()
        this.onShowScrollViewTween?.destroy()
        this.onHideContainerTween?.destroy()
        this.onHideScrollViewTween?.destroy()
        this.currentIngredientCountTextTween?.destroy()
        this.townTimeStateDisposable?.unsubscribe()
        this.ingredientCountDisposable?.unsubscribe()
        this.scrollViewLayerDisposable?.unsubscribe()
        this.showHideGuidelineDisposable?.unsubscribe()
        this.foundAllIngredientDisposable?.unsubscribe()
        super.destroy(fromScene)
    }
}
