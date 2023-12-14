import { Observable, map, of } from 'rxjs'
import { InventoryItemBean } from '../Town/Inventory/InventoryItemBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { GameConfig } from '../GameConfig'
import { RepositoryProvider } from './RepositoryProvider'
import { IngredientType } from '../Town/Type/IngredientType'

export class InventoryRepository {
    private inventoryItemBeans: InventoryItemBean[]

    public getInventoryItemData(isCompletedTutorial: boolean): Observable<InventoryItemBean[]> {
        if (GameConfig.IS_MOCK_API) {
            if (isCompletedTutorial) {
                return ResourceManager.instance
                    .loadText('inventory-item-mock', 'assets/town/json/inventory-item-mock.json')
                    .pipe(
                        map((json) => {
                            this.inventoryItemBeans = JSON.parse(json)

                            return this.inventoryItemBeans
                        })
                    )
            } else {
                this.inventoryItemBeans = this.getInventoryFromLocalData()
                return of(this.inventoryItemBeans)
            }
        } else {
            if (isCompletedTutorial) {
                return of(this.inventoryItemBeans)
            } else {
                this.inventoryItemBeans = this.getInventoryFromLocalData()
                return of(this.inventoryItemBeans)
            }
        }
    }

    private getInventoryFromLocalData(): InventoryItemBean[] {
        return RepositoryProvider.instance.localStorageRepository.getInventoryBeansData()
    }

    public updateTutorialInventory(
        itemID: number,
        amount: number,
        isCompletedTutorial: boolean
    ): Observable<InventoryItemBean[]> {
        return this.tutorialAddItem(itemID, amount, isCompletedTutorial)
    }

    private addItemOrUpdate(itemID: number, amount: number) {
        let itemBean = this.inventoryItemBeans.find((x) => x.id == itemID)
        if (itemBean == undefined) {
            this.inventoryItemBeans.push(new InventoryItemBean('test', itemID, IngredientType.Meat, amount, 0))
        } else {
            itemBean.amount = amount
        }
        RepositoryProvider.instance.localStorageRepository.saveInventoryBeansData(this.inventoryItemBeans)
    }

    private tutorialAddItem(itemID: number, amount: number, isCompletedTutorial: boolean) {
        if (this.inventoryItemBeans == undefined || this.inventoryItemBeans == null) {
            return this.getInventoryItemData(isCompletedTutorial).pipe(
                map((_) => {
                    this.checkItemTutorial(itemID, amount)
                    return this.inventoryItemBeans
                })
            )
        } else {
            this.checkItemTutorial(itemID, amount)
            return of(this.inventoryItemBeans)
        }
    }

    private checkItemTutorial(itemID: number, amount: number) {
        if (!this.inventoryItemBeans.some((x) => x.id == itemID)) {
            this.inventoryItemBeans.push(new InventoryItemBean('test', itemID, IngredientType.Meat, amount, 0))
            RepositoryProvider.instance.localStorageRepository.saveInventoryBeansData(this.inventoryItemBeans)
        }
    }
}
