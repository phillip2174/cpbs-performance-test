import { TownTimeState } from '../Town/Type/TownTimeState'

export class IngredientBean {
    public id: number
    public name: string
    public amount: number

    constructor(id: number, name: string, amount: number) {
        this.id = id
        this.name = name
        this.amount = amount
    }
}
