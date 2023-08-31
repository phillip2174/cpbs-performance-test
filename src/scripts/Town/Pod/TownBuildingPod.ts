import { Observable, filter, map, tap } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { TownBuildingRepository } from '../../Repository/TownBuildingRepository'
import { IngredientObjectBean } from '../Bean/IngredientObjectBean'
import { IngredientBean } from '../../Guideline/IngredientBean'
import { TownTimeState } from '../Type/TownTimeState'
import { InteractableObjectPickupState } from '../Type/InteractableObjectPickupState'
import { GameConfig } from '../../GameConfig'

export class TownBuildingPod {
    ingredientObjects: IngredientObjectBean[]
    interactableObjects: IngredientObjectBean[]
    ingredientBeans: IngredientBean[]

    private townBuildingRepository: TownBuildingRepository

    constructor() {
        this.townBuildingRepository = RepositoryProvider.instance.townBuildingRepository
    }

    getIngredientObjects(): Observable<IngredientObjectBean[]> {
        return this.townBuildingRepository.getIngredientObjectData().pipe(
            map((x) => {
                this.ingredientObjects = x
                console.log('IngredientObjects Count : ' + this.ingredientObjects.length)
                console.log(x)
                return this.ingredientObjects
            })
        )
    }

    getInteractableObjects(): Observable<IngredientObjectBean[]> {
        return this.townBuildingRepository.getInteractableObjectData().pipe(
            map((x) => {
                this.interactableObjects = x
                console.log('InteractableObject Count : ' + this.interactableObjects.length)
                console.log(x)
                return this.interactableObjects
            })
        )
    }
    interactObject(id: number): Observable<IngredientBean> {
        return this.townBuildingRepository.interactObject(id)
    }

    getIngredientBeansData(townTimeState: TownTimeState): Observable<IngredientBean[]> {
        return this.townBuildingRepository.getIngredientBeanData().pipe(
            map((x) => {
                let beanList = x.filter((bean) => bean.townTimeState == townTimeState)
                this.ingredientBeans = beanList
                console.log('ingredientBeans Count: ' + this.ingredientBeans.length)
                console.log(this.ingredientBeans)

                if (GameConfig.IS_MOCK_DATA) {
                    this.townBuildingRepository.setMockIngredientBeans(this.ingredientBeans)
                }

                return this.ingredientBeans
            })
        )
    }
}
