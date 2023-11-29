import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'

export class BoldText extends GameObjects.Text {
    constructor(
        scene: Scene,
        x: number,
        y: number,
        text: string | string[],
        fontSize: number = 18,
        color: string = '#FFFFFF',
        macX?: number,
        macY?: number
    ) {
        super(scene, x, y, text, { fontSize: fontSize, color: color })
        if (scene.sys.game.device.os.iOS || scene.sys.game.device.os.macOS) {
            this.setFontFamily('DB_HeaventRounded_Bd')
            if (macX != undefined || macY != undefined) this.setPosition(macX, macY)
        } else {
            this.setFontFamily('DB_HeaventRounded').setFontStyle('bold')
        }
        this.setPadding(0, 15, 0, 15)
        this.setOrigin(0.5)
        GameObjectConstructor(scene, this)
    }
}
