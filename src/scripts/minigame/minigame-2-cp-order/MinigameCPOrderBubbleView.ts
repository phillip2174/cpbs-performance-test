import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Subscription } from 'rxjs'
import { MinigameCPOrderBubbleMenuCellView } from './MinigameCPOrderBubbleMenuCellView'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { PodProvider } from '../../pod/PodProvider'

export class MinigameCPOrderBubbleView extends GameObjects.Container {
    private bubbleBg: GameObjects.Image
    private bubbleMenuCellViews: MinigameCPOrderBubbleMenuCellView[] = []

    private minigamePod: MinigameCPOrderPod

    private clickedCellSubscription: Subscription
    private changeOrderSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.minigamePod.randomCurrentOrderRecipes()
        this.createBubbleMenuCell()
        this.setPosition(x, y)
        this.add(this.bubbleMenuCellViews)
        this.setupSubscribe()
    }

    private createBubbleMenuCell(): void {
        for (let i = 0; i < this.minigamePod.getCurrentOrderRecipes().length; i++) {
            let bubbleMenuCellView = new MinigameCPOrderBubbleMenuCellView(this.scene)
            bubbleMenuCellView.doInit(this.minigamePod.getCurrentOrderRecipes()[i].id, i * 150, 0)
            this.bubbleMenuCellViews.push(bubbleMenuCellView)
        }
    }

    private updateBubbleMenuCell(): void {
        this.minigamePod.randomCurrentOrderRecipes()
        for (let i = 0; i < this.minigamePod.getCurrentOrderRecipes().length; i++) {
            this.bubbleMenuCellViews[i].setRecipe(this.minigamePod.getCurrentOrderRecipes()[i].id)
        }
    }

    private setupSubscribe(): void {
        this.clickedCellSubscription = this.minigamePod.currentClickedCellId.subscribe((id) => {
            if (this.bubbleMenuCellViews.every((cellView) => cellView.isCorrect == true)) {
                this.minigamePod.setIsChangeOrder(true)
            }
        })

        this.changeOrderSubscription = this.minigamePod.isChangeOrder.subscribe((isChange) => {
            if (isChange) {
                this.updateBubbleMenuCell()
            }
        })
    }
}
