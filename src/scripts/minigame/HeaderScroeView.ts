import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { BoldText } from '../../BoldText/BoldText'

export class HeaderScoreView extends GameObjects.Container {
    private headerText: GameObjects.Text
    private lineImage: GameObjects.Image
    constructor(scene: Scene, x: number, y: number, text: string) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)

        this.headerText = new BoldText(this.scene, 0, 0, text, 24, '#EE843C')

        this.lineImage = this.scene.add.image(this.headerText.width / 2 + 5, 2, 'line-completed').setScale(1, 1.2)

        this.add([this.headerText, this.lineImage])
    }
}
