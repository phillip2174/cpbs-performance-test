import { Observable, Observer, map, of } from 'rxjs'
import { InteractableObjectBean } from '../Town/InteractableObjectBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { InteractableObjectPickupState } from '../Town/Type/InteractableObjectPickupState'
import { IngredientBean } from '../Guideline/IngredientBean'
import { GameConfig } from '../GameConfig'

export class TownBuildingRepository {
    mockIngredientBeans: IngredientBean[]

    getInteractableData(): Observable<InteractableObjectBean[]> {
        if (GameConfig.IS_MOCK_DATA) {
            //JSON.parse(json)
            return ResourceManager.instance
                .loadText('interactableData', 'assets/town/interactableData.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            let data: InteractableObjectBean[] = []
            return of(data)
        }
    }

    getIngredientBeanData(): Observable<IngredientBean[]> {
        if (GameConfig.IS_MOCK_DATA) {
            return ResourceManager.instance
                .loadText('ingredientBeanData', 'assets/town/ingredientBeanData.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            let data: IngredientBean[] = []
            return of(data)
        }
    }

    interactObject(): Observable<IngredientBean> {
        let randomIndex = Math.floor(Math.random() * this.mockIngredientBeans.length)
        let randomResult = this.mockIngredientBeans[randomIndex]
        this.mockIngredientBeans.splice(randomIndex, 1)

        return of(randomResult)
    }

    setMockIngredientBeans(mockData: IngredientBean[]) {
        this.mockIngredientBeans = Object.assign([], mockData)
    }
}
