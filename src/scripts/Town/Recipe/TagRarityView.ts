import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { RecipeType } from '../Collection/type/RecipeType'

export class TagRarityView extends GameObjects.Container {
    private tagContainer: GameObjects.Container
    private typeTagBackground: GameObjects.NineSlice
    private typeTagSecretImage: GameObjects.Image
    private typeText: GameObjects.Text
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.tagContainer = this.scene.add.container()

        this.typeTagBackground = this.scene.add.nineslice(0, 0, 'tag-bg', '', 56, 28, 13, 13, 12, 12).setAlpha(0.2)
        this.typeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(`???`)
            .setOrigin(0.5)
            .setPosition(0, -4)
            .setStyle({ fill: '#FFFFFF', fontSize: 16 })

        this.tagContainer.add([this.typeTagBackground, this.typeText])

        this.add([this.tagContainer])
    }

    public setColorTagAndTextWithType(recipeType: RecipeType, typeString: string, scale: number = 1) {
        switch (recipeType) {
            case RecipeType.Easy:
                this.setColorTagAndText(0x29cc6a, typeString, scale)
                break
            case RecipeType.Normal:
                this.setColorTagAndText(0xe8ae37, typeString, scale)
                break
            case RecipeType.Hard:
                this.setColorTagAndText(0xee843c, typeString, scale)
                break
            case RecipeType.Challenge:
                this.setColorTagAndText(0x7b61ff, typeString, scale)
                break
        }
    }

    public setSecretTag(scale: number = 1) {
        this.setScale(1)
        this.typeTagBackground.setVisible(false)
        this.typeTagSecretImage = this.scene.add.image(0, 0, 'secret-tag')
        this.tagContainer.add([this.typeTagSecretImage])

        this.typeText.setTint(0x0099ff)
        this.typeText.setText('SECRET')
        this.typeText.setFontSize(scale == 1 ? 16 : 16 / scale / 1.3)

        this.setScale(scale)
    }

    private setColorTagAndText(colorTypeAndText: number, typeString: string, scale: number = 1) {
        this.setScale(1)
        this.typeTagSecretImage?.setVisible(false)
        this.typeTagBackground.setVisible(true)

        this.typeTagBackground.setTint(colorTypeAndText)
        this.typeText.setTint(colorTypeAndText)
        this.typeText.setText(typeString)
        this.typeText.setFontSize(scale == 1 ? 16 : 16 / scale / 1.2)
        this.typeTagBackground.width = this.typeText.getBounds().width + 24

        this.setScale(scale)
    }
}
