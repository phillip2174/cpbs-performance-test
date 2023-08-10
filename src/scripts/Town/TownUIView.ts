import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { GuideLineUIView } from '../Guideline/GuideLineUIView'
import { CountdownManager } from '../Countdown/CountdownManager'
import { CameraControlView } from '../camera/CameraControlView'

export class TownUIView extends GameObjects.GameObject {
   private guideLineUIView: GuideLineUIView
   private countdownManager: CountdownManager
   private cameraControlView: CameraControlView
   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   public doInit(camera: CameraControlView): void {
      this.cameraControlView = camera
      this.guideLineUIView = new GuideLineUIView(this.scene)
      this.guideLineUIView.doInit()

      this.countdownManager = new CountdownManager(this.scene)
      this.countdownManager.doInit(this.cameraControlView)
   }

   public update(): void {
      this.guideLineUIView.update()
   }
}
