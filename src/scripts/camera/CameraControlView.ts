import { Cameras, GameObjects, Input, Scene } from 'phaser'
import { Subscription, filter, timer } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { CameraControlPod } from './CameraControlPod'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class CameraControlView extends GameObjects.GameObject {
    public static readonly VALUE_FIRST_TO_MID: number = 0.35
    public static readonly VALUE_MID_TO_LAST: number = 0.65

    private gameCamera: Cameras.Scene2D.Camera
    private dragPoint: Input.Pointer
    private fingerPointer1: Input.Pointer
    private fingerPointer2: Input.Pointer

    private dragPointOffsetX: number
    private dragPointOffsetY: number
    private oldZoom: number
    private nextZoom: number
    private distance: number = 0
    private oldDistance: number = 0

    private zoomPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2()

    private cameraControlPod: CameraControlPod

    private dragEvent: Input.InputPlugin
    private zoomEvent: Input.InputPlugin
    private pointerUpEvent: Input.InputPlugin

    private zoomValueSubscription: Subscription
    private cameraInteractSubscription: Subscription
    private delayMovingSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.cameraControlPod = PodProvider.instance.cameraControlPod
        this.scene.input.addPointer(3)
        this.dragPoint = this.scene.input.activePointer
        this.fingerPointer1 = this.scene.game.input.pointers[1]
        this.fingerPointer2 = this.scene.game.input.pointers[2]
        this.gameCamera = this.scene.cameras.main

        if (DeviceChecker.instance.isDesktop()) {
            let normalizeHeight = this.normalize(
                window.innerHeight,
                GameConfig.MIN_HEIGHT_DESKTOP_SCREEN,
                GameConfig.MAX_HEIGHT_DESKTOP_SCREEN
            )
            let minZoomValue = this.inverseNormalize(
                normalizeHeight,
                GameConfig.MIN_SCREEN_DESKTOP_CAMERA_ZOOM,
                GameConfig.MAXMIN_SCREEN_DESKTOP_CAMERA_ZOOM
            )

            this.gameCamera.setZoom(minZoomValue)

            let midZoomDesktop = minZoomValue + CameraControlView.VALUE_FIRST_TO_MID
            let maxZoomDesktop = midZoomDesktop + CameraControlView.VALUE_MID_TO_LAST

            this.cameraControlPod.setCameraZoomMinMaxValue(minZoomValue, maxZoomDesktop)
            this.cameraControlPod.setMidZoomValue(midZoomDesktop)
        } else {
            this.gameCamera.setZoom(GameConfig.MIN_MOBILE_CAMERA_ZOOM)
            this.cameraControlPod.setCameraZoomMinMaxValue(
                GameConfig.MIN_MOBILE_CAMERA_ZOOM,
                GameConfig.MAX_MOBILE_CAMERA_ZOOM
            )
        }

        this.cameraControlPod.setCurrentZoomValue(this.gameCamera.zoom)
        this.setSubscription()
    }

    public getCameraZoom(): number {
        return this.gameCamera.zoom
    }

    public enableCameraMovements(): void {
        if (this.dragEvent == undefined) {
            this.dragEvent = this.scene.input.on('pointermove', (pointer) => {
                if (this.checkIsTwoFingerDown()) return
                this.setDragPointAndOffset(pointer)
                switch (true) {
                    case this.dragPoint.leftButtonDown() &&
                        !this.cameraControlPod.isHoldingButton &&
                        this.dragPoint.getDuration() >= 50:
                        this.dragCamera()
                        break
                }
            })
        }

        if (this.zoomEvent == undefined) {
            this.zoomEvent = this.scene.input.on('wheel', (pointer) => {
                this.zoomCamera(pointer.deltaY, pointer.worldX, pointer.worldY)
            })
        }

        if (this.pointerUpEvent == undefined) {
            this.pointerUpEvent = this.scene.input.on('pointerup', () => {
                this.cameraControlPod.setIsHoldingButton(false)
            })
        }
    }

    public disableCameraMovements(): void {
        this.dragEvent?.removeAllListeners()
        this.zoomEvent?.removeAllListeners()
        this.pointerUpEvent?.removeAllListeners()
        this.dragEvent = undefined
        this.zoomEvent = undefined
        this.pointerUpEvent = undefined
    }

    public update(): void {
        if (DeviceChecker.instance.isDesktop()) return
        if (this.checkIsTwoFingerDown()) {
            this.cameraControlPod.setIsPinchZooming(true)
            if (this.oldDistance == 0) {
                this.distance = Phaser.Math.Distance.BetweenPoints(
                    this.fingerPointer1.position,
                    this.fingerPointer2.position
                )
                this.oldDistance = this.distance
            } else {
                this.distance = Phaser.Math.Distance.BetweenPoints(
                    this.fingerPointer1.position,
                    this.fingerPointer2.position
                )
                let distancedelta = (this.oldDistance - this.distance) * -1
                if (this.fingerPointer1.x < this.fingerPointer2.x) {
                    this.zoomPosition.x =
                        this.fingerPointer1.worldX +
                        Math.abs(this.fingerPointer1.worldX - this.fingerPointer2.worldX) / 2
                } else {
                    this.zoomPosition.x =
                        this.fingerPointer2.worldX +
                        Math.abs(this.fingerPointer1.worldX - this.fingerPointer2.worldX) / 2
                }
                if (this.fingerPointer1.y < this.fingerPointer2.y) {
                    this.zoomPosition.y =
                        this.fingerPointer1.worldY +
                        Math.abs(this.fingerPointer1.worldY - this.fingerPointer2.worldY) / 2
                } else {
                    this.zoomPosition.y =
                        this.fingerPointer2.worldY +
                        Math.abs(this.fingerPointer1.worldY - this.fingerPointer2.worldY) / 2
                }

                if (this.oldDistance != this.distance && (distancedelta > 2 || distancedelta < -2)) {
                    this.zoomCamera(distancedelta * 2, this.zoomPosition.x, this.zoomPosition.y)
                }
                this.oldDistance = this.distance
            }
        } else {
            this.cameraControlPod.setIsPinchZooming(false)
            this.oldDistance = this.distance = 0
        }
    }

    private setDragPointAndOffset(pointer: any): void {
        this.dragPoint = pointer
        this.dragPointOffsetX = this.dragPoint.x - this.dragPoint.prevPosition.x
        this.dragPointOffsetY = this.dragPoint.y - this.dragPoint.prevPosition.y
    }

    private dragCamera(): void {
        this.gameCamera.scrollX -= this.dragPointOffsetX / this.gameCamera.zoom
        this.gameCamera.scrollY -= this.dragPointOffsetY / this.gameCamera.zoom

        this.cameraControlPod.setIsMovingCamera(true)
        this.delayMovingSubscription?.unsubscribe()
        this.delayMovingSubscription = timer(250).subscribe((_) => {
            this.cameraControlPod.setIsMovingCamera(false)
        })
    }

    private zoomCamera(zoomFactor: number, x: number, y: number): void {
        this.oldZoom = this.gameCamera.zoom
        let zoomValue = this.oldZoom + zoomFactor * 0.001

        zoomValue = Phaser.Math.Clamp(
            zoomValue,
            this.cameraControlPod.minCameraZoom,
            this.cameraControlPod.maxCameraZoom
        )

        this.gameCamera.setZoom(zoomValue)

        this.nextZoom = this.gameCamera.zoom
        if (zoomFactor > 0 && this.oldZoom != zoomValue) {
            this.panCamera(x, y)
        }

        this.cameraControlPod.setCurrentZoomValue(this.gameCamera.zoom, false)
    }

    private panCamera(x: number, y: number): void {
        let scaleAdjust = this.nextZoom / this.oldZoom

        let adjustX = (x - this.gameCamera.midPoint.x) * (this.nextZoom - this.oldZoom) * scaleAdjust * 4
        let adjustY = (y - this.gameCamera.midPoint.y) * (this.nextZoom - this.oldZoom) * scaleAdjust * 4
        let panPositionX = this.gameCamera.midPoint.x + adjustX
        let panPositionY = this.gameCamera.midPoint.y + adjustY

        this.gameCamera.pan(panPositionX, panPositionY, 200, 'Sine.easeInOut')
    }

    private setCameraBound(): void {
        let settingCameraBound = this.cameraControlPod.cameraBoundSetting
        this.gameCamera.setBounds(
            settingCameraBound.x,
            settingCameraBound.y,
            settingCameraBound.width,
            settingCameraBound.height,
            true
        )
    }

    private setCameraZoom(zoomValue: number): void {
        this.gameCamera.zoomTo(zoomValue, 250, Phaser.Math.Easing.Cubic.InOut, true)
    }

    private setSubscription() {
        this.zoomValueSubscription = this.cameraControlPod.currentZoomValue
            .pipe(filter((x) => x.propagate))
            .subscribe((zoomValue) => {
                this.setCameraZoom(zoomValue.zoomValue)
            })

        this.cameraInteractSubscription = this.cameraControlPod.isCanInteractCamera.subscribe((isCanInteract) => {
            if (isCanInteract) {
                this.enableCameraMovements()
                this.setCameraBound()
            } else {
                this.disableCameraMovements()
            }
        })

        this.on('destroy', () => {
            this.zoomValueSubscription?.unsubscribe()
            this.cameraInteractSubscription?.unsubscribe()
            this.delayMovingSubscription?.unsubscribe()
        })
    }

    private checkIsTwoFingerDown(): boolean {
        return this.fingerPointer1.isDown && this.fingerPointer2.isDown
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }
}
