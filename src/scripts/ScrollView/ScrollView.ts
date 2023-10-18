import { GameObjects, Geom, Input, Math, Scene } from 'phaser'
import { Subscription, interval } from 'rxjs'
import { PodProvider } from '../pod/PodProvider'

export class ScrollView extends GameObjects.GameObject {
    private container: GameObjects.Container
    private inputArea: GameObjects.Rectangle
    private masker: GameObjects.Graphics
    private maskShape: Geom.Rectangle
    private layerScrollView: number
    private currentLayerScrollView: number = 0

    private x: number
    private y: number
    private width: number
    private height: number
    private depth: number
    private offSetX: number
    private offSetY: number
    private dragForceX: number = 1
    private dragForceY: number = 1
    private velocityX: number
    private velocityY: number
    private minX: number
    private minY: number
    private isDrag: boolean = false
    private isMove: boolean = false
    private scrollingDisposable: Subscription
    private startClickPosition: Math.Vector2

    constructor(
        scene: Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        depth: number,
        offSetX: number,
        offSetY: number,
        dragForceX: number,
        dragForceY: number,
        minX: number,
        minY: number,
        layer: number = 0
    ) {
        super(scene, 'gameObject')
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.depth = depth
        this.offSetX = offSetX
        this.offSetY = offSetY
        this.dragForceX = dragForceX
        this.dragForceY = dragForceY
        this.minX = minX
        this.minY = minY
        this.layerScrollView = layer
        this.createScrollView()
    }

    public updateCurrentLayerScrollView(layer: number) {
        this.currentLayerScrollView = layer
    }

    public createScrollView(): void {
        this.inputArea = this.scene.add
            .rectangle(this.x, this.y, this.width, this.height)
            .setOrigin(0)
            .setInteractive()
            .setDepth(this.depth)

        this.masker = this.scene.make.graphics().setDepth(this.depth)
        this.maskShape = new Geom.Rectangle(this.x, this.y, this.width, this.height)
        this.masker.fillRectShape(this.maskShape)

        const mask = this.masker.createGeometryMask()

        this.container = this.scene.add.container(this.x, this.y).setDepth(this.depth)
        this.container.setMask(mask)

        this.scene.input.on('pointerup', () => {
            if (this.isDrag) {
                this.endScroll()
            }
        })

        this.scene.input.on('dragend', () => {
            if (this.isDrag) {
                this.endScroll()
            }
        })

        this.scene.input.on('pointerdown', (pointer) => {
            if (this.inputArea.active && this.inputArea.getBounds().contains(pointer.x, pointer.y)) {
                PodProvider.instance.cameraControlPod.setIsHoldingButton(true)
                this.beginScroll(pointer)
            }
        })
    }

    public addChildIntoContainer(child: any): void {
        this.container.add(child)
    }

    public getXPos(): number {
        return this.x
    }

    public getYPos(): number {
        return this.y
    }

    public getWidth(): number {
        return this.width
    }

    public getHeight(): number {
        return this.height
    }

    public getContainer(): GameObjects.Container {
        return this.container
    }

    public setInteractable(isInteractable: boolean): void {
        if (isInteractable) {
            this.scene.input.on('pointerup', () => {
                if (this.isDrag) {
                    this.endScroll()
                }
            })

            this.scene.input.on('dragend', () => {
                if (this.isDrag) {
                    this.endScroll()
                }
            })

            this.scene.input.on('pointerdown', (pointer) => {
                if (this.inputArea.active && this.inputArea.getBounds().contains(pointer.x, pointer.y)) {
                    PodProvider.instance.cameraControlPod.setIsHoldingButton(true)
                    this.beginScroll(pointer)
                }
            })
        } else {
            this.scene.input.off('pointerup')
            this.scene.input.off('dragend')
            this.scene.input.off('pointerdown')
        }
    }

    public setActiveScrollView(isActive: boolean): void {
        this.inputArea.setActive(isActive)
        this.inputArea.setVisible(isActive)

        this.container.setActive(isActive)
        this.container.setVisible(isActive)

        this.masker.setActive(isActive)
        this.masker.setVisible(isActive)

        this.setInteractable(isActive)
    }

    private beginScroll(pointer: Input.Pointer): void {
        if (this.layerScrollView != this.currentLayerScrollView) return

        this.startClickPosition = new Math.Vector2(pointer.x, pointer.y)
        this.isDrag = true
        this.isMove = true
        this.scrollingDisposable = interval(10).subscribe((_) => this.scroll(this.scene.input.activePointer))
    }

    private scroll(pointer: Input.Pointer): void {
        if (pointer.leftButtonReleased()) {
            this.endScroll()
            return
        }

        let xDiff = pointer.x - this.startClickPosition.x
        let yDiff = pointer.y - this.startClickPosition.y

        this.velocityX = xDiff * this.dragForceX
        this.velocityY = yDiff * this.dragForceY

        this.startClickPosition.x = pointer.x
        this.startClickPosition.y = pointer.y

        let resultX = this.container.x + this.velocityX
        let resultY = this.container.y + this.velocityY

        if (this.velocityX != 0) {
            switch (true) {
                case resultX > this.x:
                    resultX = this.x
                    break
                case resultX < this.x - this.minX:
                    resultX = this.x - this.minX
                    break
            }
        }

        if (this.velocityY != 0) {
            switch (true) {
                case resultY > this.y:
                    resultY = this.y
                    break
                case resultY < this.y - this.minY:
                    resultY = this.y - this.minY
                    break
            }
        }

        this.container.setPosition(resultX, resultY)
    }

    private endScroll() {
        this.scrollingDisposable?.unsubscribe()
        this.isDrag = false
        this.isMove = false
        PodProvider.instance.cameraControlPod.setIsHoldingButton(false)
    }
}
