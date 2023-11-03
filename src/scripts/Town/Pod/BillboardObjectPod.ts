import { Observable } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { BillboardSizeType } from '../Type/BillboardSizeType'
import { BillboardObjectRepository } from './../../Repository/BillboardObjectRepository'

export class BillboardObjectPod {
    public currentBillBoardIndex: number = 1
    public max3DBillBoardIndex: number = 3

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

    public updateIndex3DIndex() {
        if (this.currentBillBoardIndex >= this.max3DBillBoardIndex) this.currentBillBoardIndex = 1
        else this.currentBillBoardIndex++
    }
}
