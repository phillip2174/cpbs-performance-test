import { GameObjects, Geom, Scene, Input, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { BehaviorSubject, Subject, Subscription, interval, timer } from 'rxjs'
import { UIUtil } from '../plugins/utils/UIUtil'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { Button } from '../button/Button'
import { AnimationController } from '../Town/AnimationController'

export class ScrollViewNormalAndPagination extends GameObjects.GameObject {
    public static readonly DELAY_TWEEN: number = 400
    public static readonly DURATION_TWEEN: number = 300

    public isDrag: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    private scrollViewArea: GameObjects.Rectangle
    private contentContainer: GameObjects.Container
    private masker: GameObjects.Graphics

    private scrollbarContainer: GameObjects.Container
    private scrollbarViewArea: GameObjects.Rectangle
    private scrollbarBackground: GameObjects.NineSlice

    private scrollContentContainer: GameObjects.Container
    private scrollbarContent: GameObjects.NineSlice
    private scrollbar: GameObjects.NineSlice
    private nextButton: Button
    private backButton: Button

    private scrollbarTextContainer: GameObjects.Container
    private currentPageText: GameObjects.Text
    private totalPageText: GameObjects.Text

    private xPosition: number
    private yPosition: number
    private widthScroll: number
    private heightScroll: number
    private depthScroll: number
    private layerScrollView: number
    private currentScrollViewLayer: number = 0

    private barWidth: number
    private barHeight: number
    private barYOffset: number

    private timeConstantScroll: number = 325
    private dragForceX: number = 1
    private dragForceY: number = 1
    private velocityX: number
    private velocityY: number

    private positionMoveTo: number
    private firstPosition: number
    private lastPosition: number

    private isDragView: boolean = false
    private isDragBar: boolean = false
    private startClickPosition: Phaser.Math.Vector2
    private scrollingDisposable: Subscription
    private isDragDisposable: Subscription

    private minBarMoveX: number
    private maxBarMoveX: number
    private maxWidthScrollbar: number
    private isHaveScrollBar: boolean

    private maxMoveX: number
    private maxMoveY: number
    private totalCell: number = 0
    private currentCellIndex: number = 1
    private spacing: number
    private isHorizontal: boolean
    private isSnap: boolean
    private initCellSize: number = -1
    private maxMoveOffset: number = 0
    private initPosOffset: number = 0
    private originChild: number = 0.5

    private percentMove: number
    private percentBarMove: number
    private percentWheelMove: number = 0

    private isCellSpawnCenter: boolean
    private isOpenScrollView: boolean
    private isRoundedMask: boolean = false

    private timestamp: number
    private elapsed: number
    private amplitudeX: number = 0
    private amplitudeY: number = 0
    private autoScrollX: boolean = false
    private autoScrollY: boolean = false

    private onOpenTween: Tweens.Tween
    private onChangeTween: Tweens.Tween
    private onOpenScrollBarTween: Tweens.Tween
    private onChangeScrollBarTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(
        xPosition: number,
        yPosition: number,
        width: number,
        height: number,
        depth: number,
        spacing: number,
        isHorizontal: boolean,
        isSnap: boolean,
        layer: number,
        isFromCenter: boolean = true,
        isHaveScrollBar: boolean = false,
        barWidth: number = 0,
        barHeight: number = 0,
        barYOffset: number = 22
    ) {
        this.xPosition = xPosition
        this.yPosition = yPosition
        this.widthScroll = width
        this.heightScroll = height
        this.depthScroll = depth
        this.spacing = spacing
        this.isHorizontal = isHorizontal
        this.isSnap = isSnap
        this.isHaveScrollBar = isHaveScrollBar
        this.barWidth = barWidth
        this.barHeight = barHeight
        this.barYOffset = barYOffset

        this.isCellSpawnCenter = isFromCenter
        this.layerScrollView = layer

        this.createScrollView()

        if (this.isHaveScrollBar) {
            this.createScrollBar()
            this.onUpdatePage()
            this.handleScrollBar()
            this.setActiveScrollBar(false)
        }

        this.positionMoveTo = this.isHorizontal ? this.contentContainer.x : this.contentContainer.y
        this.firstPosition = this.isHorizontal ? this.contentContainer.x : this.contentContainer.y
        this.minBarMoveX = 5

        this.createTween()

        this.scrollViewArea.setAlpha(0)

        //Test
        // let test1 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff0000)
        // let test2 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff00ff)
        // let test3 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ffff)
        // let test4 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ff00)
        // let test5 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff0000)
        // let test6 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff00ff)
        // let test7 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ffff)
        // let test8 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ff00)
        // let test9 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff0000)
        // let test10 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0xff00ff)
        // let test11 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ffff)
        // let test12 = this.scene.add.rectangle(0, 0, this.widthScroll, this.heightScroll, 0x00ff00)

        // this.addChildIntoContainer(test1)
        // this.addChildIntoContainer(test2)
        // this.addChildIntoContainer(test3)
        // this.addChildIntoContainer(test4)
        // this.addChildIntoContainer(test5)
        // this.addChildIntoContainer(test6)
        // this.addChildIntoContainer(test7)
        // this.addChildIntoContainer(test8)
        // this.addChildIntoContainer(test9)
        // this.addChildIntoContainer(test10)
        // this.addChildIntoContainer(test11)
        // this.addChildIntoContainer(test12)

        this.scene.events.addListener('update', this.onUpdate, this)
    }

    public openDebugCheck() {
        this.scrollViewArea.setAlpha(0.2)
    }

    public setOriginChild(originChild: number) {
        //ONLY 0 0.5 1
        this.originChild = originChild
    }

    public setOffsetMaxMove(offsetEnd: number) {
        this.maxMoveOffset = offsetEnd
    }

    public updateCurrentLayer(currentLayer: number) {
        this.currentScrollViewLayer = currentLayer
    }

    public setInitPosXOffset(posXOffset: number): void {
        this.initPosOffset = posXOffset
    }

    public resizeScrollView(width: number, height: number) {
        this.bringToFirst(false)

        let sizeChanged = this.isHorizontal ? this.widthScroll - width : this.heightScroll - height

        this.widthScroll = width
        this.heightScroll = height

        this.scrollViewArea.setSize(width, height)
        let boundsScrollViewArea = this.scrollViewArea.getBounds()
        this.scrollViewArea.width = boundsScrollViewArea.width
        this.scrollViewArea.height = boundsScrollViewArea.height

        if (this.isHorizontal) {
            if (!this.isCellSpawnCenter) {
                this.contentContainer.setPosition(this.contentContainer.x + sizeChanged / 2, this.yPosition)
            }
        } else {
            if (!this.isCellSpawnCenter) {
                this.contentContainer.setPosition(this.xPosition, this.contentContainer.y + sizeChanged / 2)
            }
        }

        this.createMaskScrollView()

        this.firstPosition = this.isHorizontal ? this.contentContainer.x : this.contentContainer.y

        this.setNewMinMaxMove()
    }

    public setPositionScrollView(x: number, y: number) {
        this.bringToFirst(false)
        let positionXChanged = this.xPosition - x
        let positionYChanged = this.yPosition - y

        this.xPosition = x
        this.yPosition = y

        this.scrollViewArea.setPosition(x, y)

        this.contentContainer.setPosition(
            this.contentContainer.x - positionXChanged,
            this.contentContainer.y - positionYChanged
        )

        this.createMaskScrollView()

        this.firstPosition = this.isHorizontal ? this.contentContainer.x : this.contentContainer.y

        this.setNewMinMaxMove()
    }

    public setNewMinMaxMove() {
        if (this.isHorizontal) {
            Phaser.Actions.AlignTo(this.contentContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, this.spacing)
            let widthContainer = this.contentContainer.getBounds().width

            if (!this.isCellSpawnCenter) {
                this.maxMoveX = Math.floor(
                    -(widthContainer - this.widthScroll - this.firstPosition + this.initPosOffset + this.maxMoveOffset)
                )
            } else {
                this.maxMoveX = Math.floor(
                    -(
                        widthContainer -
                        this.widthScroll / 2 -
                        this.initCellSize / 2 -
                        this.firstPosition +
                        this.initPosOffset +
                        this.maxMoveOffset
                    )
                )
            }

            this.maxMoveY = this.yPosition
        } else {
            Phaser.Actions.AlignTo(this.contentContainer.getAll(), Phaser.Display.Align.BOTTOM_CENTER, 0, this.spacing)

            let heightContainer = this.contentContainer.getBounds().height

            this.maxMoveX = this.xPosition

            if (!this.isCellSpawnCenter) {
                this.maxMoveY = Math.floor(
                    -(
                        heightContainer -
                        this.heightScroll -
                        this.firstPosition +
                        this.initPosOffset +
                        this.maxMoveOffset
                    )
                )
            } else {
                this.maxMoveY = Math.floor(
                    -(
                        heightContainer -
                        this.heightScroll / 2 -
                        this.initCellSize / 2 -
                        this.firstPosition +
                        this.initPosOffset +
                        this.maxMoveOffset
                    )
                )
            }
        }
        this.totalCell = this.contentContainer.getAll().length

        this.lastPosition = this.isHorizontal
            ? this.contentContainer.x - this.getCellSize() * (this.totalCell - 1)
            : this.contentContainer.y - this.getCellSize() * (this.totalCell - 1)

        if (this.isHaveScrollBar) {
            this.handleScrollBar()
            this.totalPageText?.setText(`/ ${this.totalCell.toString()}`)
        }
    }

    public addChildIntoContainer(child: any): void {
        this.contentContainer.add(child)

        if (this.isHorizontal) {
            if (this.initCellSize == -1) {
                this.initCellSize = child.width

                if (!this.isCellSpawnCenter) {
                    switch (this.originChild) {
                        case 0.5:
                            this.contentContainer.x =
                                this.contentContainer.x + this.initCellSize / 2 + this.initPosOffset
                            break
                        case 0:
                            this.contentContainer.x = this.contentContainer.x + this.initPosOffset
                            break
                        case 1:
                            //Handle after if have this case
                            break
                    }
                    this.firstPosition = this.contentContainer.x
                } else {
                    switch (this.originChild) {
                        case 0.5:
                            this.contentContainer.x = this.contentContainer.x + this.initPosOffset
                            break
                        case 0:
                            this.contentContainer.x =
                                this.contentContainer.x - this.initCellSize / 2 + this.initPosOffset
                            break
                        case 1:
                            //Handle after if have this case
                            break
                    }
                    this.firstPosition = this.contentContainer.x
                }
            }
            this.setNewMinMaxMove()
        } else {
            if (this.initCellSize == -1) {
                this.initCellSize = child.height

                if (!this.isCellSpawnCenter) {
                    switch (this.originChild) {
                        case 0.5:
                            this.contentContainer.y =
                                this.contentContainer.y + this.initCellSize / 2 + this.initPosOffset
                            break
                        case 0:
                            this.contentContainer.y = this.contentContainer.y + this.initPosOffset
                            break
                        case 1:
                            //Handle after if have this case
                            break
                    }
                    this.firstPosition = this.contentContainer.y
                } else {
                    switch (this.originChild) {
                        case 0.5:
                            this.contentContainer.y = this.contentContainer.y + this.initPosOffset
                            break
                        case 0:
                            this.contentContainer.y = this.contentContainer.y + this.initPosOffset
                            break
                        case 1:
                            //Handle after if have this case
                            break
                    }
                    this.firstPosition = this.contentContainer.y
                }
            }
            this.setNewMinMaxMove()
        }
    }

    private createTween() {
        this.onOpenTween = this.scene.add.tween({
            targets: this.contentContainer,
            delay: ScrollViewNormalAndPagination.DELAY_TWEEN,
            duration: ScrollViewNormalAndPagination.DURATION_TWEEN,
            props: {
                alpha: { from: 0, to: 1 },
            },
            ease: 'cubic.inout',
            paused: true,
            persist: true,
            onComplete: () => {
                this.setNewMinMaxMove()
            },
        })

        this.onChangeTween = this.scene.add.tween({
            targets: this.contentContainer,
            duration: ScrollViewNormalAndPagination.DURATION_TWEEN,
            props: {
                alpha: { from: 0, to: 1 },
            },
            ease: 'cubic.inout',
            paused: true,
            persist: true,
            onComplete: () => {
                this.setNewMinMaxMove()
            },
        })

        this.onOpenTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.contentContainer,
                    duration: 300,
                    props: { scale: { from: 0.5, to: 1.03 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.contentContainer,
                    duration: 130,
                    props: { scale: { from: 1.03, to: 1 } },
                    ease: 'linear',
                    onComplete: () => {},
                },
            ],
            paused: true,
            persist: true,
        })

        if (this.isHaveScrollBar) {
            this.onOpenScrollBarTween = this.scene.add.tween({
                targets: this.scrollbarContainer,
                delay: ScrollViewNormalAndPagination.DELAY_TWEEN,
                duration: ScrollViewNormalAndPagination.DURATION_TWEEN,
                props: {
                    alpha: { from: 0, to: 1 },
                },
                ease: 'cubic.inout',
                paused: true,
                persist: true,
                onComplete: () => {},
            })

            this.onChangeScrollBarTween = this.scene.add.tween({
                targets: this.scrollbarContainer,
                duration: ScrollViewNormalAndPagination.DURATION_TWEEN,
                props: {
                    alpha: { from: 0, to: 1 },
                },
                ease: 'cubic.inout',
                paused: true,
                persist: true,
                onComplete: () => {},
            })
        }
    }

    public setActiveScrollView(isActive: boolean, isTween: boolean = false) {
        this.scrollViewArea.setVisible(isActive)
        this.scrollViewArea.setActive(isActive)

        this.contentContainer.setVisible(isActive)
        this.contentContainer.setActive(isActive)

        this.masker.setVisible(isActive)
        this.masker.setActive(isActive)

        if (isActive) {
            if (isTween) {
                //this.onOpenTweenChain?.restart()
                if (this.isOpenScrollView) {
                    this.onChangeTween?.restart()
                } else {
                    this.onOpenTween?.restart()
                }
            } else {
                this.contentContainer.alpha = 1
            }

            if (this.isHaveScrollBar) {
                this.setActiveScrollBar(this.totalCell > 1, isTween)
            }
        } else {
            if (isTween) {
                this.onOpenTween?.pause()
                this.onChangeTween?.pause()
                //   this.onOpenTweenChain?.pause()
            } else {
                this.contentContainer.alpha = 0
            }

            if (this.isHaveScrollBar) {
                this.setActiveScrollBar(false)
            }
        }
        this.isOpenScrollView = isActive

        this.isDrag.next(false)
        this.isDragDisposable?.unsubscribe()
    }

    private setActiveScrollBar(isActive: boolean, isTween: boolean = false) {
        this.scrollbarContainer?.setVisible(isActive)
        this.scrollbarContainer?.setActive(isActive)
        this.scrollContentContainer?.setVisible(isActive)
        this.scrollContentContainer?.setActive(isActive)

        if (isActive) {
            this.scene.events.addListener('update', this.onUpdate, this)
            if (isTween) {
                if (this.isOpenScrollView) {
                    this.onChangeScrollBarTween?.restart()
                } else {
                    this.onOpenScrollBarTween?.restart()
                }
            }
        } else {
            this.scene.events.removeListener('update', this.onUpdate, this)

            if (isTween) {
                this.onOpenScrollBarTween?.pause()
                this.onChangeScrollBarTween?.pause()
            }
        }
    }

    public moveToWithIndex(cellIndex: number, isTween: boolean = true) {
        this.setPositionMoveToWithIndex(cellIndex)
        if (isTween) {
            this.tweenMoveTo()
        } else {
            this.moveTo()
        }
    }

    public bringToFirst(isTween: boolean = true) {
        this.positionMoveTo = this.firstPosition
        this.currentCellIndex = 1

        if (isTween) {
            this.tweenMoveTo()
        } else {
            this.moveTo()
        }
    }

    public bringToLast(isTween: boolean = true) {
        this.positionMoveTo = this.lastPosition
        this.currentCellIndex = this.totalCell

        if (isTween) {
            this.tweenMoveTo()
        } else {
            this.moveTo()
        }
    }

    public clearAll(isDestroy: boolean = true) {
        this.totalCell = 0
        this.contentContainer.removeAll(isDestroy)
    }

    public getWidthAndHeightScroll(): { width: number; height: number } {
        let width = this.widthScroll
        let height = this.heightScroll
        return { width, height }
    }

    public getWidthAndHeightContent(): { width: number; height: number } {
        let width = this.contentContainer.getBounds().width
        let height = this.contentContainer.getBounds().height
        return { width, height }
    }

    public getPositionScroll(): { x: number; y: number } {
        let x = this.xPosition
        let y = this.yPosition
        return { x, y }
    }

    public getMaxMove(): number {
        return this.maxMoveX
    }

    public setMaskRounded(roundedValue: number = 20, debugMark: boolean = false) {
        this.isRoundedMask = true
        this.createMaskScrollView(debugMark, roundedValue)
    }

    private setPositionMoveToWithIndex(cellIndex: number) {
        let nextCountPage = Math.abs(this.currentCellIndex - cellIndex)

        if (cellIndex > this.currentCellIndex && cellIndex <= this.totalCell) {
            this.positionMoveTo = this.positionMoveTo - this.getCellSize() * nextCountPage
            this.currentCellIndex = cellIndex
        } else if (cellIndex < this.currentCellIndex && cellIndex >= 1) {
            this.positionMoveTo = this.positionMoveTo + this.getCellSize() * nextCountPage
            this.currentCellIndex = cellIndex
        } else if (cellIndex > this.totalCell) {
            this.positionMoveTo = this.lastPosition
            this.currentCellIndex = this.totalCell
        } else if (cellIndex < 1) {
            this.positionMoveTo = this.firstPosition
            this.currentCellIndex = 1
        }
    }

    private createScrollView() {
        this.scrollViewArea = this.scene.add
            .rectangle(this.xPosition, this.yPosition, this.widthScroll, this.heightScroll, 0x00ff00, 1)
            .setInteractive()
            .setDepth(this.depthScroll)
        if (this.isHorizontal) {
            if (this.isCellSpawnCenter) {
                this.contentContainer = this.scene.add
                    .container(this.xPosition, this.yPosition)
                    .setDepth(this.depthScroll)
            } else {
                this.contentContainer = this.scene.add
                    .container(this.xPosition - this.widthScroll / 2, this.yPosition)
                    .setDepth(this.depthScroll)
            }
        } else {
            if (this.isCellSpawnCenter) {
                this.contentContainer = this.scene.add
                    .container(this.xPosition, this.yPosition)
                    .setDepth(this.depthScroll)
            } else {
                this.contentContainer = this.scene.add
                    .container(this.xPosition, this.yPosition - this.heightScroll / 2)
                    .setDepth(this.depthScroll)
            }
        }
        this.createMaskScrollView()
        this.setActionScrollView()
    }

    private createMaskScrollView(debugMark: boolean = false, roundedValue: number = 20) {
        this.contentContainer?.clearMask(true)
        this.masker?.destroy(true)
        this.masker = this.scene.add.graphics().setDepth(this.depthScroll)
        this.masker.fillStyle(0x000000, debugMark ? 0.2 : 0)

        this.masker.beginPath()
        if (this.isRoundedMask) {
            this.masker.fillRoundedRect(
                this.xPosition - this.widthScroll / 2,
                this.yPosition - this.heightScroll / 2,
                this.widthScroll,
                this.heightScroll,
                roundedValue
            )
        } else {
            this.masker.fillRect(
                this.xPosition - this.widthScroll / 2,
                this.yPosition - this.heightScroll / 2,
                this.widthScroll,
                this.heightScroll
            )
        }

        const mask = this.masker.createGeometryMask()

        this.contentContainer.setMask(mask)
    }

    private createScrollBar() {
        this.scrollbarContainer = this.scene.add
            .container(this.scrollViewArea.x, this.scrollViewArea.y + this.heightScroll / 2 + this.barYOffset)
            .setDepth(this.depthScroll)
            .setScale(1)

        this.scrollbarViewArea = this.scene.add
            .rectangle(0, 0, this.barWidth, this.barHeight, 0xffff00, 0)
            .setInteractive()
            .setDepth(this.depthScroll)

        this.scrollbarBackground = this.scene.add
            .nineslice(0, 0, 'scroll-bar-background', '', this.barWidth, this.barHeight, 20, 20, 1, 1)
            .setTint(0x29cc6a)
            .setOrigin(0.5)

        this.scrollContentContainer = this.scene.add.container(-this.scrollbarBackground.width / 2 + 5, 0)

        this.scrollbarContent = this.scene.add
            .nineslice(0, 0, 'scroll-bar-content', '', this.barWidth - 65, this.barHeight / 1.5, 15, 15, 1, 1)
            .setOrigin(0, 0.5)

        this.scrollbar = this.scene.add
            .nineslice(5, 0, 'scroll-bar', '', this.scrollbarContent.width - 10, this.barHeight / 2, 6, 6, 1, 1)
            .setOrigin(0, 0.5)

        this.scrollContentContainer.add([this.scrollbarContent, this.scrollbar])

        this.scrollbarContainer.add([this.scrollbarViewArea, this.scrollbarBackground, this.scrollContentContainer])

        if (this.isSnap) {
            this.scrollbarTextContainer = this.scene.add.container(this.scrollbarBackground.width / 2 - 40, -3.5)

            this.currentPageText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
                .setText(this.currentCellIndex.toString())
                .setOrigin(1, 0.5)
                .setPosition(0, 0)
                .setStyle({ fill: '#FFBF3C', fontSize: 20 })
            // .setPadding(0, -10, 0, 0)

            this.totalPageText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
                .setText(`/ ${this.totalCell.toString()}`)
                .setOrigin(0, 0.5)
                .setPosition(0, 0)
                .setStyle({ fill: '#FFFFFF', fontSize: 20 })
            // .setPadding(0, -10, 0, 0)

            this.scrollbarTextContainer.add([this.currentPageText, this.totalPageText])

            Phaser.Actions.AlignTo(this.scrollbarTextContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, 5)

            this.createButtonScrollBar()
            this.scrollbarContainer.add(this.scrollbarTextContainer)
        } else {
            this.scrollbarContent.width = this.barWidth - 10
        }

        this.setActionScrollBar()
    }

    private createButtonScrollBar() {
        this.nextButton = new Button(
            this.scene,
            this.scrollbarBackground.width / 2 + 30,
            0,
            40,
            40,
            'circle-button-background'
        )
        this.nextButton.setTintColorBackground(0x0099ff)

        let nextArrow = this.scene.add.image(0, 0, 'arrow-icon').setFlipX(true).setScale(1)
        this.nextButton.add(nextArrow)

        this.backButton = new Button(
            this.scene,
            -this.scrollbarBackground.width / 2 - 30,
            0,
            40,
            40,
            'circle-button-background'
        )
        this.backButton.setTintColorBackground(0x0099ff)

        let backArrow = this.scene.add.image(0, 0, 'arrow-icon').setScale(1)
        this.backButton.add(backArrow)

        this.scrollbarContainer.add([this.nextButton, this.backButton])

        if (this.scene.sys.game.device.os.desktop) {
            this.setTweenIcon(this.nextButton, nextArrow)
            this.setTweenIcon(this.backButton, backArrow)
        }
    }

    private setTweenIcon(button: Button, nextArrow: GameObjects.Image) {
        let hoverIconTween = this.scene.add.tween({
            targets: nextArrow,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: 1,
                    to: 1.15,
                },
            },
            persist: true,
        })

        let leaveIconTween = this.scene.add.tween({
            targets: nextArrow,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: 1.15,
                    to: 1,
                },
            },
            persist: true,
        })

        button.on('pointerover', () => {
            hoverIconTween?.restart()
        })

        button.on('pointerout', () => {
            leaveIconTween?.restart()
        })
    }

    private handleScrollBar() {
        let minWidthScrollbar = 16
        this.maxWidthScrollbar = this.scrollbarContent.width - 10

        let widthSizeScrollBar = this.maxWidthScrollbar / this.totalCell

        if (widthSizeScrollBar < minWidthScrollbar) {
            this.scrollbar.width = minWidthScrollbar
        } else {
            this.scrollbar.width = widthSizeScrollBar
        }

        if (this.totalCell < 1) {
            this.scrollbar.width = this.maxWidthScrollbar
            this.setMaxBarMove()
            this.scrollbar.x = this.getResultBarValue().resultBarX
        } else {
            this.setMaxBarMove()

            this.scrollbar.x = this.minBarMoveX
        }

        this.onUpdatePage()
    }

    private setMaxBarMove() {
        let widthContent = this.scrollbarContent.getBounds().width
        this.maxBarMoveX = widthContent - this.scrollbar.width - 5
    }

    private setActionScrollBar() {
        this.scene.input.on('pointerup', () => {
            if (this.isDragBar) {
                this.endScrollBar()
            }
        })

        this.scene.input.on('dragend', () => {
            if (this.isDragBar) {
                this.endScrollBar()
            }
        })

        this.scene.input.on('pointerdown', (pointer) => {
            if (this.scrollbarContent.active && this.scrollbar.getBounds().contains(pointer.x, pointer.y)) {
                this.beginScroll(pointer, false)
            }
        })

        this.nextButton?.onClick(() => {
            this.moveToWithIndex(this.currentCellIndex + 1)
        })

        this.backButton?.onClick(() => {
            this.moveToWithIndex(this.currentCellIndex - 1)
        })
    }

    private onUpdatePage() {
        this.nextButton?.setCanInteract(this.currentCellIndex != this.totalCell)
        this.backButton?.setCanInteract(this.currentCellIndex != 1)

        if (this.totalCell == 0) {
            this.nextButton?.setCanInteract(false)
            this.backButton?.setCanInteract(false)
        }

        this.currentPageText?.setText(this.currentCellIndex.toString())
    }

    private setActionScrollView() {
        this.scene.input.on('pointerup', () => {
            if (this.isDragView) {
                this.endScrollView()
            }
        })

        this.scene.input.on('dragend', () => {
            if (this.isDragView) {
                this.endScrollView()
            }
        })

        this.scene.input.on('pointerdown', (pointer) => {
            if (this.scrollViewArea.active && this.scrollViewArea.getBounds().contains(pointer.x, pointer.y)) {
                this.beginScroll(pointer, true)
            }
        })

        if (this.scene.sys.game.device.os.desktop) {
            this.scene.input.on('wheel', (pointer) => {
                if (this.scrollViewArea.active && this.scrollViewArea.getBounds().contains(pointer.x, pointer.y)) {
                    if (this.currentScrollViewLayer != this.layerScrollView) return
                    this.scrollWithWheel(pointer)
                }
            })
        }
    }

    private beginScroll(pointer: Input.Pointer, isScroll: boolean): void {
        if (this.currentScrollViewLayer != this.layerScrollView) return

        if (this.isHorizontal) {
            if (this.contentContainer.getBounds().width < this.widthScroll) return
        } else {
            if (this.contentContainer.getBounds().height < this.heightScroll) return
        }

        this.startClickPosition = new Phaser.Math.Vector2(pointer.x, pointer.y)
        if (isScroll) {
            this.isDragView = true
            this.scrollingDisposable = interval(10).subscribe((_) => this.scroll(this.scene.input.activePointer))
        } else {
            this.isDragBar = true
            this.scrollingDisposable = interval(10).subscribe((_) => this.scrollBarMove(this.scene.input.activePointer))
        }
    }

    private endScrollView() {
        this.scrollingDisposable?.unsubscribe()
        this.isDragView = false

        if (this.isSnap && this.isDrag.value) {
            this.snapCellScroll()
        }

        this.autoScrollX = false
        this.autoScrollY = false

        if (!this.isSnap) {
            if (this.velocityX > 0 || this.velocityX < 0) {
                this.amplitudeX = 0.8 * this.velocityX
                this.autoScrollX = true
            }

            if (this.velocityY > 0 || this.velocityY < 0) {
                this.amplitudeY = 0.8 * this.velocityY
                this.autoScrollY = true
            }

            this.timestamp = this.scene.sys.game.loop.time
        }

        this.isDragDisposable?.unsubscribe()
        this.isDragDisposable = timer(100).subscribe((x) => {
            this.isDrag.next(false)
        })
    }

    private endScrollViewWithWheel() {
        this.scrollingDisposable?.unsubscribe()
        this.isDragView = false

        if (this.isSnap) {
            if (this.percentWheelMove == 1 || this.percentWheelMove == 0) {
                this.snapCellScrollWheel()
            } else if (this.percentWheelMove > 0.55 && this.currentCellIndex < this.totalCell) {
                this.positionMoveTo = this.positionMoveTo - this.getCellSize()
                this.currentCellIndex++
                this.tweenMoveTo()
            } else if (this.percentWheelMove < 0.55 && this.currentCellIndex > 1) {
                this.positionMoveTo = this.positionMoveTo + this.getCellSize()
                this.currentCellIndex--
                this.tweenMoveTo()
            } else {
                this.tweenMoveTo()
            }
        }

        this.isDrag.next(false)
    }

    private endScrollBar() {
        this.scrollingDisposable?.unsubscribe()
        this.isDragBar = false

        if (this.isSnap && this.isDrag.value) {
            this.snapCellScrollBar()
        }

        this.isDragDisposable?.unsubscribe()
        this.isDragDisposable = timer(100).subscribe((x) => {
            this.isDrag.next(false)
        })
    }

    private getCellSize(): number {
        return this.initCellSize + this.spacing
    }

    private snapCellScrollBar() {
        let moveToIndex = Math.round(this.totalCell * this.percentBarMove)

        if (moveToIndex == 0) {
            moveToIndex = 1
        }

        this.moveToWithIndex(moveToIndex)
    }

    private snapCellScrollWheel() {
        let moveToIndex = Math.ceil(this.totalCell * this.percentMove)

        if (moveToIndex == 0) {
            moveToIndex = 1
        }

        this.moveToWithIndex(moveToIndex)
    }

    private snapCellScroll() {
        if (this.percentMove > 0.55 && this.currentCellIndex < this.totalCell) {
            this.positionMoveTo = this.positionMoveTo - this.getCellSize()
            this.currentCellIndex++
            this.tweenMoveTo()
        } else if (this.percentMove < 0.55 && this.currentCellIndex > 1) {
            this.positionMoveTo = this.positionMoveTo + this.getCellSize()
            this.currentCellIndex--

            this.tweenMoveTo()
        } else {
            this.tweenMoveTo()
        }
    }

    private tweenMoveTo() {
        this.onUpdatePage()
        if (this.isHorizontal) {
            this.scene.add.tween({
                targets: this.contentContainer,
                ease: 'Linear',
                duration: 200,
                props: {
                    x: { from: this.contentContainer.x, to: this.positionMoveTo },
                },
            })
        } else {
            this.scene.add.tween({
                targets: this.contentContainer,
                ease: 'Linear',
                duration: 200,
                props: {
                    y: { from: this.contentContainer.y, to: this.positionMoveTo },
                },
            })
        }

        if (this.isHaveScrollBar) {
            let { percentMove, resultBarX } = this.getResultBarValue()

            if (percentMove >= 0 && percentMove <= 1) {
                this.scene.add.tween({
                    targets: this.scrollbar,
                    ease: 'Linear',
                    duration: 200,
                    props: {
                        x: { from: this.scrollbar.x, to: resultBarX },
                    },
                })
            }
        }
    }

    private moveTo() {
        this.onUpdatePage()
        if (this.isHorizontal) {
            this.contentContainer.x = this.positionMoveTo
        } else {
            this.contentContainer.y = this.positionMoveTo
        }

        if (this.isHaveScrollBar) {
            this.scrollbar.x = this.getResultBarValue().resultBarX
        }
    }

    private getResultBarValue(): { percentMove: number; resultBarX: number } {
        let percentMove = this.normalize(this.positionMoveTo, this.firstPosition, this.maxMoveX)
        let resultBarX = this.inverseNormalize(percentMove, this.minBarMoveX, this.maxBarMoveX)

        return { percentMove, resultBarX }
    }

    private scrollBarMove(pointer: Input.Pointer) {
        if (pointer.leftButtonReleased()) {
            this.endScrollBar()
            return
        }

        if (this.totalCell <= 1) {
            return
        }

        this.isDragDisposable?.unsubscribe()

        let xDiff = pointer.x - this.startClickPosition.x

        this.velocityX = xDiff * this.dragForceX

        if (this.velocityX > 0 || this.velocityX < 0) {
            this.isDrag.next(true)
        }

        this.startClickPosition.x = pointer.x

        let resultX = this.scrollbar.x + this.velocityX

        if (this.velocityX != 0) {
            if (resultX > this.maxBarMoveX) {
                resultX = this.maxBarMoveX
            } else if (resultX < this.minBarMoveX) {
                resultX = this.minBarMoveX
            }
        }

        this.scrollbar.x = resultX

        let percentMove = this.normalize(this.scrollbar.x, this.minBarMoveX, this.maxBarMoveX)
        let resultView = this.inverseNormalize(
            percentMove,
            this.firstPosition,
            this.isHorizontal ? this.maxMoveX : this.maxMoveY
        )

        if (this.isHorizontal) {
            if (this.velocityX != 0) {
                if (resultView < this.maxMoveX) {
                    resultView = this.maxMoveX
                } else if (resultView > this.xPosition) {
                    resultView = this.xPosition
                }
            }
            this.contentContainer.x = resultView
            this.percentBarMove = this.normalize(this.contentContainer.x, this.firstPosition, this.lastPosition)
        } else {
            if (this.velocityY != 0) {
                if (resultView < this.maxMoveY) {
                    resultView = this.maxMoveY
                } else if (resultView > this.yPosition) {
                    resultView = this.yPosition
                }
            }
            this.contentContainer.y = resultView
            this.percentBarMove = this.normalize(this.contentContainer.y, this.firstPosition, this.lastPosition)
        }
    }

    private scroll(pointer: Input.Pointer): void {
        if (pointer.leftButtonReleased()) {
            this.endScrollView()
            return
        }

        this.isDragDisposable?.unsubscribe()

        let xDiff = pointer.x - this.startClickPosition.x
        let yDiff = pointer.y - this.startClickPosition.y

        this.velocityX = xDiff * this.dragForceX
        this.velocityY = yDiff * this.dragForceY

        if (this.isHorizontal) {
            if (this.velocityX > 0 || this.velocityX < 0) this.isDrag.next(true)
        } else {
            if (this.velocityY > 0 || this.velocityY < 0) this.isDrag.next(true)
        }

        this.startClickPosition.x = pointer.x
        this.startClickPosition.y = pointer.y

        let resultX = this.contentContainer.x + this.velocityX
        let resultY = this.contentContainer.y + this.velocityY

        if (!this.isSnap) {
            let minPositionX = this.isHorizontal ? this.firstPosition : this.xPosition
            let minPositionY = this.isHorizontal ? this.yPosition : this.firstPosition
            if (this.velocityX != 0) {
                if (resultX < this.maxMoveX) {
                    resultX = this.maxMoveX
                } else if (resultX > minPositionX) {
                    resultX = minPositionX
                }
            }

            if (this.velocityY != 0) {
                if (resultY < this.maxMoveY) {
                    resultY = this.maxMoveY
                } else if (resultY > minPositionY) {
                    resultY = minPositionY
                }
            }
        } else {
            let nextValue = this.positionMoveTo - this.getCellSize()
            let previous = this.positionMoveTo + this.getCellSize()

            if (this.isHorizontal) {
                if (this.velocityY != 0) {
                    if (resultY < this.maxMoveY) {
                        resultY = this.maxMoveY
                    } else if (resultY > this.yPosition) {
                        resultY = this.yPosition
                    }
                }

                this.percentMove = this.normalize(this.contentContainer.x, previous, nextValue)
            } else {
                if (this.velocityX != 0) {
                    if (resultX < this.maxMoveX) {
                        resultX = this.maxMoveX
                    } else if (resultX > this.xPosition) {
                        resultX = this.xPosition
                    }
                }

                this.percentMove = this.normalize(this.contentContainer.y, previous, nextValue)
            }
        }

        this.contentContainer.setPosition(resultX, resultY)

        if (this.isHaveScrollBar) {
            let percentMove = this.normalize(
                this.isHorizontal ? resultX : resultY,
                this.firstPosition,
                this.isHorizontal ? this.maxMoveX : this.maxMoveY
            )

            if (percentMove >= 0 && percentMove <= 1) {
                let resultBarX = this.inverseNormalize(percentMove, this.minBarMoveX, this.maxBarMoveX)

                if (this.velocityX != 0) {
                    if (resultBarX > this.maxBarMoveX) {
                        resultBarX = this.maxBarMoveX
                    } else if (resultBarX < this.minBarMoveX) {
                        resultBarX = this.minBarMoveX
                    }
                }

                this.scrollbar.x = resultBarX
            }
        }
    }

    private scrollWithWheel(pointer: Input.Pointer): void {
        this.isDragDisposable?.unsubscribe()

        let xDiff = this.scrollViewArea.x
        let yDiff = this.scrollViewArea.y

        if (this.isHorizontal) {
            this.velocityX = -((xDiff * pointer.deltaX) / 500) * this.dragForceX
            this.velocityY = yDiff
        } else {
            this.velocityX = xDiff
            this.velocityY = -((yDiff * pointer.deltaY) / 1000) * this.dragForceY
        }

        let resultX = this.contentContainer.x + this.velocityX
        let resultY = this.contentContainer.y + this.velocityY

        if (!this.isSnap) {
            let minPositionX = this.isHorizontal ? this.firstPosition : this.xPosition
            let minPositionY = this.isHorizontal ? this.yPosition : this.firstPosition
            if (this.velocityX != 0) {
                if (resultX < this.maxMoveX) {
                    resultX = this.maxMoveX
                } else if (resultX > minPositionX) {
                    resultX = minPositionX
                }
            }

            if (this.velocityY != 0) {
                if (resultY < this.maxMoveY) {
                    resultY = this.maxMoveY
                } else if (resultY > minPositionY) {
                    resultY = minPositionY
                }
            }
        } else {
            let nextValue = this.positionMoveTo - this.getCellSize()
            let previous = this.positionMoveTo + this.getCellSize()

            let minPositionX = this.isHorizontal ? this.firstPosition : this.xPosition

            if (this.isHorizontal) {
                if (this.velocityX != 0) {
                    if (resultX < this.maxMoveX) {
                        resultX = this.maxMoveX
                    } else if (resultX > minPositionX) {
                        resultX = minPositionX
                    }
                }

                if (this.velocityY != 0) {
                    if (resultY < this.maxMoveY) {
                        resultY = this.maxMoveY
                    } else if (resultY > this.yPosition) {
                        resultY = this.yPosition
                    }
                }

                this.percentWheelMove = this.normalize(this.contentContainer.x, previous, nextValue)
            } else {
                let minPositionY = this.isHorizontal ? this.yPosition : this.firstPosition
                if (this.velocityX != 0) {
                    if (resultX < this.maxMoveX) {
                        resultX = this.maxMoveX
                    } else if (resultX > this.xPosition) {
                        resultX = this.xPosition
                    }
                }

                if (this.velocityY != 0) {
                    if (resultY < this.maxMoveY) {
                        resultY = this.maxMoveY
                    } else if (resultY > minPositionY) {
                        resultY = minPositionY
                    }
                }

                this.percentWheelMove = this.normalize(this.contentContainer.y, previous, nextValue)
            }
        }

        this.contentContainer.setPosition(resultX, resultY)
        this.percentMove = this.normalize(this.contentContainer.x, this.firstPosition, this.lastPosition)

        if (this.isHaveScrollBar) {
            let percentMove = this.normalize(
                this.isHorizontal ? resultX : resultY,
                this.firstPosition,
                this.isHorizontal ? this.maxMoveX : this.maxMoveY
            )

            if (percentMove >= 0 && percentMove <= 1) {
                let resultBarX = this.inverseNormalize(percentMove, this.minBarMoveX, this.maxBarMoveX)

                if (this.velocityX != 0) {
                    if (resultBarX > this.maxBarMoveX) {
                        resultBarX = this.maxBarMoveX
                    } else if (resultBarX < this.minBarMoveX) {
                        resultBarX = this.minBarMoveX
                    }
                }

                this.scrollbar.x = resultBarX
            }
        }

        if (this.isSnap) {
            this.isDragDisposable?.unsubscribe()
            this.isDragDisposable = timer(50).subscribe((x) => {
                this.endScrollViewWithWheel()
            })
        }
    }

    public onUpdate() {
        if (!this.scrollViewArea.visible) return

        this.elapsed = this.scene.sys.game.loop.time - this.timestamp
        if (this.autoScrollY && this.amplitudeY !== 0) {
            let delta = 0
            delta = this.amplitudeY * Math.exp(-this.elapsed / this.timeConstantScroll)

            if (delta > 0.5 || delta < -0.5) {
                var resultY = this.contentContainer.y + delta
                let minPositionY = this.isHorizontal ? this.yPosition : this.firstPosition

                if (resultY < this.maxMoveY) {
                    this.autoScrollY = false
                    resultY = this.maxMoveY
                } else if (resultY > minPositionY) {
                    this.autoScrollY = false
                    resultY = minPositionY
                }

                this.contentContainer.y = resultY
            } else {
                this.autoScrollY = false
            }
        }

        if (this.autoScrollX && this.amplitudeX !== 0) {
            let delta = 0
            delta = this.amplitudeX * Math.exp(-this.elapsed / this.timeConstantScroll)

            if (delta > 0.5 || delta < -0.5) {
                var resultX = this.contentContainer.x + delta
                let minPositionX = this.isHorizontal ? this.firstPosition : this.xPosition

                if (resultX < this.maxMoveX) {
                    resultX = this.maxMoveX
                } else if (resultX > minPositionX) {
                    resultX = minPositionX
                }

                this.contentContainer.x = resultX
            } else {
                this.autoScrollX = false
            }
        }
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }
}
