import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { CameraControlPod } from '../../scripts/camera/CameraControlPod'
import { TownDayNightPod } from './TownDayNightPod'
import { GuideLineUIManager } from '../Guideline/GuideLineUIManager'
import { CountdownTimerPod } from './CountdownTimerPod'

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
}
