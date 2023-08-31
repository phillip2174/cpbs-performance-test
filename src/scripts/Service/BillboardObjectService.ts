import { Observable, of } from 'rxjs'

export class BillboardObjectService {
   private static readonly BILLBOARD_DEFAULT_KEY: string = 'billboard-0'
   private bigBillboardImageKeys: string[] = []
   private mediumBillboardImageKeys: string[] = []
   private smallBillboardImageKeys: string[] = []

   public getBigBillboardImageKeys(): Observable<string[]> {
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1')
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1-g')
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1-b')
      return of(this.bigBillboardImageKeys)
   }

   public getMediumBillboardImageKeys(): Observable<string[]> {
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2')
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2-g')
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2-b')
      return of(this.mediumBillboardImageKeys)
   }

   public getSmallBillboardImageKeys(): Observable<string[]> {
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3')
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3-g')
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3-b')
      return of(this.smallBillboardImageKeys)
   }
}
