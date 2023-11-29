import { Observable, map, of } from 'rxjs'
import { InventoryItemBean } from '../Town/Inventory/InventoryItemBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { GameConfig } from '../GameConfig'

export class InventoryRepository {
    private inventoryItemBeans: InventoryItemBean[] = []

    public getInventoryItemData(): Observable<InventoryItemBean[]> {
        if (GameConfig.IS_MOCK_API) {
            return ResourceManager.instance
                .loadText('inventory-item-mock', 'assets/town/json/inventory-item-mock.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            return of(this.inventoryItemBeans)
        }
    }
}
