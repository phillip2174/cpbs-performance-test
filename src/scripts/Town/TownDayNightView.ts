import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { TownTimeState } from './TownTimeState'
import { PodProvider } from '../pod/PodProvider'
import { CountdownTimerPod } from '../pod/CountdownTimerPod'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { GameConfig } from '../GameConfig'
import { CameraControlView } from '../camera/CameraControlView'

export class TownDayNightView extends GameObjects.GameObject {
   private nightBg: GameObjects.Rectangle //*Change to image later*
   private townDayNightPod: TownDayNightPod
   private countdownTimerPod: CountdownTimerPod
   private cameraControlView: CameraControlView
   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   private setupSubscribe(): void {
      this.townDayNightPod.townTimeState.subscribe((state) => {
         if (!GameConfig.IS_MOCK_DAY_NIGHT) {
            this.countdownTimerPod.getCurrentTownTimeStateByTimeStamp().subscribe((timeState) => {
               if (timeState != state) {
                  this.townDayNightPod.setTownTimeState(timeState)
                  this.ShowReloadPopup()
                  return
               }
               switch (state) {
                  case TownTimeState.Day:
                     this.nightBg.fillAlpha = 0
                     break
                  case TownTimeState.Night:
                     this.nightBg.fillAlpha = 0.6
                     break
               }
            })
         } else {
            switch (state) {
               case TownTimeState.Day:
                  this.nightBg.fillAlpha = 0
                  break
               case TownTimeState.Night:
                  this.nightBg.fillAlpha = 0.6
                  break
            }
         }
      })
   }

   private ShowReloadPopup(): void {
      this.cameraControlView.disableCameraMovements()
      AlertDialogue.showConfirmPopup(
         this.scene,
         'Warning',
         'Your current time is not\n the same as the server! \nPlease reload the page!',
         () => {
            this.cameraControlView.enableCameraMovements()
            //Reload page when integrate with backend
            //location.reload()
         },
         'OK'
      )
   }

   public doInit(camera: CameraControlView): void {
      this.cameraControlView = camera
      this.townDayNightPod = PodProvider.instance.townDayNightPod
      this.townDayNightPod.doInit()
      this.countdownTimerPod = PodProvider.instance.countdownTimerPod
      this.nightBg = this.scene.add
         .rectangle(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 1920, 1200, 0x191970, 0)
         .setDepth(3)

      this.setupSubscribe()
   }
}
