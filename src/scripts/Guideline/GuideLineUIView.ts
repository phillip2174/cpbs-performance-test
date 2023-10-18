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
import { IngredientBean } from './IngredientBean'
import { TownUIState } from '../Town/Type/TownUIState'

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

    private currentFoundIngredientCountText: GameObjects.Text
    private maxIngredientCountText: GameObjects.Text

    private townTimeStateDisposable: Subscription
    private ingredientCountDisposable: Subscription
    private foundAllIngredientDisposable: Subscription
    private scrollViewLayerDisposable: Subscription
    private showHideGuidelineDisposable: Subscription

    private townBuildingPod: TownBuildingPod
    private townDayNightPod: TownDayNightPod
    private townUIPod: TownUIPod
    private countdownManager: CountdownManager

    private onShowContainerTween: Tweens.Tween
    private onShowScrollViewTween: Tweens.Tween
    private onHideContainerTween: Tweens.Tween
    private onHideScrollViewTween: Tweens.Tween
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
        this.countdownManager = new CountdownManager(this.scene)

        this.setPosition(x, y)
        this.setDepth(202)
        this.countdownManager.doInit(0, -50)

        this.getIngredientBeansAndSetupUI(this.townDayNightPod.townTimeState.value)
    }

    private setupSubscribe(): void {
        this.townTimeStateDisposable = this.townDayNightPod.townTimeState.subscribe((state) => {
            this.currentTownTimeState = state
        })

        this.scrollViewLayerDisposable = this.townUIPod.layerScrollView.subscribe((layer) => {
            this.guideLineScrollView?.updateCurrentLayerScrollView(layer)
        })

        this.ingredientCountDisposable = PodProvider.instance.guideLineUIManager.currentFoundIngredientCount.subscribe(
            (currentCount) => {
                if (this.currentFoundIngredientCountText != null || this.currentFoundIngredientCountText != undefined) {
                    this.currentFoundIngredientCountText.setText(currentCount.toString())
                    this.isFirstInit ? (this.isFirstInit = false) : this.currentIngredientCountTextTween?.restart()
                }
            }
        )

        //Need To Add Condition Checks For When All Found For Login First Time
        this.foundAllIngredientDisposable = PodProvider.instance.guideLineUIManager.isAllFound.subscribe(
            (isAllFound) => {
                if (isAllFound) {
                    this.guideLineScrollView?.setInteractable(false)
                    this.currentFoundIngredientCountText?.setStyle({ fill: '#29CC6A' })
                    timer(800).subscribe((_) => {
                        this.guideLineUI?.destroy()
                        this.guideLineScrollView?.destroy()
                        this.guideLineScrollView = undefined
                        this.isHaveScrollView = false
                        this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
                            cellView.destroy()
                        })

                        this.getNextIngredientBeansAndSetupUI(
                            this.currentTownTimeState == TownTimeState.Day ? TownTimeState.Night : TownTimeState.Day
                        )
                    })
                }
            }
        )

        this.showHideGuidelineDisposable = this.townUIPod.isShowGuideline.pipe(skip(1)).subscribe((isShow) => {
            if (isShow) {
                this.onShow()
            } else {
                this.onHide()
            }
        })

        this.setFirstActive(this.townUIPod.townUIState.value == TownUIState.MainMenu)
    }

    private updateCurrentTimeStateCellViewList(): void {
        this.currentTimeGuideLineUICellViewList.length = 0

        this.ingredientBeans.forEach((cellBean) => {
            let cellView: GuideLineUICellView = new GuideLineUICellView(this.scene, cellBean)
            this.currentTimeGuideLineUICellViewList.push(cellView)
        })
        PodProvider.instance.guideLineUIManager.addGuideLineUICellViewList(this.currentTimeGuideLineUICellViewList)

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
                        ? !this.scene.sys.game.device.os.desktop
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

            this.setupGuideLineScrollView()
            this.setupGuideLineCellViewGrid()
            this.setIngredientCountTextsPosition()
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
                this.scrollViewPosY,
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
        this.maxIngredientCountText
            .setPosition(this.guideLineUI.x + this.guideLineUI.width / 2 - 37, this.guideLineUI.y - 35)
            .setText(`/${maxIngredientCount}`)
            .setVisible(true)

        this.currentFoundIngredientCountText
            .setPosition(this.maxIngredientCountText.x - 2.5, this.maxIngredientCountText.y)
            .setVisible(true)
    }

    private addComponentsInContainer(): void {
        this.add([this.guideLineUI, this.currentFoundIngredientCountText, this.maxIngredientCountText])

        if (!this.isHaveScrollView) {
            this.add(this.currentTimeGuideLineUICellViewList)
        }
        this.add([this.countdownManager])
    }

    private getIngredientBeansAndSetupUI(townTimeState: TownTimeState): void {
        this.townBuildingPod
            .getIngredientBeansData(townTimeState)
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

    private getNextIngredientBeansAndSetupUI(townTimeState: TownTimeState): void {
        this.townBuildingPod
            .getIngredientBeansData(townTimeState)
            .pipe(
                tap((x) => {
                    this.ingredientBeans = x
                })
            )
            .subscribe((_) => {
                this.updateCurrentTimeStateCellViewList()
                this.hideIngredientCountTexts()
            })
    }

    private getMaxGuidelineUILengthFromDeviceCheck(): number {
        return !this.scene.sys.game.device.os.desktop ? 5 : 7
    }

    private setupFoundIngredientCountTexts(): void {
        this.currentFoundIngredientCountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('0')
            .setOrigin(1, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#F19D63', fontSize: 18 })
            .setDepth(4)
            .setVisible(false)

        this.maxIngredientCountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('/??')
            .setOrigin(0, 0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#A7A7A7', fontSize: 18 })
            .setDepth(4)
            .setVisible(false)
    }

    private hideIngredientCountTexts(): void {
        this.currentFoundIngredientCountText?.setActive(false)
        this.currentFoundIngredientCountText?.setVisible(false)
        this.maxIngredientCountText?.setActive(false)
        this.maxIngredientCountText?.setVisible(false)
    }

    private setupGuidelineTweens(): void {
        this.onShowContainerTween = this.scene.add.tween({
            targets: this,
            ease: 'cubic.inout',
            duration: 500,
            persist: true,
            paused: true,
            props: { y: { from: this.y + 150, to: this.y } },
            onStart: () => {
                this.isShowing = true
            },
        })

        this.onHideContainerTween = this.scene.add.tween({
            targets: this,
            ease: 'cubic.inout',
            duration: 500,
            persist: true,
            paused: true,
            props: { y: { from: this.y, to: this.y + 150 } },
            onStart: () => {
                this.isShowing = false
            },
        })

        if (this.isHaveScrollView) {
            this.onShowScrollViewTween = this.scene.add.tween({
                targets: this.guideLineScrollView.getContainer(),
                ease: 'cubic.inout',
                duration: 500,
                persist: true,
                paused: true,
                props: {
                    y: {
                        from: this.guideLineScrollView.getContainer().y + 150,
                        to: this.guideLineScrollView.getContainer().y,
                    },
                },
            })

            this.onHideScrollViewTween = this.scene.add.tween({
                targets: this.guideLineScrollView.getContainer(),
                ease: 'cubic.inout',
                duration: 500,
                persist: true,
                paused: true,
                props: {
                    y: {
                        from: this.guideLineScrollView.getContainer().y,
                        to: this.guideLineScrollView.getContainer().y + 150,
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
        this.onShowContainerTween?.restart()
        this.onShowScrollViewTween?.restart()
    }

    private onHide(): void {
        if (!this.isShowing) return
        this.onHideContainerTween?.restart()
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
    }
}
