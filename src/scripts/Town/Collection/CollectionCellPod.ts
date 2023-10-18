import { Pod } from '../../plugins/objects/Pod'
import { RecipeBean } from './RecipeBean'
import { UserRecipe } from './UserRecipe'

export class CollectionCellPod extends Pod {
    public recipeBean: RecipeBean
    public userRecipe: UserRecipe

    public setRecipeCellBean(bean: RecipeBean) {
        this.recipeBean = bean
    }

    public setUserRecipeBean(bean: UserRecipe) {
        this.userRecipe = bean
        this.recipeBean.userRecipeBean = bean
    }
}
