import { Cameras, GameObjects, Input, Scene } from 'phaser'
import { CameraControlPod } from './CameraControlPod'
import { PodProvider } from '../pod/PodProvider'
import { GameConfig } from '../GameConfig'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'

export class CameraControlView extends GameObjects.GameObject {
   private gameCamera: Cameras.Scene2D.Camera
   private dragPoint: Input.Pointer
   private keyZ: Input.Keyboard.Key
   private cameraControlPod: CameraControlPod
   private touchEvent: Input.InputPlugin

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   private dragCamera(): void {
      this.gameCamera.scrollX -= (this.dragPoint.x - this.dragPoint.prevPosition.x) / this.gameCamera.zoom
      this.gameCamera.scrollY -= (this.dragPoint.y - this.dragPoint.prevPosition.y) / this.gameCamera.zoom
   }

   private checkIsDragLimit(): void {
      if (this.gameCamera.scrollX >= GameConfig.CAMERA_DRAG_LIMIT_X)
         this.gameCamera.scrollX = GameConfig.CAMERA_DRAG_LIMIT_X
      else if (this.gameCamera.scrollX <= -GameConfig.CAMERA_DRAG_LIMIT_X)
         this.gameCamera.scrollX = -GameConfig.CAMERA_DRAG_LIMIT_X

      if (this.gameCamera.scrollY >= GameConfig.CAMERA_DRAG_LIMIT_Y)
         this.gameCamera.scrollY = GameConfig.CAMERA_DRAG_LIMIT_Y
      else if (this.gameCamera.scrollY <= -GameConfig.CAMERA_DRAG_LIMIT_Y)
         this.gameCamera.scrollY = -GameConfig.CAMERA_DRAG_LIMIT_Y
   }

   private zoomCamera(): void {
      this.gameCamera.zoomX += (this.dragPoint.x - this.dragPoint.prevPosition.x) / GameConfig.CAMERA_ZOOM_RATIO
      this.gameCamera.zoomY += (this.dragPoint.y - this.dragPoint.prevPosition.y) / GameConfig.CAMERA_ZOOM_RATIO
   }

   private checkIsZoomLimit(): void {
      if (this.gameCamera.zoom >= GameConfig.MAX_CAMERA_ZOOM) this.gameCamera.zoom = GameConfig.MAX_CAMERA_ZOOM
      if (this.gameCamera.zoom <= GameConfig.MIN_CAMERA_ZOOM) this.gameCamera.zoom = GameConfig.MIN_CAMERA_ZOOM
   }

   public enableCameraMovements(): void {
      this.touchEvent = this.scene.input.on('pointermove', () => {
         switch (true) {
            case this.dragPoint.isDown && !this.keyZ.isDown && !this.cameraControlPod.isHoldingButton:
               this.dragCamera()
               this.checkIsDragLimit()
               break
            case this.dragPoint.isDown && this.keyZ.isDown && !this.cameraControlPod.isHoldingButton:
               this.zoomCamera()
               this.checkIsZoomLimit()
               break
         }
      })
   }

   public disableCameraMovements(): void {
      this.touchEvent.removeAllListeners()
   }

   public doInit(): void {
      this.cameraControlPod = PodProvider.instance.cameraControlPod
      this.gameCamera = this.scene.cameras.main
      this.dragPoint = this.scene.input.pointer1
      this.keyZ = this.scene.input.keyboard.addKey('Z')
      this.enableCameraMovements()
   }

   public update(): void {
      if (!this.dragPoint.isDown) this.cameraControlPod.setIsHoldingButton(false)
   }
}
