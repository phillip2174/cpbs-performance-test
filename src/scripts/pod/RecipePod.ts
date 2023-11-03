import { Observable, Subject, map, of, tap } from 'rxjs'
import { RecipeBean } from '../Town/Collection/RecipeBean'
import { UserRecipe } from '../Town/Collection/UserRecipe'
import { RecipeFilterType } from '../Town/Recipe/RecipeFilterType'
import { RecipeType } from '../Town/Collection/type/RecipeType'
import { CookState } from '../Town/Collection/type/CookState'
import { RecipeRepository } from '../Repository/RecipeRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { CollectionPod } from '../Town/Pod/CollectionPod'
import { PodProvider } from './PodProvider'

export class RecipePod {
    public userRecipeBeans: UserRecipe[]
    public recipeBeans: RecipeBean[]

    public totalUnlockedCurrentSelectedFilter: Subject<number> = new Subject<number>()
    public totalUserCookedCurrentSelectedFilter: Subject<number> = new Subject<number>()

    public totalMasterRecipe: number = 0
    public totalUnlockedRecipe: number = 0
    public totalUserCookedRecipe: number = 0

    private currentFilterRecipeBeans: RecipeBean[]

    private recipeRepository: RecipeRepository
    private collectionPod: CollectionPod

    constructor() {
        this.recipeRepository = RepositoryProvider.instance.recipeRepository
        this.collectionPod = PodProvider.instance.collectionPod
    }

    public getRecipeData(filterType: RecipeFilterType): Observable<RecipeBean[]> {
        if (this.recipeBeans == undefined || this.recipeBeans == null) {
            return this.recipeRepository.getRecipeMasterData().pipe(
                map((recipes) => {
                    this.recipeBeans = recipes

                    console.log('recipeBeans Count: ' + this.recipeBeans.length)
                    console.log(this.recipeBeans)

                    return this.filterReturn(recipes, filterType, false) as RecipeBean[]
                })
            )
        } else {
            return this.filterReturn(this.recipeBeans, filterType, true) as Observable<RecipeBean[]>
        }
    }

    private filterReturn(
        recipeBeans: RecipeBean[],
        filterType: RecipeFilterType,
        isReturnOf: boolean
    ): Observable<RecipeBean[]> | RecipeBean[] {
        switch (filterType) {
            case RecipeFilterType.All:
                this.currentFilterRecipeBeans = recipeBeans
                this.setTotalMasterRecipe(this.currentFilterRecipeBeans.length)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
            case RecipeFilterType.Easy:
                this.currentFilterRecipeBeans = this.filterRecipeWithType(recipeBeans, RecipeType.Easy)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
            case RecipeFilterType.Normal:
                this.currentFilterRecipeBeans = this.filterRecipeWithType(recipeBeans, RecipeType.Normal)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
            case RecipeFilterType.Hard:
                this.currentFilterRecipeBeans = this.filterRecipeWithType(recipeBeans, RecipeType.Hard)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
            case RecipeFilterType.Challenge:
                this.currentFilterRecipeBeans = this.filterRecipeWithType(recipeBeans, RecipeType.Challenge)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
            case RecipeFilterType.Secret:
                this.currentFilterRecipeBeans = recipeBeans.filter((x) => x.secretUnlock != undefined)
                this.setTotalMasterRecipe(this.currentFilterRecipeBeans.length)
                return isReturnOf ? of(this.currentFilterRecipeBeans) : this.currentFilterRecipeBeans
        }
    }

    private filterRecipeWithType(recipeBeans: RecipeBean[], type: RecipeType) {
        let result = recipeBeans.filter((bean) => bean.type == type && bean.secretUnlock == undefined)

        return result
    }

    public getTypeReicpeWithFilterType(filterType: RecipeFilterType): RecipeType {
        switch (filterType) {
            case RecipeFilterType.Easy:
                return RecipeType.Easy
            case RecipeFilterType.Normal:
                return RecipeType.Normal
            case RecipeFilterType.Hard:
                return RecipeType.Hard
            case RecipeFilterType.Challenge:
                return RecipeType.Challenge
        }
    }

    public getNotificationTypeWithBean(bean: RecipeBean): RecipeFilterType {
        if (!bean.secretUnlock) {
            switch (bean.type) {
                case RecipeType.Easy:
                    return RecipeFilterType.Easy
                case RecipeType.Normal:
                    return RecipeFilterType.Normal
                case RecipeType.Hard:
                    return RecipeFilterType.Hard
                case RecipeType.Challenge:
                    return RecipeFilterType.Challenge
            }
        } else {
            return RecipeFilterType.Secret
        }
    }

