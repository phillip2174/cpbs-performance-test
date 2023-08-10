import { GameObjects, Scene } from 'phaser'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { APILoadingManager } from '../scripts/api-loading/APILoadingManager'
import { TextAdapter } from '../scripts/text-adapter/TextAdapter'

export class SplashLoaddingScene extends Scene {
   private loadingText: GameObjects.Text

   constructor() {
      super({
         key: 'SplashLoaddingScene',
      })
   }

   preload(): void {
      console.log('start SplashLoaddingScene')
      ResourceManager.instance.setResourceLoaderScene(this)
      APILoadingManager.instance.doInit(this)
      APILoadingManager.instance.showAPILoading()

      this.loadingText = TextAdapter.instance
         .getVectorText(this, 'FC_Lamoon_Bold')
         .setText('โหลด Asset')
         .setPosition(this.cameras.main.centerX, this.cameras.main.centerY)
         .setOrigin(0.5, 0.5)
         .setStyle({
            fill: 'Orange',
            fontSize: 55,
         })

      ResourceManager.instance.loadPackJson('townload', `assets/town/townload.json`).subscribe(() => {
         APILoadingManager.instance.hideAPILoading()
         this.scene.start(`hello-world`)
      })
   }
}
