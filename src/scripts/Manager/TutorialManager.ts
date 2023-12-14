import { BehaviorSubject, Observable, map } from 'rxjs'
import { TutorialDataBean } from '../../Tutorial/TutorialDataBean'
import { TutorialSaveBean } from '../../Tutorial/TutorialSaveBean'
import { TutorialState } from '../../Tutorial/TutorialState'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'
import { GameConfig } from '../GameConfig'
import { UserIngredientBean } from '../Ingredient/UserIngredientBean'
import { LocalStorageRepository } from '../Repository/LocalStorageRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { TutorialRepository } from '../Repository/TutorialRepository'
import { UserType } from '../User/UserType'
import { PodProvider } from '../pod/PodProvider'
import { UserPod } from './../Town/Pod/UserPod'

export class TutorialManager {
    public tutorialState: BehaviorSubject<TutorialState> = new BehaviorSubject<TutorialState>(TutorialState.CountDown)
    public tutorialStepID: BehaviorSubject<TutorialStepState> = new BehaviorSubject<TutorialStepState>(
        TutorialStepState.Welcome
    )
    public tutorialSaveBean: TutorialSaveBean

    public maxTutorialStep: number = 9
    public tutorialDataBeans: TutorialDataBean[]
    public currentActionOnClick: Function

    public currentActionOnTweenClose: Function

    private localStorageRepository: LocalStorageRepository
    private tutorialRepository: TutorialRepository
    private userPod: UserPod

    constructor() {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
        this.tutorialRepository = RepositoryProvider.instance.tutorialRepository
        this.userPod = PodProvider.instance.userPod
    }

    public getTutorialData(isSetCompletedTutorial: boolean, isCompletedTutorial: boolean = false) {
        //this.localStorageRepository.clearAllTutorial()

        //TODO GET TUTORIAL COMPLETED FROM SERVER AND SET TO THIS
        this.tutorialSaveBean = this.localStorageRepository.getTutorialSaveData()
        this.updateStep(this.tutorialSaveBean.currentCheckPointID)
        //MOCK COMPLETED TUTORIAL
        if (isSetCompletedTutorial) {
            this.tutorialSaveBean.isCompletedTutorial = isCompletedTutorial
        }
    }

    public saveCheckPointTutorialAndCompleted(checkPointID: number, isCompletedTutorial: boolean) {
        this.tutorialSaveBean.currentCheckPointID = checkPointID
        this.tutorialSaveBean.isCompletedTutorial = isCompletedTutorial

        this.localStorageRepository.saveTutorialData()
        if (this.tutorialSaveBean.isCompletedTutorial && this.userPod.userLoginType == UserType.Login) {
            this.tutorialRepository.saveTutorialData()
        }
    }

    public saveUserIngredientBeansData(userIngredient: UserIngredientBean) {
        this.localStorageRepository.saveUserIngredientBeansData(userIngredient)
        RepositoryProvider.instance.inventoryRepository
            .updateTutorialInventory(userIngredient.id, 1, this.isCompletedTutorial())
            .subscribe()
    }

    public saveUserCPPoint(userCPPoint: number) {
        this.localStorageRepository.saveUserCPPoint(userCPPoint)
    }

    public updateStep(id: number) {
        this.tutorialStepID.next(id)
    }

    public setTutorialState(state: TutorialState) {
        this.tutorialState.next(state)
    }

    public loadTutorialData(isDesktop: boolean): Observable<TutorialDataBean[]> {
        return this.tutorialRepository.getTutorialData(isDesktop).pipe(
            map((dataList) => {
                this.tutorialDataBeans = dataList
                console.log(dataList)
                return dataList
            })
        )
    }

    public getTutorialDataWithID(Id: number): TutorialDataBean {
        return this.tutorialDataBeans.find((x) => x.tutorialID == Id)
    }

    public isCompletedTutorial(
        isCheckTutorialStep: boolean = false,
        tutorialStepState: TutorialStepState = 0
    ): boolean {
        if (isCheckTutorialStep) {
            return (
                (this.tutorialSaveBean.isCompletedTutorial && GameConfig.IS_START_WITH_TUTORIAL) ||
                !GameConfig.IS_START_WITH_TUTORIAL ||
                (!this.tutorialSaveBean.isCompletedTutorial &&
                    this.tutorialStepID.value >= +tutorialStepState &&
                    GameConfig.IS_START_WITH_TUTORIAL)
            )
        } else {
            return (
                (this.tutorialSaveBean.isCompletedTutorial && GameConfig.IS_START_WITH_TUTORIAL) ||
                !GameConfig.IS_START_WITH_TUTORIAL
            )
        }
    }

    public updateCurrentToNextTutorial() {
        this.updateStep(this.tutorialStepID.value + 1)
    }
}
