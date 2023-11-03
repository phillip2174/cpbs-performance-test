import { Actions, Display, GameObjects, Math, Scene } from 'phaser'
import { Subscription, concatMap, map, tap } from 'rxjs'
import { RecipeBean } from '../../Town/Collection/RecipeBean'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameCPOrderMenuCellView } from './MinigameCPOrderMenuCellView'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'

export class MinigameCpOrderMenuCellGroupView extends GameObjects.Container {
    private cellViews: MinigameCPOrderMenuCellView[] = []
    private cellPatterns: Array<string[]> = []
    private recipeBeans: RecipeBean[] = []

    private maxCellCount: number = 12
    private rowCount: number = 3
    private columnCount: number = 4
    private cellSize: number
    private randomRecipeIndex: number

    private isDesktop: boolean

    private minigamePod: MinigameCPOrderPod

    private clickCellSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.isDesktop = this.scene.sys.game.device.os.desktop
        this.isDesktop ? (this.cellSize = 98) : (this.cellSize = 75)
        this.showStartPreview()
        this.add(this.cellViews)
        this.setupSubscribe()
    }

    public updateCells(): void {
        let randomPatternIndex = Math.Between(0, this.cellPatterns.length - 1)
        for (let i = 0; i < this.cellPatterns[randomPatternIndex].length; i++) {
            this.cellViews[i].setCellBg(this.cellPatterns[randomPatternIndex][i])
        }

        this.cellViews.forEach((cell, index) => {
            this.randomRecipeIndexAndSetCellIcon(index)
        })
    }

    private showStartPreview(): void {
        for (let i = 0; i < this.maxCellCount; i++) {
            let cellView = new MinigameCPOrderMenuCellView(this.scene)
            cellView.doInit(i)
            this.cellViews.push(cellView)
        }

        this.cellViews = Actions.GridAlign(this.cellViews, {
            position: Display.Align.LEFT_TOP,
            width: this.columnCount,
            height: this.rowCount,
            cellWidth: this.cellSize,
            cellHeight: this.cellSize,
            x: this.isDesktop ? -150 : -115,
            y: 0,
        })
    }

    private setupSubscribe(): void {
        this.minigamePod
            .getCellPatterns()
            .pipe(
                tap((cellPatterns) => (this.cellPatterns = cellPatterns)),
                concatMap((_) => this.minigamePod.getRecipeBeans()),
                map((recipeBeans) => (this.recipeBeans = recipeBeans))
            )
            .subscribe((_) => {
                this.cellViews.forEach(() => {
                    this.randomRecipeIndex = Math.Between(0, this.recipeBeans.length - 1)
                    this.minigamePod.addCurrentRecipe(this.recipeBeans[this.randomRecipeIndex])
                    this.removeRecipe(this.recipeBeans[this.randomRecipeIndex])
                })
            })

        this.clickCellSubscription = this.minigamePod.currentClickedCellId.subscribe((id) => {
            if (this.recipeBeans.length > 0) {
                this.cellViews[id].playOnClickTween(() => {
                    this.randomRecipeIndex = Math.Between(0, this.recipeBeans.length - 1)
                    this.minigamePod.updateCurrentRecipeAtIndex(id, this.recipeBeans[this.randomRecipeIndex])
                    this.removeRecipe(this.recipeBeans[this.randomRecipeIndex])
                    this.randomRecipeIndexAndSetCellIcon(id)
                }, this.minigamePod.checkIsCorrectOrder(id))
            }
        })
    }

    private removeRecipe(recipe: RecipeBean): void {
        let recipeIndex: number = this.recipeBeans.indexOf(recipe, 0)
        this.recipeBeans.splice(recipeIndex, 1)
    }

    private randomRecipeIndexAndSetCellIcon(index: number): void {
        this.cellViews[index].setCellIcon(this.minigamePod.getCurrentRecipes()[index].id.toString())
    }
}
