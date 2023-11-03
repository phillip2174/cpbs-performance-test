import { MinigameBonusBean } from './../MinigameBonusBean';
import { MinigameResultBean } from "../MinigameResultBean";
import { MinigameResultUIView } from './MinigameResultUIView';
import { ResourceLoader } from '../../plugins/resource-loader/ResourceLoader';
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager';
import { MinigameCPPuzzleImageGroupView } from './MinigameCPPuzzleImageGroupView';
import { MinigameCPPuzzleImageGroupPod } from './MinigameCPPuzzleImageGroupPod';
import { Observable, Observer, tap } from 'rxjs';
import { TextAdapter } from '../../text-adapter/TextAdapter';
import { MinigameResultBonusCellView } from './MinigameResultBonusCellView';


export class MinigameResultBonusView extends GameObjects.Container {

    private bg: GameObjects.NineSlice
    private icon: GameObjects.Image
    private text: GameObjects.Text
    private bean: MinigameResultBean;
    private cellList: MinigameResultBonusCellView[] = []
    bonusContainer: GameObjects.Container;
    rectMockPosition: GameObjects.Rectangle;
    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y);
        this.bg = this.scene.add
            .nineslice(
                0,
                0,
                'minigame-result-reward-bg',
                '',
                100,
                100,
                15,
                15,
                15,
                15
            )
        this.text = TextAdapter.instance.getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('REWARDS')
            .setOrigin(0.5)
            .setPosition(0, -60)
            .setStyle({
                fill: '#2B2B2B',
                fontSize: 24,
            })
        this.add([this.bg, this.text]);

        this.bonusContainer = this.scene.add.container(0, 0)
        this.rectMockPosition = this.scene.add.rectangle(0, 0, 160, 40, 0xff00ff, 0)
        this.add([this.bonusContainer, this.rectMockPosition])

        this.width = this.getBounds().width
        this.height = this.getBounds().height



      
    }

    public updateView(bean: MinigameResultBean) {

        this.bonusContainer.removeAll(true);
        this.cellList = [];
        this.bean = bean;

        bean.list.forEach(minigameBonusBean => {
            var bonus = new MinigameResultBonusCellView(this.scene);
            bonus.doInit(0, 0);
            bonus.updateView(minigameBonusBean);
            bonus.width = bonus.getBounds().width
            bonus.height = bonus.getBounds().height
            this.cellList.push(bonus);
            this.bonusContainer.add(bonus);
        });

        this.bonusContainer.width = this.bonusContainer.getBounds().width
        this.bonusContainer.height = this.bonusContainer.getBounds().height
        let cellHeight = this.bonusContainer.height
        let spacingOffset = 18
        this.rectMockPosition.setSize(
            this.bonusContainer.width * this.bean.list.length +
            spacingOffset * (this.bean.list.length - 1),
            this.bonusContainer.height
        )

        Phaser.Display.Align.In.LeftCenter(this.bonusContainer, this.rectMockPosition)
        Phaser.Actions.AlignTo(this.bonusContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacingOffset)

        this.bg.setSize(
            this.bonusContainer.getBounds().width + 33,
            cellHeight + 40
        )

    }
}
