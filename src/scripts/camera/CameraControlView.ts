import { Cameras, GameObjects, Input, Scene, Math } from 'phaser'
import { CameraControlPod } from './CameraControlPod'
import { PodProvider } from '../pod/PodProvider'
import { GameConfig } from '../GameConfig'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { Vector } from 'matter'

export class CameraControlView extends GameObjects.GameObject {
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
   }

   private zoomCamera(zoomFactor: number, x: number, y: number): void {
      this.oldZoom = this.gameCamera.zoom
      let zoomValue = this.oldZoom + zoomFactor * 0.001
      zoomValue = Math.Clamp(zoomValue, GameConfig.MIN_CAMERA_ZOOM, GameConfig.MAX_CAMERA_ZOOM)

      this.gameCamera.setZoom(zoomValue)
      this.nextZoom = this.gameCamera.zoom
      if (zoomFactor > 0 && this.oldZoom != zoomValue) {
         this.panCamera(x, y)
      }
   }

   private panCamera(x: number, y: number): void {
      let scaleAdjust = this.nextZoom / this.oldZoom

      let adjustX = (x - this.gameCamera.midPoint.x) * (this.nextZoom - this.oldZoom) * scaleAdjust * 4
      let adjustY = (y - this.gameCamera.midPoint.y) * (this.nextZoom - this.oldZoom) * scaleAdjust * 4
      let panPositionX = this.gameCamera.midPoint.x + adjustX
      let panPositionY = this.gameCamera.midPoint.y + adjustY

      this.gameCamera.pan(panPositionX, panPositionY, 200, 'Sine.easeInOut')
   }

   public setCameraBound(topLeftCoordinate: Vector, width: number, height: number): void {
      this.gameCamera.setBounds(topLeftCoordinate.x, topLeftCoordinate.y, width, height, true)
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
      this.dragEvent.removeAllListeners()
      this.zoomEvent.removeAllListeners()
      this.pointerUpEvent.removeAllListeners()
      this.dragEvent = undefined
      this.zoomEvent = undefined
      this.pointerUpEvent = undefined
   }

   public doInit(): void {
      this.cameraControlPod = PodProvider.instance.cameraControlPod
      this.dragPoint = this.scene.input.activePointer
      this.gameCamera = this.scene.cameras.main
      this.gameCamera.setZoom(0.62)
      this.enableCameraMovements()
   }
}
