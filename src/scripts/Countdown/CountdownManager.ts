import { GameObjects, Scene, Time } from 'phaser'
import { Subscription } from 'rxjs'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { CameraControlView } from '../camera/CameraControlView'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { CountdownTimerPod } from '../pod/CountdownTimerPod'
import { PodProvider } from '../pod/PodProvider'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { TextAdapter } from '../text-adapter/TextAdapter'

export class CountdownManager extends GameObjects.GameObject {
   private static readonly TIMER_BACKGROUND_KEY: string = 'timer-'
   private static readonly TIMER_ICON_KEY: string = '-icon'
   private countdownTimerText: GameObjects.Text
   private timeText: GameObjects.Text
   private countdownTimerBackground: GameObjects.Image
   private countdownTimerIcon: GameObjects.Image
   private countdownTimerEvent: Time.TimerEvent
   private isDay: boolean = false
   private townDayNightPod: TownDayNightPod
   private countdownTimerPod: CountdownTimerPod
   private cameraControlView: CameraControlView
   private isAllFoundSubscription: Subscription

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   private setupSubscribe(): void {
      this.townDayNightPod.townTimeState.subscribe((state) => {
         this.setupTimerBackgroundAndIcon(state)
         switch (state) {
            case TownTimeState.Day:
               this.isDay = true
               break
            case TownTimeState.Night:
               this.isDay = false
               break
         }
      })

      this.isAllFoundSubscription = PodProvider.instance.guideLineUIManager.isAllFound.subscribe((isFound) => {
         if (isFound) {
            this.doOnIsAllFound()
         }
      })
   }

   private doOnIsAllFound() {
      this.countdownTimerText.setPosition(UIUtil.getCanvasWidth() / 2, UIUtil.getCanvasHeight() - 40)

      let text = TextAdapter.instance
         .getVectorText(this.scene, 'FC_Lamoon_Bold')
         .setText('Coming in : ')
         .setPosition(UIUtil.getCanvasWidth() / 2, UIUtil.getCanvasHeight() - 80)
         .setOrigin(0.5, 0.5)
         .setStyle({
            fill: '#ff0000',
            fontSize: 30,
         })
         .setDepth(3)
   }

   private setupTimerBackgroundAndIcon(state: TownTimeState): void {
      this.countdownTimerBackground?.destroy()
      this.countdownTimerIcon?.destroy()

      this.countdownTimerBackground = this.scene.add
         .image(
            UIUtil.getCanvasWidth() / 2,
            UIUtil.getCanvasHeight() - 110,
            CountdownManager.TIMER_BACKGROUND_KEY + state.toLowerCase()
         )
         .setDepth(3)
         .setOrigin(0.5)
         .setScale(1)

      this.countdownTimerIcon = this.scene.add
         .image(
            this.countdownTimerBackground.x - 52,
            UIUtil.getCanvasHeight() - 123,
            state.toLowerCase() + CountdownManager.TIMER_ICON_KEY
         )
         .setDepth(3)
         .setOrigin(0.5)
   }

   private setupCountdownTimerText(): void {
      this.timeText = TextAdapter.instance
         .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
         .setText('เวลา')
         .setOrigin(0.5)
         .setPosition(this.countdownTimerBackground.x - 12, this.countdownTimerIcon.y + 6)
         .setStyle({
            fill: '#ffffff',
            fontSize: 22,
         })
         .setDepth(4)

      this.countdownTimerText = TextAdapter.instance
         .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
         .setText('00:00:00')
         .setOrigin(0.5)
         .setPosition(this.countdownTimerBackground.x + 36, this.countdownTimerIcon.y + 6.25)
         .setStyle({
            fill: '#ffffff',
            fontSize: 21,
         })
         .setDepth(4)
   }

   private ShowReloadPopupWhenCountdownFinish(): void {
      this.countdownTimerPod.updateTimeDiffTimeStamp()
      if (this.countdownTimerPod.checkIsCountdownFinish()) {
         this.countdownTimerEvent.destroy()
         this.ShowReloadPopup()
      }
   }

   private ShowReloadPopup(): void {
      this.cameraControlView.disableCameraMovements()
      AlertDialogue.showConfirmPopup(
         this.scene,
         'Reminder',
         "Time's up!\n Another set of ingredients\n is coming!",
         () => {
            if (this.isDay) {
               this.townDayNightPod.setTownTimeState(TownTimeState.Night)
            } else {
               this.townDayNightPod.setTownTimeState(TownTimeState.Day)
            }
            location.reload()
         },
         'OK'
      )
   }

   private updateCountdownTimerText(): void {
      this.countdownTimerPod.setTimeDiffTimes()
      this.countdownTimerText.setText(
         this.countdownTimerPod.timeDiffhours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            ':' +
            this.countdownTimerPod.timeDiffminutes.toLocaleString('en-US', {
               minimumIntegerDigits: 2,
               useGrouping: false,
            }) +
            ':' +
            this.countdownTimerPod.timeDiffseconds.toLocaleString('en-US', {
               minimumIntegerDigits: 2,
               useGrouping: false,
            })
      )
   }

   public doInit(camera: CameraControlView): void {
      this.cameraControlView = camera
      this.townDayNightPod = PodProvider.instance.townDayNightPod
      this.countdownTimerPod = PodProvider.instance.countdownTimerPod

      this.setupSubscribe()
      this.setupCountdownTimerText()
      this.countdownTimerEvent = this.scene.time.addEvent({
         delay: 100,
         repeat: -1,
         callback: () => {
            this.ShowReloadPopupWhenCountdownFinish()
            this.updateCountdownTimerText()
         },
      })
   }
}
