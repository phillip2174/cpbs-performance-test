import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeBean } from '../Collection/RecipeBean'

export class RewardPointCellView extends GameObjects.Container {
    private backgroundReward: GameObjects.NineSlice
    private iconReward: GameObjects.Image
    private textReward: GameObjects.Text
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(scale: number = 1) {
        this.backgroundReward = this.scene.add
            .nineslice(0, 0, 'coin-reward-bg', '', 65, 36, 20, 20, 16, 16)
            .setOrigin(0.5, 0.5)

        this.iconReward = this.scene.add
            .image(-this.backgroundReward.width / 2 - 300, 1, 'cp-point-button-icon')
            .setDisplaySize(34, 34)
            .setSize(34, 34)

        this.textReward = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('+??')
            .setOrigin(1, 0.5)
            .setPosition(20, -4)
            .setStyle({ fill: '#EE843C', fontSize: 28 })

        this.add([this.backgroundReward, this.iconReward, this.textReward])

        this.setDefaultPointCell(scale)

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setDefaultPointCell(scale: number = 1) {
        this.setScale(1)
        this.textReward.setText(`+??`)

        this.backgroundReward.width = this.textReward.width + this.iconReward.width + 13
        this.textReward.setPosition((this.textReward.width + 28) / 2, -4)
        this.iconReward.x = -this.backgroundReward.getBounds().width / 2 + 20

        this.setScale(scale)

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setPointRewardCell(recipeBean: RecipeBean, scale: number = 1) {
        this.setScale(1)
        this.textReward.setText(`+${recipeBean.rewardPoint}`)

        this.backgroundReward.width = this.textReward.width + this.iconReward.width + 13
        this.textReward.setPosition((this.textReward.width + 28) / 2, -4)
        this.iconReward.x = -this.backgroundReward.getBounds().width / 2 + 20

        this.setScale(scale)

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }
}
