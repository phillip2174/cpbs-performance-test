import { Vector } from 'matter'
import { Cameras, GameObjects, Input, Math, Scene } from 'phaser'
import { GameConfig } from '../GameConfig'
import { TownUICircleButtonView } from '../Town/TownUICircleButtonView'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { CameraControlPod } from './CameraControlPod'
import { Subscription, filter, timer } from 'rxjs'

export class CameraControlView extends GameObjects.GameObject {
    public static readonly VALUE_FIRST_TO_MID: number = 0.35
    public static readonly VALUE_MID_TO_LAST: number = 0.65

    private gameCamera: Cameras.Scene2D.Camera
    private dragPoint: Input.Pointer
    private dragPointOffsetX: number
    private dragPointOffsetY: number
    private oldZoom: number
    private nextZoom: number
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

        zoomValue = Math.Clamp(zoomValue, this.cameraControlPod.minCameraZoom, this.cameraControlPod.maxCameraZoom)

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
        this.gameCamera.zoomTo(zoomValue, 250, Math.Easing.Cubic.InOut, true)
    }

    public getCameraZoom(): number {
        return this.gameCamera.zoom
    }

    public enableCameraMovements(): void {
        if (this.dragEvent == undefined) {
            this.dragEvent = this.scene.input.on('pointermove', (pointer) => {
                this.setDragPointAndOffset(pointer)
                switch (true) {
                    case this.dragPoint.isDown && !this.cameraControlPod.isHoldingButton:
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

    public doInit(): void {
        this.cameraControlPod = PodProvider.instance.cameraControlPod
        this.dragPoint = this.scene.input.activePointer
        this.gameCamera = this.scene.cameras.main

        if (this.scene.sys.game.device.os.desktop) {
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
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }
}
