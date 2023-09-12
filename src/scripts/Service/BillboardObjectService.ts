import { Observable, of } from 'rxjs'

export class BillboardObjectService {
   private static readonly BILLBOARD_DEFAULT_KEY: string = 'billboard-0'
   private bigBillboardImageKeys: string[] = []
   private mediumBillboardImageKeys: string[] = []
   private smallBillboardImageKeys: string[] = []

   public getBigBillboardImageKeys(): Observable<string[]> {
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1-1')
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1-2')
      this.bigBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '1-3')
      return of(this.bigBillboardImageKeys)
   }

   public getMediumBillboardImageKeys(): Observable<string[]> {
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2-1')
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2-2')
      this.mediumBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '2-3')
      return of(this.mediumBillboardImageKeys)
   }

   public getSmallBillboardImageKeys(): Observable<string[]> {
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3-1')
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3-2')
      this.smallBillboardImageKeys.push(BillboardObjectService.BILLBOARD_DEFAULT_KEY + '3-3')
      return of(this.smallBillboardImageKeys)
   }
}
