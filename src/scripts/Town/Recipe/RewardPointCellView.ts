import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { BoldText } from '../../../BoldText/BoldText'

export class RewardPointCellView extends GameObjects.Container {
    public static readonly IS_DEBUG_TEXT: boolean = false

    private sizeIndex: number

    private backgroundReward: GameObjects.NineSlice
    private textPosition: GameObjects.Rectangle
    private iconReward: GameObjects.Image
    private textReward: GameObjects.Text

    private iconSize: number
    private offsetHeightext: number

    private isDesktop: boolean = false

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    private createTag(sizeIndex: number, iconSize: number, fontSize: number) {
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.sizeIndex = sizeIndex
        this.iconSize = iconSize

        switch (sizeIndex) {
            case 0:
                this.backgroundReward = this.scene.add
                    .nineslice(0, 0, 'small-tag', '', 45, 18, 10, 11, 8, 9)
                    .setTint(0xffe2a5)
                break
            case 1:
                this.backgroundReward = this.scene.add
                    .nineslice(0, 0, 'medium-tag', '', 65, 28, 13, 13, 12, 12)
                    .setTint(0xffe2a5)

                break
            case 2:
                this.backgroundReward = this.scene.add
                    .nineslice(0, 0, 'large-tag', '', 80, 36, 20, 20, 18, 17)
                    .setTint(0xffe2a5)
                break
        }

        this.textPosition = this.scene.add
            .rectangle(0, 0, 20, 8, 0xff00ff, RewardPointCellView.IS_DEBUG_TEXT ? 0.2 : 0)
            .setOrigin(0.5, 0.5)

        this.iconReward = this.scene.add
            .image(-this.backgroundReward.width / 2, 0, 'coin-tag')
            .setDisplaySize(iconSize, iconSize)

        this.textReward = new BoldText(this.scene, 20, 0, '+??', fontSize, '#EE843C').setOrigin(1, 0.5)

        this.add([this.backgroundReward, this.textPosition, this.iconReward, this.textReward])
    }

    public createSmallTag() {
        this.createTag(0, 14, 16)
        this.handleSizeAndTextWithIndex()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public createMediumTag() {
        this.createTag(1, 22, 22)
        this.handleSizeAndTextWithIndex()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public createLargeTag() {
        this.createTag(2, 28, 28)
        this.handleSizeAndTextWithIndex()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private handleSizeAndTextWithIndex() {
        let isNotWindow = this.scene.sys.game.device.os.macOS || this.scene.sys.game.device.os.iOS
        switch (this.sizeIndex) {
            case 0:
                this.handleSize(11, 8, -3.5, isNotWindow ? -2.5 : -2)
                break
            case 1:
                this.handleSize(16, 11, -4.5, isNotWindow ? -3 : -1)
                break
            case 2:
                this.handleSize(17, 14, -6.5, -3)
                break
        }
    }

    private handleSize(
        offsetWidth: number,
        textPositionHeight: number,
        offsetWidthText: number,
        offsetHeightext: number
    ) {
        this.offsetHeightext = offsetHeightext
        this.textPosition.setSize(this.textReward.width, textPositionHeight)
        this.backgroundReward.setSize(this.textReward.width + this.iconSize + offsetWidth, this.backgroundReward.height)

        this.iconReward.setPosition(-this.backgroundReward.width / 2 + this.iconSize / 2 + 6, this.iconReward.y)

        this.textPosition.setPosition(
            this.backgroundReward.width / 2 - this.textPosition.width / 2 + offsetWidthText,
            this.textPosition.y
        )

        Phaser.Display.Align.In.RightCenter(this.textReward, this.textPosition, 0, offsetHeightext)

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setPointCell(point: string, offsetIconY: number = 0, textYOffset: number = 0) {
        this.textReward.setText(`+${point}`)
        this.handleSizeAndTextWithIndex()

        this.iconReward.y = this.textPosition.y + offsetIconY
        Phaser.Display.Align.In.RightCenter(this.textReward, this.textPosition, 0, this.offsetHeightext + textYOffset)

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public getWidthBG(): number {
        return this.backgroundReward.width
    }
}