    public setTotalMasterRecipe(total: number) {
        this.totalMasterRecipe = total
    }

    public getUserRecipeData(): Observable<UserRecipe[]> {
        if (this.userRecipeBeans == undefined || this.userRecipeBeans == null) {
            return this.recipeRepository.getUserRecipeData().pipe(
                map((userRecipes) => {
                    this.userRecipeBeans = userRecipes
                    this.updateTotalUserRecipe()
                    this.updateTotalUnlockedRecipe()
                    return userRecipes
                })
            )
        } else {
            return of(this.userRecipeBeans)
        }
    }

    public unlockedRecipeMenu(userRecipe: UserRecipe): Observable<UserRecipe[]> {
        return this.recipeRepository.unlockedRecipeMenu(userRecipe).pipe(
            map((beans) => {
                this.userRecipeBeans = beans

                this.updateTotalUnlockedRecipe()
                this.updateTotalUserRecipe()
                this.setTotalUnlockedCurrentSelectedFilter()
                this.collectionPod.findCookedUserToPushNotification()

                return beans
            })
        )
    }

    public cookedRecipeMenu(recipeMenu: RecipeBean): Observable<UserRecipe> {
        return this.recipeRepository.cookedRecipeMenu(recipeMenu).pipe(
            map((bean) => {
                this.addUserRecipeData(bean)
                this.updateTotalUserRecipe()
                this.getRecipeBeanWithID(recipeMenu.id).userRecipeBean = bean
                return bean
            })
        )
    }

    public getRecipeBeanWithID(id: number): RecipeBean {
        return this.recipeBeans.find((bean) => bean.id == id)
    }

    public getUserRecipeBeanWithID(id: number): UserRecipe {
        return this.userRecipeBeans.find((bean) => bean.id == id)
    }

    private addUserRecipeData(bean: UserRecipe) {
        this.userRecipeBeans.push(bean)
        this.updateTotalUnlockedRecipe()
        this.collectionPod.findCookedUserToPushNotification()
    }

    public updateTotalUnlockedRecipe() {
        this.totalUnlockedRecipe = this.userRecipeBeans.filter((x) => x.state == CookState.Unlocked).length
    }

    public updateTotalUserRecipe() {
        this.totalUserCookedRecipe = this.userRecipeBeans.length
    }

    public setTotalUserCookedSelectedFilter() {
        this.totalUserCookedCurrentSelectedFilter.next(
            this.currentFilterRecipeBeans.filter((bean) => bean.userRecipeBean != undefined).length
        )
    }

    public setTotalUnlockedCurrentSelectedFilter() {
        this.totalUnlockedCurrentSelectedFilter.next(
            this.currentFilterRecipeBeans.filter(
                (bean) => bean.userRecipeBean != undefined && bean.userRecipeBean.state == CookState.Unlocked
            ).length
        )
    }

    public mapUserUnlockedSecretToType(beanFilter: RecipeBean[], collectionFilterType: RecipeFilterType): RecipeBean[] {
        let userRecipeData = this.userRecipeBeans
        let beanWithUser: RecipeBean[] = []
        userRecipeData.map((userBean) => {
            let recipeBean = this.recipeBeans.find((bean) => bean.id == userBean.id)
            if (recipeBean != undefined) {
                recipeBean.userRecipeBean = userBean
                beanWithUser.push(recipeBean)
            }
        })

        if (collectionFilterType == RecipeFilterType.All || collectionFilterType == RecipeFilterType.Secret) {
            return beanFilter
        } else {
            let type = this.getTypeReicpeWithFilterType(collectionFilterType)
            beanWithUser
                .filter(
                    (bean) => bean.type == type && bean.userRecipeBean.state == CookState.Unlocked && bean.secretUnlock
                )
                .map((x) => {
                    beanFilter.push(x)
                })

            this.setTotalMasterRecipe(beanFilter.length)

            return beanFilter
        }
    }

    public groupByPerCount(arr: RecipeBean[], countPerGroup: number): RecipeBean[][] {
        var group: RecipeBean[][] = []
        for (var i = 0, end = arr.length / countPerGroup; i < end; ++i) {
            group.push(arr.slice(i * countPerGroup, (i + 1) * countPerGroup))
        }
        return group
    }
}
