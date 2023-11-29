import { Observable, Subject, map, of } from 'rxjs'
import { GameConfig } from '../../GameConfig'
import { IngredientBean } from '../../Ingredient/IngredientBean'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { TownBuildingRepository } from '../../Repository/TownBuildingRepository'
import { IngredientObjectBean } from '../Bean/IngredientObjectBean'
import { TownTimeState } from '../Type/TownTimeState'
import { PodProvider } from '../../pod/PodProvider'
import { UserIngredientBean } from '../../Ingredient/UserIngredientBean'

export class TownBuildingPod {
    public firstInit: Subject<boolean> = new Subject<boolean>()

    ingredientObjects: IngredientObjectBean[]
    interactableObjects: IngredientObjectBean[]
    currentHiddenIngredientBeans: IngredientBean[]
    nextHiddenIngredientBeans: IngredientBean[]
    userIngredientBeans: UserIngredientBean[]

    private townBuildingRepository: TownBuildingRepository

    constructor() {
        this.townBuildingRepository = RepositoryProvider.instance.townBuildingRepository
    }

    setFirstLoad() {
        this.firstInit.next(true)
    }

    getIngredientObjectsDataPosition(): Observable<IngredientObjectBean[]> {
        return this.townBuildingRepository.getIngredientObjectData().pipe(
            map((x) => {
                this.ingredientObjects = x
                console.log('IngredientObjects Count : ' + this.ingredientObjects.length)
                console.log(x)
                return this.ingredientObjects
            })
        )
    }

    getInteractableObjectsDataPosition(): Observable<IngredientObjectBean[]> {
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
        return this.townBuildingRepository
            .interactObject(id, PodProvider.instance.tutorialManager.isCompletedTutorial())
            .pipe(
                map((userBean) => {
                    return this.currentHiddenIngredientBeans.find((x) => x.id == userBean.id)
                })
            )
    }

    getCurrentHiddenIngredientData(): Observable<IngredientBean[]> {
        if (this.currentHiddenIngredientBeans == undefined || this.currentHiddenIngredientBeans == null) {
            return this.townBuildingRepository
                .getCurrentHiddenIngredientData(PodProvider.instance.tutorialManager.isCompletedTutorial())
                .pipe(
                    map((beanList) => {
                        this.currentHiddenIngredientBeans = beanList
                        console.log('hidden ingredientBeans Count: ' + this.currentHiddenIngredientBeans.length)
                        console.log(this.currentHiddenIngredientBeans)

                        if (GameConfig.IS_MOCK_API) {
                            this.townBuildingRepository.setMockIngredientBeans(this.currentHiddenIngredientBeans)
                        }

                        return this.currentHiddenIngredientBeans
                    })
                )
        } else {
            console.log('hidden ingredientBeans Count: ' + this.currentHiddenIngredientBeans.length)
            console.log(this.currentHiddenIngredientBeans)
            return of(this.currentHiddenIngredientBeans)
        }
    }

    getUserIngredientData(): Observable<UserIngredientBean[]> {
        if (this.userIngredientBeans == undefined || this.userIngredientBeans == null) {
            return this.townBuildingRepository
                .getUserIngredientData(PodProvider.instance.tutorialManager.isCompletedTutorial())
                .pipe(
                    map((userBean) => {
                        this.userIngredientBeans = userBean
                        console.log('user ingredientBeans Count: ' + this.userIngredientBeans.length)
                        console.log(this.userIngredientBeans)

                        return this.userIngredientBeans
                    })
                )
        } else {
            console.log('user ingredientBeans Count: ' + this.userIngredientBeans.length)
            console.log(this.userIngredientBeans)

            return of(this.userIngredientBeans)
        }
    }

    getNextHiddenIngredientData(): Observable<IngredientBean[]> {
        if (this.nextHiddenIngredientBeans == undefined || this.nextHiddenIngredientBeans == null) {
            return this.townBuildingRepository.getNextHiddenIngredientData().pipe(
                map((beanList) => {
                    this.nextHiddenIngredientBeans = beanList
                    console.log('next hidden ingredientBeans Count: ' + this.nextHiddenIngredientBeans.length)
                    console.log(this.nextHiddenIngredientBeans)

                    return this.nextHiddenIngredientBeans
                })
            )
        } else {
            console.log('next hidden ingredientBeans Count: ' + this.nextHiddenIngredientBeans.length)
            console.log(this.nextHiddenIngredientBeans)
            return of(this.nextHiddenIngredientBeans)
        }
    }

    getIngredientBeanNotFoundWithUser(): IngredientBean[] {
        let arrIngredientBean: IngredientBean[] = [...this.currentHiddenIngredientBeans]

        this.userIngredientBeans.forEach((userData) => {
            let beanIndex = arrIngredientBean.findIndex((x) => x.id === userData.id)

            if (beanIndex !== -1) {
                arrIngredientBean.splice(beanIndex, 1)
            }
        })
        console.log(`current ingredient count ${arrIngredientBean.length}`)
        console.log(arrIngredientBean)
        console.log(`original hidden ingreidnet ${this.currentHiddenIngredientBeans.length}`)
        console.log(this.currentHiddenIngredientBeans)
        return arrIngredientBean
    }
}
