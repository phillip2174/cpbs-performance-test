import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { BonusBean } from './BonusBean'

export class TagBonusView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

    private tagBackground: GameObjects.NineSlice
    private bonusIcon: GameObjects.Image
    private bonusText: GameObjects.Text

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.tagBackground = this.scene.add.nineslice(0, 0, 'bonus-tag-bg', '', 69, 36, 10, 10, 10, 10)
        this.bonusIcon = this.scene.add
            .image(-this.tagBackground.width / 2 + 22, 0, TagBonusView.INGREDIENT_IMAGE_KEY + '1')
            .setDisplaySize(28, 28)
            .setSize(28, 28)

        this.bonusText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('+?')
            .setOrigin(1, 0.5)
            .setPosition(this.tagBackground.width / 2 - 11, -3)
            .setStyle({ fill: '#EE843C', fontSize: 28 })

        this.add([this.tagBackground, this.bonusIcon, this.bonusText])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setTagBonusCell(bonusBean: BonusBean) {
        this.bonusIcon.setTexture(TagBonusView.INGREDIENT_IMAGE_KEY + bonusBean.id)
        this.bonusText.setText(`+${bonusBean.amount}`)
        this.bonusText.setPosition(this.bonusText.width / 2 + 16, -3)
        this.tagBackground.width = this.bonusText.width + 52
        this.bonusIcon.x = -this.tagBackground.width / 2 + 22

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }
}
