import { BehaviorSubject } from 'rxjs'

export class CameraControlPod {
    public isHoldingButton: boolean = false

    public currentZoomValue: BehaviorSubject<{ propagate: boolean; zoomValue: number }> = new BehaviorSubject<{
        propagate: boolean
        zoomValue: number
    }>({ propagate: true, zoomValue: 0 })
    public isCanInteractCamera: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public isMovingCamera: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    public cameraBoundSetting: { x: number; y: number; width: number; height: number } = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }

    public minCameraZoom: number = 0
    public midCameraZoom: number = 0
    public maxCameraZoom: number = 0

    public setIsHoldingButton(isHolding: boolean): void {
        this.isHoldingButton = isHolding
    }

    public setCameraZoomMinMaxValue(minCameraZoom: number, maxCameraZoom: number): void {
        this.minCameraZoom = minCameraZoom
        this.maxCameraZoom = maxCameraZoom
    }

    public setMidZoomValue(midZoom: number) {
        this.midCameraZoom = midZoom
    }

    public setCurrentZoomValue(zoomValue: number, isTrigger: boolean = true) {
        this.currentZoomValue.next({ propagate: isTrigger, zoomValue: zoomValue })
    }

    public setInteractCamera(isCanInteract: boolean) {
        this.isCanInteractCamera.next(isCanInteract)
    }

    public setIsMovingCamera(isMoving: boolean) {
        this.isMovingCamera.next(isMoving)
    }

    public setCameraBound(x: number, y: number, width: number, height: number) {
        this.cameraBoundSetting.x = x
        this.cameraBoundSetting.y = y
        this.cameraBoundSetting.width = width
        this.cameraBoundSetting.height = height
    }
}
