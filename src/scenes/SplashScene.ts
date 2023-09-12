import { Scene } from 'phaser'
import { UIUtil } from '../scripts/plugins/utils/UIUtil'
import { timer } from 'rxjs'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'

export class SplashScene extends Scene {
   constructor() {
      super({
         key: 'SplashScene',
      })
   }

   preload(): void {
      console.log('start SplashScene')
      this.initWindowEvents()
      this.loadAsset()
   }

   private loadAsset() {
      ResourceManager.instance.doInit(this)
      ResourceManager.instance.loadPackJson('bootAssetLoad', `assets/bootload.json`).subscribe()
      this.createLoader()
   }

   private createLoader(): void {
      this.load.on('complete', () => {
         this.onCompleteLoadBootAsset()
      })
   }

   private initWindowEvents() {
      this.setGameCanvasSize()
      // window.onresize = () => {
      //     timer(100).subscribe((_) => {
      //         //this.game.scale.setParentSize(UIUtil.parentWidth, UIUtil.parentHeight)
      //        this.setGameCanvasSize()
      //     })
      // }
   }

   private onCompleteLoadBootAsset(): void {
      this.hiddenFirstLoading()
      this.setGameCanvasSize()
      this.scene.start(`SplashLoaddingScene`)
   }

   private setGameCanvasSize(): void {
      let gameScreenWidth
      let gameScreenHeight
      if (this.sys.game.device.os.desktop) {
         let min = 500
         let max = 1280

         let screenValueMin = 2.5
         let screenValueMax = 1

         let normalizeValue = this.normalize(window.innerWidth, min, max)
         let value = this.inverseNormalize(normalizeValue, screenValueMin, screenValueMax)

         switch (true) {
            case value < screenValueMax:
               value = screenValueMax
               break
            case value > screenValueMin:
               value = screenValueMin
               break
         }

         console.log(normalizeValue + ' + ' + value)

         gameScreenWidth = window.innerWidth * value
         gameScreenHeight = window.innerHeight * value
      } else {
         switch (true) {
            case innerWidth < 300:
               console.log('< 300 ')
               gameScreenWidth = window.innerWidth * 1.35
               gameScreenHeight = window.innerHeight * 1.35
               break
            case innerWidth < 375:
               console.log('< 375')
               gameScreenWidth = window.innerWidth * 1.15
               gameScreenHeight = window.innerHeight * 1.15
               break
            case innerWidth >= 375 && innerWidth < 768:
               console.log('>= 375, < 768 ')
               gameScreenWidth = window.innerWidth
               gameScreenHeight = window.innerHeight
               break
            default:
               gameScreenWidth = window.innerWidth / 1.3
               gameScreenHeight = window.innerHeight / 1.3
               break
         }

         // if (+(window.innerHeight / window.innerWidth).toFixed(1) > 2.2) {
         //    console.log('> 1.8')
         //    gameScreenWidth = UIUtil.getCanvasWidth()
         //    gameScreenHeight = UIUtil.getCanvasHeight()
         // } else if (
         //    +(window.innerHeight / window.innerWidth).toFixed(1) < 2.3 &&
         //    +(window.innerHeight / window.innerWidth).toFixed(1) > 1.4
         // ) {
         //    console.log('< 1.8, > 1.4 ')
         //    console.log(window.innerWidth)
         //    console.log(window.innerHeight)
         //    gameScreenWidth = window.innerWidth
         //    gameScreenHeight = window.innerHeight
         // } else {
         //    //    gameScreenWidth = UIUtil.getCanvasWidth()
         //    //    gameScreenHeight = UIUtil.getCanvasHeight()
         //    gameScreenWidth = window.innerWidth / 1.75
         //    gameScreenHeight = window.innerHeight / 1.75
         // }
      }

      this.scale.setGameSize(gameScreenWidth, gameScreenHeight)
      this.scale.refresh()
      UIUtil.initialize(this.cameras.main.width, this.cameras.main.height)
      UIUtil.innerHeight = window.innerHeight
      UIUtil.parentWidth = this.scale.parentSize.width
      UIUtil.parentHeight = this.scale.parentSize.height
   }

   private hiddenFirstLoading(): void {
      let loading = window.document.getElementById('loading-container')
      if (loading != null) loading.remove()
   }
   normalize(val: number, min: number, max: number): number {
      return +((val - min) / (max - min)).toFixed(2)
   }

   inverseNormalize(normalizeVal: number, min: number, max: number): number {
      return +(normalizeVal * (max - min) + min).toFixed(2)
   }
}
