import { InventoryItemBean } from './InventoryItemBean'
import { InventoryRepository } from './../../Repository/InventoryRepository'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { BehaviorSubject, Observable, map, of } from 'rxjs'
import { InventoryFilterType } from './InventoryFilterType'
import { IngredientType } from '../Type/IngredientType'

export class InventoryPod {
    public inventoryItemBeans: InventoryItemBean[]
    public inventoryFilterState: BehaviorSubject<InventoryFilterType> = new BehaviorSubject<InventoryFilterType>(
        InventoryFilterType.All
    )
    public isAlreadyOpen: boolean = false
    private inventoryRepository: InventoryRepository

    constructor() {
        this.inventoryRepository = RepositoryProvider.instance.inventoryRepository
    }

    public getInventoryItemData(inventoryFilterType: InventoryFilterType): Observable<InventoryItemBean[]> {
        if (this.inventoryItemBeans == undefined || this.inventoryItemBeans == null) {
            return this.inventoryRepository.getInventoryItemData().pipe(
                map((inventoryItems) => {
                    this.inventoryItemBeans = inventoryItems
                    console.log('inventoryItemBeans Count: ' + this.inventoryItemBeans.length)
                    console.log(this.inventoryItemBeans)

                    return this.getInventoryItemBeansByType(inventoryFilterType)
                })
            )
        } else {
            return of(this.getInventoryItemBeansByType(inventoryFilterType))
        }
    }

    public changeInventoryFilterState(filterState: InventoryFilterType): void {
        this.inventoryFilterState.next(filterState)
    }

    private getInventoryItemBeansByType(inventoryFilterType: InventoryFilterType): InventoryItemBean[] {
        switch (inventoryFilterType) {
            case InventoryFilterType.All:
                return this.inventoryItemBeans
            case InventoryFilterType.Meat:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.Meat)
            case InventoryFilterType.Vegetable:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.Vegetable)
            case InventoryFilterType.FreshFood:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.FreshFood)
            case InventoryFilterType.Sausage:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.Sausage)
            case InventoryFilterType.Condiment:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.Condiments)
            case InventoryFilterType.Noodle:
                return this.inventoryItemBeans.filter((bean) => bean.type == IngredientType.Noodles)
        }
    }
}
