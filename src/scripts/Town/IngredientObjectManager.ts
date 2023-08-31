import { IngredientBean } from '../Guideline/IngredientBean'
import { RandomNumber } from '../plugins/Random'
import { IngredientObjectView } from './IngredientObjectView'

export class IngredientObjectManager {
    public ingredientObjectGroup: IngredientObjectView[] = []

    private static _instance: IngredientObjectManager

    private static getInstance() {
        if (!IngredientObjectManager._instance) {
            IngredientObjectManager._instance = new IngredientObjectManager()
        }
        return IngredientObjectManager._instance
    }
    static get instance() {
        return this.getInstance()
    }

    public addIngredientObjectGroup(object: IngredientObjectView) {
        this.ingredientObjectGroup.push(object)
    }

    public randomIngredientIdToIngredientObject(ingredientBeans: IngredientBean[]) {
        let cloneIngredientObjectViews: IngredientObjectView[]
        cloneIngredientObjectViews = Object.assign([], this.ingredientObjectGroup)

        let cloneIngredientNotFounds: IngredientBean[]
        cloneIngredientNotFounds = Object.assign(
            [],
            ingredientBeans.filter((x) => x.isFound == false)
        )

        console.log(` (###) clone cloneIngredientObjectGroup Count : ` + cloneIngredientObjectViews.length)
        console.log(` (###) clone cloneIngredientObjectNotFound Count : ` + cloneIngredientNotFounds.length)

        let roundCount: number = cloneIngredientNotFounds.length

        for (let i = 0; i < roundCount; i++) {
            let randomIndexIngredientObject = RandomNumber(0, cloneIngredientObjectViews.length - 1)
            let randomIngredientObjectNotFound = RandomNumber(0, cloneIngredientNotFounds.length - 1)

            let resultIngredientObjectView = cloneIngredientObjectViews[randomIndexIngredientObject]
            let resultIngredientObjectNotFoundBean = cloneIngredientNotFounds[randomIngredientObjectNotFound]

            resultIngredientObjectView.setFoundIngredient(resultIngredientObjectNotFoundBean.ingredientID)

            cloneIngredientObjectViews.splice(randomIndexIngredientObject, 1)
            cloneIngredientNotFounds.splice(randomIngredientObjectNotFound, 1)

            if (cloneIngredientObjectViews.length == 0) {
                console.log(`break`)
                break
            }
            console.log(` (###) clone interactableGroup left : ` + cloneIngredientObjectViews.length)
        }
    }
}
