import { Observable } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { BillboardSizeType } from '../Type/BillboardSizeType'
import { BillboardObjectRepository } from './../../Repository/BillboardObjectRepository'

export class BillboardObjectPod {
   private billboardObjectRepository: BillboardObjectRepository

   constructor() {
      this.billboardObjectRepository = RepositoryProvider.instance.billboardObjectRepository
   }

   public getBillboardImageKeysBySizeType(sizeType: BillboardSizeType): Observable<string[]> {
      switch (sizeType) {
         case BillboardSizeType.Small:
            return this.billboardObjectRepository.getSmallBillboardImageKeys()
         case BillboardSizeType.Medium:
            return this.billboardObjectRepository.getMediumBillboardImageKeys()
         case BillboardSizeType.Big:
            return this.billboardObjectRepository.getBigBillboardImageKeys()
      }
   }
}
