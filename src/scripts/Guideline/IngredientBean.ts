import { TownTimeState } from '../Town/Type/TownTimeState'

export class IngredientBean {
    public id: number
    public amount: number
    public townTimeState: TownTimeState
    public isFound: boolean

    constructor(ingredientID: number, amount: number, townTimeState: TownTimeState, isFound: boolean = false) {
        this.id = ingredientID
        this.amount = amount
        this.townTimeState = townTimeState
        this.isFound = isFound
    }
}
