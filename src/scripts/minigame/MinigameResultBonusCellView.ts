import { MinigameBonusBean } from './MinigameBonusBean'

import { MinigameResultUIView } from './MinigameResultUIView'
import { ResourceLoader } from '../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameCPPuzzleImageGroupPod } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupPod'
import { Observable, Observer, tap } from 'rxjs'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { BoldText } from '../../BoldText/BoldText'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class MinigameResultBonusCellView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    private bg: GameObjects.NineSlice
    private itemImage: GameObjects.Image
    private itemCountText: GameObjects.Text
    bean: MinigameBonusBean
    isDesktop: boolean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.isDesktop
            ? (this.bg = this.scene.add.nineslice(0, 0, 'white-ingredient-bg', '', 80, 80, 16, 16, 15, 15))
            : (this.bg = this.scene.add.nineslice(0, 0, 'white-ingredient-bg', '', 80, 80, 16, 16, 15, 15))

        this.add([this.bg])
    }

    public updateView(minigameBonusBean: MinigameBonusBean): void {
        this.bean = minigameBonusBean
        if (minigameBonusBean.isCoin) {
            var size = this.isDesktop ? 80 : 80
            this.bg.setTint(0xfff9ec)
            this.itemImage = this.scene.add.image(0, 0, 'bonus-coin')
            this.itemImage.setDisplaySize(size, size)
            this.itemImage.setSize(size, size)
        } else {
            var size = this.isDesktop ? 70 : 70
            this.bg.setTint(0xfdf3ec)
            this.itemImage = this.scene.add.image(0, 0, MinigameResultBonusCellView.INGREDIENT_IMAGE_KEY + this.bean.id)
            this.itemImage.setDisplaySize(size, size)
            this.itemImage.setSize(size, size)
        }

        this.itemCountText = new BoldText(
            this.scene,
            0,
            this.isDesktop ? this.bg.height / 2 + 15 : this.bg.height / 2 + 15,
            '+' + this.bean.amount.toString(),
            28,
            '#F19D63'
        )

        this.add([this.itemImage, this.itemCountText])
    }
}
