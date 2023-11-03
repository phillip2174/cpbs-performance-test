import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingService } from './TownBuildingService'
import { BillboardObjectService } from './BillboardObjectService'
import { CollectionService } from './CollectionService'
import { MinigameService } from './MinigameService'

export class ServiceProvider {
    private static _instance: ServiceProvider

    private static getInstance() {
        if (!ServiceProvider._instance) {
            ServiceProvider._instance = new ServiceProvider()
        }
        return ServiceProvider._instance
    }

    static get instance(): ServiceProvider {
        return this.getInstance()
    }

    @LazyGetter()
    get townBuildingService(): TownBuildingService {
        return new TownBuildingService()
    }

    @LazyGetter()
    get billboardObjectService(): BillboardObjectService {
        return new BillboardObjectService()
    }

    @LazyGetter()
    get collectionService(): CollectionService {
        return new CollectionService()
    }

    @LazyGetter()
    get minigameService(): MinigameService {
        return new MinigameService()
    }
}
