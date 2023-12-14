import { BehaviorSubject, Observable, Subject, map, of } from 'rxjs'
import { RecipeBean } from '../../Town/Collection/RecipeBean'
import { RecipeFilterType } from '../../Town/Recipe/RecipeFilterType'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager'
import { PodProvider } from '../../pod/PodProvider'
import { RecipePod } from '../../pod/RecipePod'
import { BubbleMenuMarkState } from './BubbleMenuMarkState'
import { RandomNumber } from '../../plugins/Random'

export class MinigameCPOrderPod {
    public currentOrderMarkStates: BehaviorSubject<BubbleMenuMarkState[]> = new BehaviorSubject<BubbleMenuMarkState[]>(
        []
    )
    public currentOrderCount: BehaviorSubject<number> = new BehaviorSubject<number>(0)
    public isTimerZero: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public currentClickedCellId: Subject<number> = new Subject<number>()
    public isChangeOrder: Subject<boolean> = new Subject<boolean>()
    public isDecreaseLifeCount: Subject<boolean> = new Subject<boolean>()
    public isTimeRunningOut: Subject<boolean> = new Subject<boolean>()

    public previousClickedCellId: number = -1
    public servedOrderCount: number = 0

    public isClickable: boolean = true

    private cellPatterns: Array<string[]>

    private currentRecipeBeans: RecipeBean[] = []
    private currentOrderRecipes: RecipeBean[] = []
    private recipeMasterBeans: RecipeBean[]

    private recipePod: RecipePod

    constructor() {
        this.recipePod = PodProvider.instance.recipePod
    }

    public getCellPatterns(): Observable<Array<string[]>> {
        if (this.cellPatterns == undefined || this.cellPatterns == null) {
            return this.getPatternDataFromJson().pipe(
                map((patterns) => {
                    this.cellPatterns = patterns
                    console.log(this.cellPatterns)
                    return patterns
                })
            )
        } else {
            return of(this.cellPatterns)
        }
    }

    public getRecipeBeans(): Observable<RecipeBean[]> {
        if (this.recipeMasterBeans == undefined || this.recipeMasterBeans == null) {
            return this.recipePod.getRecipeData(RecipeFilterType.All).pipe(
                map((recipes) => {
                    this.recipeMasterBeans = recipes
                    return this.recipeMasterBeans
                })
            )
        } else {
            return of(this.recipeMasterBeans)
        }
    }

    public getCurrentRecipes(): RecipeBean[] {
        return this.currentRecipeBeans
    }

    public getCurrentOrderRecipes(): RecipeBean[] {
        return this.currentOrderRecipes
    }

    public getIsTimerZero(): boolean {
        return this.isTimerZero.getValue()
    }

    public setCurrentClickedCellId(cellId: number): void {
        this.currentClickedCellId.next(cellId)
    }

    public setPreviousClickedCellId(cellId: number): void {
        this.previousClickedCellId = cellId
    }

    public setIsChangeOrder(isChange: boolean): void {
        this.isChangeOrder.next(isChange)
    }

    public setIsTimerZero(isZero: boolean): void {
        this.isTimerZero.next(isZero)
    }

    public setIsDecreaseLifeCount(isDecrease: boolean): void {
        this.isDecreaseLifeCount.next(isDecrease)
    }

    public setIsClickable(isClickable: boolean): void {
        this.isClickable = isClickable
    }

    public setIsTimeRunningOut(isRunningOut: boolean): void {
        this.isTimeRunningOut.next(isRunningOut)
    }

    public updateCurrentOrderCount(): void {
        let previousOrderCount = this.currentOrderCount.value
        previousOrderCount += 1
        this.currentOrderCount.next(previousOrderCount)
    }

    public updateServedOrderCount(): void {
        this.servedOrderCount += 1
    }

    public addCurrentRecipe(recipe: RecipeBean): void {
        this.currentRecipeBeans.push(recipe)
    }

    public updateCurrentRecipeAtIndex(index: number, recipe: RecipeBean): void {
        this.currentRecipeBeans[index] = recipe
    }

    public clearCurrentRecipes(): void {
        this.currentRecipeBeans = []
    }

    public clearCurrentOrderMarkStates(): void {
        this.currentOrderMarkStates.next([])
    }

    public randomCurrentOrderRecipes(): void {
        this.currentOrderRecipes = []
        let randomOrderAmount = Phaser.Math.Between(1, 2)
        let markStates: BubbleMenuMarkState[] = this.currentOrderMarkStates.value
        markStates = []

        // let currentRecipeBeansForRandom: RecipeBean[] = []
        // currentRecipeBeansForRandom = this.currentRecipeBeans.map((recipe) => recipe)

        for (let i = 0; i < randomOrderAmount; i++) {
            let randomOrderRecipeIndex = RandomNumber(0, this.currentRecipeBeans.length - 1)
            while (this.currentOrderRecipes.includes(this.currentRecipeBeans[randomOrderRecipeIndex])) {
                randomOrderRecipeIndex = RandomNumber(0, this.currentRecipeBeans.length - 1)
            }
            this.currentOrderRecipes.push(this.currentRecipeBeans[randomOrderRecipeIndex])
            markStates.push(BubbleMenuMarkState.Normal)

            // currentRecipeBeansForRandom.splice(
            //     currentRecipeBeansForRandom.indexOf(currentRecipeBeansForRandom[randomOrderRecipeIndex], 0),
            //     1
            // )
        }

        this.currentOrderMarkStates.next(markStates)
    }

    public updateCorrectOrder(cellId: number): void {
        if (this.checkIsCorrectOrder(cellId)) {
            if (this.previousClickedCellId == cellId) {
                this.setRemainingOrderFailMark()
            } else {
                let bubbleMarkIndex: number = this.currentOrderRecipes.indexOf(this.currentRecipeBeans[cellId])
                this.currentOrderMarkStates.value[bubbleMarkIndex] = BubbleMenuMarkState.Success
                this.setPreviousClickedCellId(cellId)
                this.currentOrderMarkStates.next(this.currentOrderMarkStates.value)
            }
        } else {
            this.setOrderFailMark()
        }
    }

    public setOrderFailMark(): void {
        if (this.currentOrderMarkStates.value.every((mark) => mark == BubbleMenuMarkState.Normal)) {
            this.currentOrderMarkStates.value.fill(BubbleMenuMarkState.Fail)
            this.currentOrderMarkStates.next(this.currentOrderMarkStates.value)
        } else {
            this.setRemainingOrderFailMark()
        }
    }

    public checkIsCorrectOrder(cellId: number): boolean {
        return this.currentOrderRecipes.includes(this.currentRecipeBeans[cellId])
    }

    private getPatternDataFromJson(): Observable<Array<string[]>> {
        return ResourceManager.instance
            .loadText('minigame2-cell-pattern', 'assets/minigame/minigame2/minigame2-cell-pattern.json')
            .pipe(map((json) => JSON.parse(json)))
    }

    private setRemainingOrderFailMark(): void {
        let remainingOrderIndex = this.currentOrderMarkStates.value.indexOf(BubbleMenuMarkState.Normal)
        if (remainingOrderIndex != -1) {
            this.currentOrderMarkStates.value[remainingOrderIndex] = BubbleMenuMarkState.Fail
            this.currentOrderMarkStates.next(this.currentOrderMarkStates.value)
        }
    }
}
