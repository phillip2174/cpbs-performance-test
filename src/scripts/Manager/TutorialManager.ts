import { BehaviorSubject, Observable, map } from 'rxjs'
import { TutorialSaveBean } from '../../Tutorial/TutorialSaveBean'
import { LocalStorageRepository } from '../Repository/LocalStorageRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { TutorialState } from '../../Tutorial/TutorialState'
import { TutorialDataBean } from '../../Tutorial/TutorialDataBean'
import { TutorialRepository } from '../Repository/TutorialRepository'
import { GameConfig } from '../GameConfig'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'
import { UserIngredientBean } from '../Ingredient/UserIngredientBean'

export class TutorialManager {
    public tutorialState: BehaviorSubject<TutorialState> = new BehaviorSubject<TutorialState>(TutorialState.CountDown)
    public tutorialStepID: BehaviorSubject<TutorialStepState> = new BehaviorSubject<TutorialStepState>(
        TutorialStepState.Welcome
    )
    public tutorialSaveBean: TutorialSaveBean

    public maxTutorialStep: number = 10 //mock
    public tutorialDataBeans: TutorialDataBean[]

    private localStorageRepository: LocalStorageRepository
    private tutorialRepository: TutorialRepository

    constructor() {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
        this.tutorialRepository = RepositoryProvider.instance.tutorialRepository
    }

    public getTutorialData() {
        //this.localStorageRepository.clearAllTutorial()
        this.tutorialSaveBean = this.localStorageRepository.getTutorialSaveData()
        this.updateStep(this.tutorialSaveBean.currentCheckPointID)
        //MOCK COMPLETED TUTORIAL
        // this.tutorialSaveBean.isCompletedTutorial = true
    }

    public saveCheckPointTutorialAndCompleted(checkPointID: number, isCompletedTutorial: boolean) {
        this.tutorialSaveBean.currentCheckPointID = checkPointID
        this.tutorialSaveBean.isCompletedTutorial = isCompletedTutorial

        this.localStorageRepository.saveTutorialData()
    }

    public saveUserIngredientBeansData(userIngredient: UserIngredientBean) {
        this.localStorageRepository.saveUserIngredientBeansData(userIngredient)
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
