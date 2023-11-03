import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { CameraControlPod } from '../../scripts/camera/CameraControlPod'
import { TownDayNightPod } from './TownDayNightPod'
import { GuideLineUIManager } from '../Guideline/GuideLineUIManager'
import { CountdownTimerPod } from './CountdownTimerPod'
import { BillboardObjectPod } from '../Town/Pod/BillboardObjectPod'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownUIButtonNotificationManager } from './../Town/TownUIButtonNotificationManager'
import { CollectionPod } from '../Town/Pod/CollectionPod'
import { AudioManager } from '../Audio/AudioManager'
import { InventoryPod } from './../Town/Inventory/InventoryPod'
import { CookingPod } from '../Town/Pod/CookingPod'
import { RecipePod } from './RecipePod'
import { DailyLoginPod } from './DailyLoginPod'
import { UserPod } from '../Town/Pod/UserPod'
import { SplashPod } from './SplashPod'
import { MinigameCPOrderPod } from '../minigame/minigame-2-cp-order/MinigameCPOrderPod'
import { MinigameScenePod } from './../minigame/MinigameScenePod'

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

    @LazyGetter()
    get collectionPod(): CollectionPod {
        return new CollectionPod()
    }

    @LazyGetter()
    get audioManager(): AudioManager {
        return new AudioManager()
    }

    @LazyGetter()
    get inventoryPod(): InventoryPod {
        return new InventoryPod()
    }

    @LazyGetter()
    get cookingPod(): CookingPod {
        return new CookingPod()
    }

    @LazyGetter()
    get recipePod(): RecipePod {
        return new RecipePod()
    }

    @LazyGetter()
    get dailyLoginPod(): DailyLoginPod {
        return new DailyLoginPod()
    }

    @LazyGetter()
    get userPod(): UserPod {
        return new UserPod()
    }

    @LazyGetter()
    get splashPod(): SplashPod {
        return new SplashPod()
    }

    @LazyGetter()
    get minigameScenePod(): MinigameScenePod {
        return new MinigameScenePod()
    }

    @LazyGetter()
    get minigameCPOrderPod(): MinigameCPOrderPod {
        return new MinigameCPOrderPod()
    }
}
