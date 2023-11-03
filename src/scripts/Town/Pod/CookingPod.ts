import { BehaviorSubject, Subject } from 'rxjs'
import { CookingPanelState } from '../Cooking/CookingPanelState'
import { RecipeBean } from '../Collection/RecipeBean'
import { CookingDetailState } from '../Cooking/CookingDetailState'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'

export class CookingPod {
    public cookingPanelState: BehaviorSubject<CookingPanelState> = new BehaviorSubject<CookingPanelState>(
        CookingPanelState.CookingList
    )
    public cookingDetailState: BehaviorSubject<CookingDetailState> = new BehaviorSubject<CookingDetailState>(
        CookingDetailState.CookingSelectRecipe
    )
    public cookingFilterState: BehaviorSubject<RecipeFilterType> = new BehaviorSubject<RecipeFilterType>(
        RecipeFilterType.All
    )

    public totalReadyCurrentSelectedFilter: Subject<number> = new Subject<number>()

    public currentRecipeBean: Subject<RecipeBean> = new Subject<RecipeBean>()

    public notificationFilterCooking: BehaviorSubject<RecipeFilterType[]> = new BehaviorSubject<RecipeFilterType[]>([])

    public isAlreadyOpen: boolean
    public isDragScrollViewCooking: boolean
    public isDragScrollViewFilter: boolean

    public changeCookingPanelState(state: CookingPanelState): void {
        this.cookingPanelState.next(state)
    }

    public changeCookingDetailState(state: CookingDetailState): void {
        this.cookingDetailState.next(state)
    }

    public changeCookingFilterState(state: RecipeFilterType): void {
        this.cookingFilterState.next(state)
    }

    public setCurrentRecipeBean(recipeBean: RecipeBean): void {
        this.currentRecipeBean.next(recipeBean)
    }

    public updateTotalReady(totalReady: number) {
        this.totalReadyCurrentSelectedFilter.next(totalReady)
    }

    public changeNotificationCooking(arrNotificationFilterCooking: RecipeFilterType[]) {
        this.notificationFilterCooking.next(arrNotificationFilterCooking)
    }
}
