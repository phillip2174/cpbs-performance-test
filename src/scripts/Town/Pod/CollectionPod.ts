import { BehaviorSubject, Observable, Subject, map, of } from 'rxjs'
import { CollectionPanelState } from '../Collection/type/CollectionPanelState'
import { RecipeBean } from '../Collection/RecipeBean'
import { RecipeRepository } from '../../Repository/RecipeRepository'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { GameConfig } from '../../GameConfig'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'
import { RecipeType } from '../Collection/type/RecipeType'
import { UserRecipe } from '../Collection/UserRecipe'
import { CookState } from '../Collection/type/CookState'
import { CollectionDetailState } from '../Collection/type/CollectionDetailState'
import { RecipePod } from '../../pod/RecipePod'
import { PodProvider } from '../../pod/PodProvider'

export class CollectionPod {
    public collectionPanelState: BehaviorSubject<CollectionPanelState> = new BehaviorSubject<CollectionPanelState>(
        CollectionPanelState.CollectionList
    )
    public collectionFilterState: BehaviorSubject<RecipeFilterType> = new BehaviorSubject<RecipeFilterType>(
        RecipeFilterType.All
    )

    public collectionDetailState: CollectionDetailState

    public currentDetailRecipeSelected: Subject<RecipeBean> = new Subject<RecipeBean>()

    public notificationFilterCollection: BehaviorSubject<RecipeFilterType[]> = new BehaviorSubject<RecipeFilterType[]>(
        []
    )

    public isAlreadyOpen: boolean = false
    public isDragScrollView: boolean
    public isDragScrollViewFilter: boolean
    public isDragScrollViewDetail: boolean

    public currentRecipeURL: string

    constructor() {}

    public changeState(state: CollectionPanelState) {
        if (this.collectionPanelState.value != state) {
            this.collectionPanelState.next(state)
        }
    }

    public changeStateFilter(state: RecipeFilterType) {
        this.collectionFilterState.next(state)
    }

    public setStateDetail(state: CollectionDetailState) {
        this.collectionDetailState = state
    }

    public changeNotificationCollection(arrNotificationFilterCollection: RecipeFilterType[]) {
        this.notificationFilterCollection.next(arrNotificationFilterCollection)
    }

    public setCurrentDetailSelectedRecipe(bean: RecipeBean) {
        this.currentDetailRecipeSelected.next(bean)
    }

    public findCookedUserToPushNotification() {
        let filterNotifications: RecipeFilterType[] = []
        this.changeNotificationCollection(filterNotifications)

        PodProvider.instance.recipePod.userRecipeBeans
            .filter((userRecipeCooked) => userRecipeCooked.state == CookState.Cooked)
            .forEach((userRecipe) => {
                let bean = PodProvider.instance.recipePod.getRecipeBeanWithID(userRecipe.id)
                if (bean != undefined) {
                    if (!bean.secretUnlock) {
                        switch (bean.type) {
                            case RecipeType.Easy:
                                if (!this.notificationFilterCollection.value.includes(RecipeFilterType.Easy))
                                    filterNotifications.push(RecipeFilterType.Easy)
                                break
                            case RecipeType.Normal:
                                if (!this.notificationFilterCollection.value.includes(RecipeFilterType.Normal))
                                    filterNotifications.push(RecipeFilterType.Normal)
                                break
                            case RecipeType.Hard:
                                if (!this.notificationFilterCollection.value.includes(RecipeFilterType.Hard))
                                    filterNotifications.push(RecipeFilterType.Hard)
                                break
                            case RecipeType.Challenge:
                                if (!this.notificationFilterCollection.value.includes(RecipeFilterType.Challenge))
                                    filterNotifications.push(RecipeFilterType.Challenge)
                                break
                        }
                    } else {
                        if (!this.notificationFilterCollection.value.includes(RecipeFilterType.Secret))
                            filterNotifications.push(RecipeFilterType.Secret)
                    }
                }
            })

        this.changeNotificationCollection(filterNotifications)
    }
}
