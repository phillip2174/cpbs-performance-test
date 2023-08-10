import { Scene } from 'phaser'
import { Button } from '../scripts/button/Button'
import { UIUtil } from '../scripts/plugins/utils/UIUtil'
import { PodProvider } from '../scripts/pod/PodProvider'
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

   public preload(): void {
      this.load.image('testBg', 'assets/town/mtown-dps.png')
   }

   public create(): void {
      // let testButton = new Button(this, 187.5, 780, 200, 100, 'testBg')
      // testButton.onClick(() => {}, () => {
      //     PodProvider.instance.cameraControlPod.setIsHoldingButton(true)
      // })
      this.townUIView = new TownUIView(this)
      this.townUIView.doInit(this.cameraControlView)
   }

   public update(): void {
      this.townUIView.update()
   }
}
