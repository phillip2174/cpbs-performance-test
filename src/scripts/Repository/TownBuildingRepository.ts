import { Observable, map, of } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { IngredientObjectBean } from '../Town/Bean/IngredientObjectBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { UserIngredientBean } from '../Ingredient/UserIngredientBean'
import { LocalStorageRepository } from './LocalStorageRepository'
import { RepositoryProvider } from './RepositoryProvider'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'

export class TownBuildingRepository {
    mockIngredientBeans: IngredientBean[]

    private localStorageRepository: LocalStorageRepository

    constructor() {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
    }

    getIngredientObjectData(): Observable<IngredientObjectBean[]> {
        return ResourceManager.instance
            .loadText('ingredient-object-data', 'assets/town/json/ingredient-object-data.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    getInteractableObjectData(): Observable<IngredientObjectBean[]> {
        return ResourceManager.instance
            .loadText('interactable-object-data', 'assets/town/json/interactable-object-data.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    getCurrentHiddenIngredientData(isCompletedTutorial: boolean): Observable<IngredientBean[]> {
        if (GameConfig.IS_MOCK_API) {
            if (isCompletedTutorial) {
                return ResourceManager.instance
                    .loadText(
                        'current-hidden-ingredient-bean-data',
                        'assets/town/json/current-hidden-ingredient-bean-data.json'
                    )
                    .pipe(map((json) => JSON.parse(json)))
            } else {
                return this.loadTutorialIngredientTutorialData()
            }
        } else {
            if (isCompletedTutorial) {
                let data: IngredientBean[] = []
                return of(data)
            } else {
                return this.loadTutorialIngredientTutorialData()
            }
        }
    }

    getNextHiddenIngredientData(): Observable<IngredientBean[]> {
        if (GameConfig.IS_MOCK_API) {
            return ResourceManager.instance
                .loadText('next-hidden-ingredient-bean-data', 'assets/town/json/next-hidden-ingredient-bean-data.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            let data: IngredientBean[] = []
            return of(data)
        }
    }

    getUserIngredientData(isCompletedTutorial: boolean): Observable<UserIngredientBean[]> {
        if (GameConfig.IS_MOCK_API) {
            return of(this.localStorageRepository.getUserIngredientBeansData(isCompletedTutorial))
        } else {
            if (isCompletedTutorial) {
                //API LOAD USER INGREDIENT
                const data: UserIngredientBean[] = []
                return of(data)
            } else {
                return of(this.localStorageRepository.getUserIngredientBeansData(isCompletedTutorial))
            }
        }
    }

    private loadTutorialIngredientTutorialData(): Observable<IngredientBean[]> {
        return ResourceManager.instance
            .loadText('tutorial-hidden-ingredient-data', 'assets/town/json/tutorial-hidden-ingredient-data.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    interactObject(id: number, isCompletedTutorial: boolean): Observable<UserIngredientBean> {
        if (GameConfig.IS_MOCK_API) {
            if (isCompletedTutorial) {
                const userBean = new UserIngredientBean(id, id)

                this.localStorageRepository.saveUserIngredientBeansData(userBean)
                return of(userBean)
            } else {
                return this.createMockUserIngredientBean(id)
            }
        } else {
            if (isCompletedTutorial) {
                return this.createMockUserIngredientBean(id)
            } else {
                return this.createMockUserIngredientBean(id)
            }
        }
    }

    createMockUserIngredientBean(id: number): Observable<UserIngredientBean> {
        const userBean = new UserIngredientBean(id, id)
        return of(userBean)
    }

    setMockIngredientBeans(mockData: IngredientBean[]) {
        this.mockIngredientBeans = Object.assign([], mockData)
    }
}
