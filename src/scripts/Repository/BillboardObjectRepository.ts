import { Observable } from 'rxjs'
import { BillboardObjectService } from '../Service/BillboardObjectService'
import { ServiceProvider } from '../Service/ServiceProvider'

export class BillboardObjectRepository {
   private billboardObjectService: BillboardObjectService

   constructor() {
      this.billboardObjectService = ServiceProvider.instance.billboardObjectService
   }

   public getBigBillboardImageKeys(): Observable<string[]> {
      return this.billboardObjectService.getBigBillboardImageKeys()
   }

   public getMediumBillboardImageKeys(): Observable<string[]> {
      return this.billboardObjectService.getMediumBillboardImageKeys()
   }

   public getSmallBillboardImageKeys(): Observable<string[]> {
      return this.billboardObjectService.getSmallBillboardImageKeys()
   }
}
