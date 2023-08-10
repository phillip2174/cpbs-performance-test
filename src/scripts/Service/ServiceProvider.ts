import { LazyGetter } from 'lazy-get-decorator'
import { TownBuildingService } from './TownBuildingService'


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

}
