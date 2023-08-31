import { TownTimeState } from '../Town/Type/TownTimeState'

export class IngredientBean {
    public ingredientID: number
    public amount: number
    public townTimeState: TownTimeState
    public isFound: boolean

    constructor(ingredientID: number, amount: number, townTimeState: TownTimeState, isFound: boolean = false) {
        this.ingredientID = ingredientID
        this.amount = amount
        this.townTimeState = townTimeState
        this.isFound = isFound
    }
}
