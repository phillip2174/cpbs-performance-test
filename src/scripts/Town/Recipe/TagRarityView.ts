import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeType } from '../Collection/type/RecipeType'
import { BoldText } from '../../../BoldText/BoldText'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class TagRarityView extends GameObjects.Container {
    private tagContainer: GameObjects.Container
    private textPosition: GameObjects.Rectangle
    private typeTagBackground: GameObjects.NineSlice
    private typeTagSecretImage: GameObjects.Image
    private typeText: GameObjects.Text
    private sizeIndex: number
    private isSecret: boolean = false
    private isDesktop: boolean = false
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public createTag(sizeIndex: number) {
        this.sizeIndex = sizeIndex
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.tagContainer = this.scene.add.container()
        this.textPosition = this.scene.add.rectangle(0, 0, 1, 7, 0xff00ff, 0).setOrigin(0.5)

        if (DeviceChecker.instance.isAppleOS()) {
            this.typeText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                .setText(`???`)
                .setOrigin(0.5)
                .setPosition(0, 0)
        } else {
            this.typeText = new BoldText(this.scene, 0, 0, `???`)
        }

        switch (sizeIndex) {
            case 0:
                this.typeTagBackground = this.scene.add
                    .nineslice(0, 0, 'small-tag', '', 55, 19, 10, 11, 8, 9)
                    .setAlpha(0.2)
                this.typeTagBackground.setDisplaySize(55, 19)
                this.typeText.setStyle({ fill: '#FFFFFF', fontSize: 13 })
                break
            case 1:
                this.typeTagBackground = this.scene.add
                    .nineslice(0, 0, 'medium-tag', '', 55, 29, 13, 13, 12, 12)
                    .setAlpha(0.2)
                this.typeTagBackground.setDisplaySize(55, 29)
                this.typeText.setStyle({ fill: '#FFFFFF', fontSize: 17 })
                break
        }

        this.tagContainer.add([this.typeTagBackground, this.textPosition, this.typeText])

        this.add([this.tagContainer])
    }

    public createTagSmall() {
        this.createTag(0)
    }

    public createTagLarge() {
        this.createTag(1)
    }

    public setColorTagAndTextWithType(recipeType: RecipeType, typeString: string) {
        switch (recipeType) {
            case RecipeType.Easy:
                this.setColorTagAndText(0x29cc6a, typeString)
                break
            case RecipeType.Normal:
                this.setColorTagAndText(0xe8ae37, typeString)
                break
            case RecipeType.Hard:
                this.setColorTagAndText(0xee843c, typeString)
                break
            case RecipeType.Challenge:
                this.setColorTagAndText(0x7b61ff, typeString)
                break
        }
    }

    public setSecretTag(scale: number = 1) {
        this.isSecret = true
        this.setScale(1)
        this.typeTagBackground.setVisible(false)
        this.typeTagBackground.width = 0
        if (this.typeTagSecretImage == undefined) {
            this.typeTagSecretImage = this.scene.add.image(0, 0, 'secret-tag')
            this.tagContainer.add([this.typeTagSecretImage])
        } else {
            this.typeTagSecretImage.displayWidth = 67
            this.typeTagSecretImage?.setVisible(true)
        }

        this.typeText.setTint(0x0099ff)
        this.typeText.setText('SECRET')
        this.typeText.setFontSize(scale == 1 ? 16 : Math.floor(16 / scale / 1.3))

        Phaser.Display.Align.In.Center(
            this.textPosition,
            this.typeTagSecretImage,
            0,
            DeviceChecker.instance.isAppleOS() ? -1 : 0
        )
        Phaser.Display.Align.In.Center(this.typeText, this.textPosition, 0, -2)
        this.setScale(scale)
    }

    private setColorTagAndText(colorTypeAndText: number, typeString: string) {
        this.isSecret = false
        this.setScale(1)
        if (this.typeTagSecretImage != undefined) {
            this.typeTagSecretImage.displayWidth = 0
        }
        this.typeTagSecretImage?.setVisible(false)
        this.typeTagBackground.setVisible(true)

        this.typeTagBackground.setTint(colorTypeAndText)
        this.typeText.setTint(colorTypeAndText)
        this.typeText.setText(typeString)

        switch (this.sizeIndex) {
            case 0:
                this.typeText.setFontSize(13)
                this.typeTagBackground.setSize(this.typeText.width + 18, this.typeTagBackground.height)
                this.textPosition.setSize(this.typeTagBackground.width, this.textPosition.height)
                Phaser.Display.Align.In.Center(this.typeText, this.textPosition, 1, this.isSecret ? -1 : -1.5)
                break
            case 1:
                this.typeText.setFontSize(17)
                this.typeTagBackground.setSize(this.typeText.width + 24, this.typeTagBackground.height)
                this.textPosition.setSize(this.typeTagBackground.width, this.textPosition.height)
                Phaser.Display.Align.In.Center(this.typeText, this.textPosition, 1, this.isDesktop ? -3.5 : -2.5)
                break
        }
    }

    public getWidthBG(): number {
        return this.isSecret ? this.typeTagSecretImage.displayWidth : this.typeTagBackground.width
    }
}
