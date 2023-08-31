import { Scene } from 'phaser'
import { TownUIView } from '../scripts/Town/TownUIView'
import { CameraControlView } from './../scripts/camera/CameraControlView'

export class CityUIScene extends Scene {
   private cameraControlView: CameraControlView
   private townUIView: TownUIView
   constructor() {
      super('CityUIScene')
   }

   public init(data) {
      this.cameraControlView = data.cameraControlView
   }

   public create(): void {
      this.townUIView = new TownUIView(this)
      this.townUIView.doInit(this.cameraControlView)
   }

   public update(): void {
      this.townUIView.update()
   }
}
