import { Scene } from 'phaser'
import { TownBuildingView } from '../scripts/Town/TownBuildingView'
import { CameraControlView } from '../scripts/camera/CameraControlView'
import { TownDayNightView } from './../scripts/Town/TownDayNightView'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'

export class TownScene extends Scene {
   private townBuildingView: TownBuildingView
   private cameraControlView: CameraControlView
   private townDayNightView: TownDayNightView

   constructor() {
      super({
         key: 'TownScene',
      })
   }

   preload(): void {
      console.log('start TownScene')
      ResourceManager.instance.setResourceLoaderScene(this)

      this.cameraControlView = new CameraControlView(this)
      this.cameraControlView.doInit()

      this.townBuildingView = new TownBuildingView(this)
      this.townBuildingView.doInit(this.cameraControlView)

      this.townDayNightView = new TownDayNightView(this)
      this.townDayNightView.doInit(this.cameraControlView)
   }

   update() {
      this.townBuildingView.update()
   }
}
