import { BonusBean } from '../Recipe/BonusBean'
import { RecipeBean } from './RecipeBean'
import { CookState } from './type/CookState'

export class UserRecipe {
    public uid: string
    public id: number
    public state: CookState
    public bonus: BonusBean

    constructor(uid: string, id: number, state: CookState, bonus: BonusBean = undefined) {
        this.uid = uid
        this.id = id
        this.state = state
        this.bonus = bonus
    }
}
