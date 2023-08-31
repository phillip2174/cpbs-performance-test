import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingRepository } from './TownBuildingRepository'
import { CountdownTimerRepository } from './CountdownTimerRepository'
import { BillboardObjectRepository } from './BillboardObjectRepository'

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
}
