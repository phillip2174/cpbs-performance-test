import { Observable } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { BillboardSizeType } from '../Type/BillboardSizeType'
import { BillboardObjectRepository } from './../../Repository/BillboardObjectRepository'

export class BillboardObjectPod {
    public currentBillBoardIndex: number = 1
    public max3DBillBoardIndex: number = 3

    public currentLEDPixelIndex: number = 1
    public max3DLEDPixelIndex: number = 2

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

    public updateIndex3DPixelIndex() {
        if (this.currentLEDPixelIndex >= this.max3DLEDPixelIndex) this.currentLEDPixelIndex = 1
        else this.currentLEDPixelIndex++
    }
}
