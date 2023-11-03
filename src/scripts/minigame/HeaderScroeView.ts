import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'

export class HeaderScoreView extends GameObjects.Container {
    private headerText: GameObjects.Text
    private lineImage: GameObjects.Image
    constructor(scene: Scene, x: number, y: number, text: string) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)

        this.headerText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(text)
            .setOrigin(0.5)
            .setPosition(0, 0)
            .setStyle({ fill: '#EE843C', fontSize: 24 })

        this.lineImage = this.scene.add.image(this.headerText.width / 2 + 5, 2, 'line-completed').setScale(1, 1.2)

        this.add([this.headerText, this.lineImage])
    }
}
