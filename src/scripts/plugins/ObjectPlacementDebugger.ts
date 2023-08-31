import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from './objects/GameObjectConstructor'
import { UIUtil } from './utils/UIUtil'

export class ObjectPlacementDebugger extends GameObjects.GameObject {
   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   public debugWithCanvas(gameObject: any): void {
      this.scene.input.on('pointerdown', (pointer) => {
         gameObject.x = pointer.worldX
         gameObject.y = pointer.worldY
         console.log(
            'UI Canvas - GameObject Pos: ' +
               (UIUtil.getCanvasWidth() - gameObject.x) +
               ':' +
               (UIUtil.getCanvasHeight() - gameObject.y)
         )
      })
   }

   public debugWithOtherObject(gameObject: any, otherObject: any): void {
      this.scene.input.on('pointerdown', (pointer) => {
         gameObject.x = pointer.worldX
         gameObject.y = pointer.worldY
         console.log(
            'GameObject Pos - OtherObject Pos: ' + (gameObject.x - otherObject.x) + ':' + (gameObject.y - otherObject.y)
         )
      })
   }

   public debugWithCamera(gameObject: any): void {
      this.scene.input.on('pointerdown', (pointer) => {
         gameObject.x = pointer.worldX
         gameObject.y = pointer.worldY
         console.log(
            'GameObject Pos - Camera Center Pos: ' +
               (gameObject.x - this.scene.cameras.main.centerX) +
               ':' +
               (gameObject.y - this.scene.cameras.main.centerY)
         )
      })
   }
}
