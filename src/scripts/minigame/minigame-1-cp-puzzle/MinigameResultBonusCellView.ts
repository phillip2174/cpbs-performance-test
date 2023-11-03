import { MinigameBonusBean } from './../MinigameBonusBean';

import { MinigameResultUIView } from './MinigameResultUIView';
import { ResourceLoader } from '../../plugins/resource-loader/ResourceLoader';
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager';
import { MinigameCPPuzzleImageGroupView } from './MinigameCPPuzzleImageGroupView';
import { MinigameCPPuzzleImageGroupPod } from './MinigameCPPuzzleImageGroupPod';
import { Observable, Observer, tap } from 'rxjs';
import { TextAdapter } from '../../text-adapter/TextAdapter';


export class MinigameResultBonusCellView extends GameObjects.Container {

    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    private bg: GameObjects.NineSlice
    private itemImage: GameObjects.Image
    private itemCountText: GameObjects.Text
    bean: MinigameBonusBean;

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)

        this.scene.sys.game.device.os.desktop
            ? (this.bg = this.scene.add.nineslice(0, 0, 'white-ingredient-bg', '', 80, 80, 16, 16, 15, 15))
            : (this.bg = this.scene.add.nineslice(0, 0, 'white-ingredient-bg', '', 70, 70, 16, 16, 15, 15))
        
        this.add([this.bg])
    }

    public updateView(minigameBonusBean: MinigameBonusBean): void {
        this.bean = minigameBonusBean;
        if(minigameBonusBean.isCoin)
        {
            this.bg.setTint(0xFFF9EC);
            this.itemImage = this.scene.add.image(
                0,
                0,
                'bonus-coin'
            )
            this.itemImage.setDisplaySize(80, 80)
            this.itemImage.setSize(80, 80)
        }else 
        {
            this.bg.setTint(0xFDF3EC);
            this.itemImage = this.scene.add.image(
                0,
                0,
                MinigameResultBonusCellView.INGREDIENT_IMAGE_KEY + this.bean.id
            )
            this.itemImage.setDisplaySize(70, 70)
            this.itemImage.setSize(70, 70)
        }


        this.itemCountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText("+" + this.bean.amount.toString())
            .setOrigin(0.5)
        this.itemCountText.setStyle({ fill: '#F19D63', fontSize: 28 })
        this.itemCountText.setPosition(0, this.bg.height / 2 + 15)


        this.add([this.itemImage, this.itemCountText])
    }
}