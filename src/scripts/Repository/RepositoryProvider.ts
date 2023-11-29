import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingRepository } from './TownBuildingRepository'
import { CountdownTimerRepository } from './CountdownTimerRepository'
import { BillboardObjectRepository } from './BillboardObjectRepository'
import { RecipeRepository } from './RecipeRepository'
import { InventoryRepository } from './InventoryRepository'
import { LocalStorageRepository } from './LocalStorageRepository'
import { DailyLoginRepository } from './DailyLoginRepository'
import { UserRepository } from './UserRepository'
import { MinigameRepository } from './MinigameRepository'
import { TutorialRepository } from './TutorialRepository'

export class RepositoryProvider {
    private static _instance: RepositoryProvider

    private static getInstance() {
        if (!RepositoryProvider._instance) {
            RepositoryProvider._instance = new RepositoryProvider()
        }
        return RepositoryProvider._instance
    }

    static get instance(): RepositoryProvider {
        return this.getInstance()
    }

    @LazyGetter()
    get townBuildingRepository(): TownBuildingRepository {
        return new TownBuildingRepository()
    }

    @LazyGetter()
    get countdownTimerRepository(): CountdownTimerRepository {
        return new CountdownTimerRepository()
    }

    @LazyGetter()
    get billboardObjectRepository(): BillboardObjectRepository {
        return new BillboardObjectRepository()
    }

    @LazyGetter()
    get recipeRepository(): RecipeRepository {
        return new RecipeRepository()
    }

    @LazyGetter()
    get inventoryRepository(): InventoryRepository {
        return new InventoryRepository()
    }

    @LazyGetter()
    get localStorageRepository(): LocalStorageRepository {
        return new LocalStorageRepository()
    }

    @LazyGetter()
    get dailyLoginRepository(): DailyLoginRepository {
        return new DailyLoginRepository()
    }

    @LazyGetter()
    get userRepository(): UserRepository {
        return new UserRepository()
    }

    @LazyGetter()
    get minigameRepository(): MinigameRepository {
        return new MinigameRepository()
    }

    @LazyGetter()
    get tutorialRepository(): TutorialRepository {
        return new TutorialRepository()
    }
}
