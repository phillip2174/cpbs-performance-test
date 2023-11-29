import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { RandomNumber } from '../plugins/Random'
import { IngredientObjectView } from './IngredientObjectView'

export class IngredientObjectManager {
    public ingredientObjectRandomPool: IngredientObjectView[] = []

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

    public clearIngredientRandomPoolList() {
        this.ingredientObjectRandomPool = []
    }

    public addIngredientObjectToRandomPool(object: IngredientObjectView) {
        this.ingredientObjectRandomPool.push(object)
    }

    public randomIngredientIdToIngredientObject(hiddenIngredientBeans: IngredientBean[]) {
        let cloneIngredientObjectViews: IngredientObjectView[]
        cloneIngredientObjectViews = Object.assign([], this.ingredientObjectRandomPool)

        let cloneIngredientNotFounds: IngredientBean[]
        cloneIngredientNotFounds = Object.assign(
            [],
            hiddenIngredientBeans.map((x) => x)
        )

        console.log(` (###) clone cloneIngredientObjectGroup Count : ` + cloneIngredientObjectViews.length)
        console.log(` (###) clone cloneIngredientObjectNotFound Count : ` + cloneIngredientNotFounds.length)

        let roundCount: number = cloneIngredientNotFounds.length

        for (let i = 0; i < roundCount; i++) {
            let randomIndexIngredientObject = RandomNumber(0, cloneIngredientObjectViews.length - 1)
            let randomIngredientObjectNotFound = RandomNumber(0, cloneIngredientNotFounds.length - 1)

            let resultIngredientObjectView = cloneIngredientObjectViews[randomIndexIngredientObject]
            let resultIngredientObjectNotFoundBean = cloneIngredientNotFounds[randomIngredientObjectNotFound]

            resultIngredientObjectView.setFoundIngredient(resultIngredientObjectNotFoundBean.id)

            cloneIngredientObjectViews.splice(randomIndexIngredientObject, 1)
            cloneIngredientNotFounds.splice(randomIngredientObjectNotFound, 1)

            if (cloneIngredientObjectViews.length == 0) {
                console.log(`break`)
                break
            }
            console.log(` (###) clone interactableGroup left : ` + cloneIngredientObjectViews.length)
        }
    }

    public setIngredientObjectTutorial(
        originalCurrentIngredient: IngredientBean[],
        mapHiddenIngredientBeansWithUser: IngredientBean[]
    ) {
        const mapUserID = mapHiddenIngredientBeansWithUser.map((x) => x.id)
        GameConfig.TUTORIAL_INGREDIENT_OBJECT_ID.forEach((tutorialObjectID, index) => {
            const ingredientObject = this.ingredientObjectRandomPool.find(
                (object) => object.getIngredientObjectBean().id == tutorialObjectID
            )

            if (ingredientObject != undefined || ingredientObject != null) {
                if (mapUserID.includes(originalCurrentIngredient[index].id)) {
                    ingredientObject.setFoundIngredient(originalCurrentIngredient[index].id)
                }
            }
        })
    }
}
