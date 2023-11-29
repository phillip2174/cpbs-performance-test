import { RecipeType } from './type/RecipeType'
import { CookState } from './type/CookState'
import { SecretRecipeBean } from './SecretRecipeBean'
import { IngredientDesc } from './IngredientDescBean'
import { UserRecipe } from './UserRecipe'
import { IngredientBean } from '../../Ingredient/IngredientBean'

export class RecipeBean {
    public id: number
    public title: string
    public description: string
    public type: RecipeType
    public secretUnlock: SecretRecipeBean
    public rewardPoint: number
    public ingredients: IngredientBean[]
    public ingredientDescs: IngredientDesc[]
    public linkoutUrl: string
    public userRecipeBean: UserRecipe

    constructor(
        id: number,
        title: string,
        description: string,
        type: RecipeType,
        secretUnlock: SecretRecipeBean,
        rewardPoint: number,
        ingredients: IngredientBean[],
        ingredientDescs: IngredientDesc[],
        linkoutUrl: string
    ) {
        this.id = id
        this.title = title
        this.description = description
        this.type = type
        this.secretUnlock = secretUnlock
        this.rewardPoint = rewardPoint
        this.ingredients = ingredients
        this.ingredientDescs = ingredientDescs
        this.linkoutUrl = linkoutUrl
    }
}
