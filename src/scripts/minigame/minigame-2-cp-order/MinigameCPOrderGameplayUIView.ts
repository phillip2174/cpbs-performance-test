import { GameObjects, Scene } from 'phaser'
import { timer } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameCPOrderBubbleView } from './MinigameCPOrderBubbleView'
import { MinigameCpOrderMenuCellGroupView } from './MinigameCPOrderMenuCellGroupView'

export class MinigameCPOrderGameplayUIView extends GameObjects.Container {
    private scenePod: MinigameScenePod
    private bubbleView: MinigameCPOrderBubbleView
    private menuCellGroupView: MinigameCpOrderMenuCellGroupView

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.scenePod = PodProvider.instance.minigameScenePod
        this.bubbleView = new MinigameCPOrderBubbleView(this.scene)
        this.menuCellGroupView = new MinigameCpOrderMenuCellGroupView(this.scene)

        this.menuCellGroupView.doInit()

        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.add([this.bubbleView, this.menuCellGroupView])
        timer(1000).subscribe((_) => {
            this.bubbleView.doInit(-75, -125)
            this.menuCellGroupView.updateCells()
        })
    }
}
