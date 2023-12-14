import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { DailyLoginBean } from './DailyLoginBean'
import { RewardBean } from './RewardBean'
import { RewardType } from './RewardType'
import { BoldText } from '../../../BoldText/BoldText'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class DailyLoginRewardPreviewView extends GameObjects.Container {
    private previewBg: GameObjects.Image
    private bgEffect: GameObjects.Image
    private rewardIcon: GameObjects.Image

    private amountText: GameObjects.Text

    private previewUIContainer: GameObjects.Container

    private isDesktop: boolean

    private dailyLoginBean: DailyLoginBean
    private rewardBean: RewardBean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(dailyLoginBean: DailyLoginBean, rewardBean: RewardBean) {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.dailyLoginBean = dailyLoginBean
        this.rewardBean = rewardBean
        this.setupPreviewUIContainer()

        this.amountText = new BoldText(
            this.scene,
            0,
            36,
            '+' + this.rewardBean.amount,
            this.isDesktop ? 22 : 16,
            '',
            0,
            32
        )

        if (this.dailyLoginBean.isBigReward) {
            this.previewBg.setTint(0xffd47c)
            this.amountText.setColor('#D97837')
        } else {
            this.previewBg.setTint(0xfdf3ec)
            this.amountText.setColor('#F19D63')
        }

        this.add([this.previewUIContainer, this.amountText])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public updatePreviewOnCollected(): void {
        this.previewBg.clearTint()
        this.rewardIcon.clearTint()
        this.previewBg.setTint(0xe7edf5)
        this.rewardIcon.setPipeline('Grayscale')
        this.amountText.setColor('#C5CBD3')
    }

    public setIconGrayscale(isActive: boolean) {
        isActive ? this.rewardIcon.setPipeline('Grayscale') : this.rewardIcon.resetPipeline()
    }

    private setupPreviewUIContainer(): void {
        this.previewUIContainer = this.scene.add.container()
        this.previewBg = this.scene.add
            .image(0, -3, 'white-ingredient-bg')
            .setDisplaySize(48, 48)
            .setSize(48, 48)
            .setOrigin(0.5)
        this.setRewardIconKey()
        this.previewUIContainer.add([this.previewBg, this.rewardIcon])
    }

    private setRewardIconKey(): void {
        switch (this.rewardBean.type) {
            case RewardType.Ingredient:
                this.rewardIcon = this.scene.add
                    .image(1, -3, 'ingredient_' + this.rewardBean.ingredientId)
                    .setOrigin(0.5)
                    .setDisplaySize(40, 40)
                    .setSize(40, 40)
                break
            case RewardType.Point:
                this.rewardIcon = this.scene.add
                    .image(1.5, 0, 'bonus-coin')
                    .setOrigin(0.5)
                    .setDisplaySize(48, 48)
                    .setSize(48, 48)
                break
        }
    }
}
