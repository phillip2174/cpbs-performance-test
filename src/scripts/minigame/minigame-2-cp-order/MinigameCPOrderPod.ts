import { Observable, Subject, map, of } from 'rxjs'
import { RecipeBean } from '../../Town/Collection/RecipeBean'
import { RecipeFilterType } from '../../Town/Recipe/RecipeFilterType'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager'
import { PodProvider } from '../../pod/PodProvider'
import { RecipePod } from '../../pod/RecipePod'

export class MinigameCPOrderPod {
    public currentClickedCellId: Subject<number> = new Subject<number>()
    public isChangeOrder: Subject<boolean> = new Subject<boolean>()

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

    public setCurrentClickedCellId(cellId: number): void {
        this.currentClickedCellId.next(cellId)
    }

    public setIsChangeOrder(isChange: boolean): void {
        this.isChangeOrder.next(isChange)
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

    public randomCurrentOrderRecipes(): void {
        this.currentOrderRecipes = []
        let randomOrderAmount = Phaser.Math.Between(2, 2)
        let currentRecipeBeansForRandom: RecipeBean[] = []
        currentRecipeBeansForRandom = this.currentRecipeBeans.map((recipe) => recipe)

        for (let i = 0; i < randomOrderAmount; i++) {
            let randomOrderRecipeIndex = Phaser.Math.Between(0, currentRecipeBeansForRandom.length - 1)
            this.currentOrderRecipes.push(currentRecipeBeansForRandom[randomOrderRecipeIndex])
            currentRecipeBeansForRandom.splice(
                currentRecipeBeansForRandom.indexOf(currentRecipeBeansForRandom[randomOrderRecipeIndex], 0),
                1
            )
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
}
