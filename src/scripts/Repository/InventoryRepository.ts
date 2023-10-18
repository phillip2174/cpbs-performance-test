import { Observable, map } from 'rxjs'
import { InventoryItemBean } from '../Town/Inventory/InventoryItemBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'

export class InventoryRepository {
    public getInventoryItemData(): Observable<InventoryItemBean[]> {
        return ResourceManager.instance
            .loadText('inventory-item-mock', 'assets/town/json/inventory-item-mock.json')
            .pipe(map((json) => JSON.parse(json)))
    }
}
