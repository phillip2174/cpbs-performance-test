import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { Subscription } from 'rxjs'
import { PodProvider } from '../../pod/PodProvider'

export class MinigameCPOrderBubbleMenuCellView extends GameObjects.Container {
    public static readonly ICON_KEY: string = 'recipe-'

    public isCorrect: boolean = false

    private recipeImage: GameObjects.Image
    private checkMarkImage: GameObjects.Image

    private recipeId: number

    private minigamePod: MinigameCPOrderPod

    private clickedCellSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(recipeId: number, x: number, y: number): void {
        this.recipeId = recipeId
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.recipeImage = this.scene.add
            .image(0, 0, MinigameCPOrderBubbleMenuCellView.ICON_KEY + recipeId)
            .setOrigin(0.5)
        this.setPosition(x, y)
        this.add([this.recipeImage])
        this.setupSubscribe()
    }

    public setRecipe(recipeId: number): void {
        this.recipeId = recipeId
        this.isCorrect = false
        this.recipeImage.setTexture(MinigameCPOrderBubbleMenuCellView.ICON_KEY + this.recipeId)
    }

    private setupSubscribe(): void {
        this.clickedCellSubscription = this.minigamePod.currentClickedCellId.subscribe((id) => {
            if (this.minigamePod.checkIsCorrectOrder(id)) {
                if (this.minigamePod.getCurrentRecipes()[id].id == this.recipeId) {
                    this.isCorrect = true
                }
            } else {
                this.minigamePod.setIsChangeOrder(true)
            }
        })
    }
}
