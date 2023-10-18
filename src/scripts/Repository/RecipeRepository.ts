import { Observable, map, of } from 'rxjs'
import { RecipeBean } from '../Town/Collection/RecipeBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { UserRecipe } from '../Town/Collection/UserRecipe'
import { GameConfig } from '../GameConfig'
import { CookState } from '../Town/Collection/type/CookState'
import { BonusBean } from '../Town/Recipe/BonusBean'

export class RecipeRepository {
    private userRecipes: UserRecipe[] = []
    getRecipeMasterData(): Observable<RecipeBean[]> {
        return ResourceManager.instance
            .loadText('recipe-master-mock', 'assets/town/json/recipe-master-mock.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    getUserRecipeData(): Observable<UserRecipe[]> {
        if (GameConfig.IS_MOCK_API) {
            let userRecipes: UserRecipe[] = [
                // new UserRecipe('test01', 1, CookState.Unlocked),
                //new UserRecipe('test01', 3, CookState.Unlocked),
                // new UserRecipe('test01', 5, CookState.Unlocked, new BonusBean(16, 10)),
                // new UserRecipe('test01', 4, CookState.Cooked, new BonusBean(19, 5)),
            ]
            this.userRecipes = userRecipes
            return of(userRecipes)
        } else {
            let userRecipe: UserRecipe[] = []
            return of(userRecipe)
        }
    }

    cookedRecipeMenu(recipeBean: RecipeBean): Observable<UserRecipe> {
        if (GameConfig.IS_MOCK_API) {
            let createUserRecipe = new UserRecipe('test01', recipeBean.id, CookState.Cooked)
            // let createUserRecipe = new UserRecipe('test01', recipeBean.id, CookState.Cooked, new BonusBean(16, 10))
            return of(createUserRecipe)
        } else {
            return of(undefined)
        }
    }

    unlockedRecipeMenu(userRecipe: UserRecipe): Observable<UserRecipe[]> {
        if (GameConfig.IS_MOCK_API) {
            let result = this.userRecipes.find((bean) => bean.id == userRecipe.id)
            result.state = CookState.Unlocked
            return of(this.userRecipes)
        } else {
            return of(undefined)
        }
    }
}
