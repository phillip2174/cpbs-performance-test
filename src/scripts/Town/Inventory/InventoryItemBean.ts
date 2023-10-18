import { IngredientType } from '../Type/IngredientType'

export class InventoryItemBean {
    public uid: string
    public id: number
    public type: IngredientType
    public amount: number

    constructor(uid?: string, id?: number, type?: IngredientType, amount?: number) {
        this.uid = uid
        this.id = id
        this.type = type
        this.amount = amount
    }
}
