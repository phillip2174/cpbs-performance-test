import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { CameraControlPod } from '../../scripts/camera/CameraControlPod'
import { TownDayNightPod } from './TownDayNightPod'
import { GuideLineUIManager } from '../Guideline/GuideLineUIManager'
import { CountdownTimerPod } from './CountdownTimerPod'
import { BillboardObjectPod } from '../Town/Pod/BillboardObjectPod'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownUIButtonNotificationManager } from './../Town/TownUIButtonNotificationManager'

export class PodProvider {
   private static _instance: PodProvider

   private static getInstance() {
      if (!PodProvider._instance) {
         PodProvider._instance = new PodProvider()
      }
      return PodProvider._instance
   }

   static get instance(): PodProvider {
      return this.getInstance()
   }

   @LazyGetter()
   get cameraControlPod(): CameraControlPod {
      return new CameraControlPod()
   }

   @LazyGetter()
   get townbuildingPod(): TownBuildingPod {
      return new TownBuildingPod()
   }

   @LazyGetter()
   get townDayNightPod(): TownDayNightPod {
      return new TownDayNightPod()
   }

   @LazyGetter()
   get guideLineUIManager(): GuideLineUIManager {
      return new GuideLineUIManager()
   }

   @LazyGetter()
   get countdownTimerPod(): CountdownTimerPod {
      return new CountdownTimerPod()
   }

   @LazyGetter()
   get billboardObjectPod(): BillboardObjectPod {
      return new BillboardObjectPod()
   }

   @LazyGetter()
   get townUIPod(): TownUIPod {
      return new TownUIPod()
   }

   @LazyGetter()
   get townUIButtonNotificationManager(): TownUIButtonNotificationManager {
      return new TownUIButtonNotificationManager()
   }
}
