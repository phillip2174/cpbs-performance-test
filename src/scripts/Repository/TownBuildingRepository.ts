import { Observable, map, of } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Guideline/IngredientBean'
import { IngredientObjectBean } from '../Town/Bean/IngredientObjectBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'

export class TownBuildingRepository {
    mockIngredientBeans: IngredientBean[]

    getIngredientObjectData(): Observable<IngredientObjectBean[]> {
        return ResourceManager.instance
            .loadText('ingredientObjectData', 'assets/town/ingredientObjectData.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    getInteractableObjectData(): Observable<IngredientObjectBean[]> {
        return ResourceManager.instance
            .loadText('interactableObjectData', 'assets/town/interactableObjectData.json')
            .pipe(map((json) => JSON.parse(json)))
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

    interactObject(id: number): Observable<IngredientBean> {
        if (GameConfig.IS_MOCK_DATA) {
            let result = this.mockIngredientBeans.find((x) => x.ingredientID == id)
            return of(result)
        } else {
            let result = this.mockIngredientBeans.find((x) => x.ingredientID == id)
            return of(result)
        }
    }

    setMockIngredientBeans(mockData: IngredientBean[]) {
        this.mockIngredientBeans = Object.assign([], mockData)
    }
}
