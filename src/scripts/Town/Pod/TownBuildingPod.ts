import { Observable, filter, map, tap } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { TownBuildingRepository } from '../../Repository/TownBuildingRepository'
import { InteractableObjectBean } from '../InteractableObjectBean'
import { IngredientBean } from '../../Guideline/IngredientBean'
import { TownTimeState } from '../TownTimeState'
import { InteractableObjectPickupState } from '../Type/InteractableObjectPickupState'
import { GameConfig } from '../../GameConfig'

export class TownBuildingPod {
   interactableObjects: InteractableObjectBean[]
   ingredientBeans: IngredientBean[]

   private townBuildingRepository: TownBuildingRepository

   constructor() {
      this.townBuildingRepository = RepositoryProvider.instance.townBuildingRepository
   }

   getInteractableObjects(): Observable<InteractableObjectBean[]> {
      return this.townBuildingRepository.getInteractableData().pipe(
         map((x) => {
            this.interactableObjects = x
            console.log('interactableObjects Count : ' + this.interactableObjects.length)
            console.log(x)
            return this.interactableObjects
         })
      )
   }
   interactObject(): Observable<IngredientBean> {
      return this.townBuildingRepository.interactObject()
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
