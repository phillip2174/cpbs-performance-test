import { MinigameBonusBean } from './MinigameBonusBean'
import { MinigameResultBean } from './MinigameResultBean'
import { MinigameResultUIView } from './MinigameResultUIView'
import { ResourceLoader } from '../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameCPPuzzleImageGroupPod } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupPod'
import { Observable, Observer, tap } from 'rxjs'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameResultBonusCellView } from './MinigameResultBonusCellView'
import { BoldText } from '../../BoldText/BoldText'

export class MinigameResultBonusView extends GameObjects.Container {
    private bg: GameObjects.NineSlice
    private icon: GameObjects.Image
    private text: GameObjects.Text
    private bean: MinigameResultBean
    private cellList: MinigameResultBonusCellView[] = []
    bonusContainer: GameObjects.Container
    rectMockPosition: GameObjects.Rectangle
    isDesktop: boolean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.bg = this.scene.add.nineslice(0, 0, 'minigame-result-reward-bg', '', 100, 100, 15, 15, 15, 15)
        this.text = new BoldText(this.scene, 0, this.isDesktop ? -60 : -55, 'REWARDS', 24, '#2B2B2B')
        this.add([this.bg, this.text])

        this.bonusContainer = this.scene.add.container(0, 0)
        this.rectMockPosition = this.scene.add.rectangle(0, 0, 160, 40, 0xff00ff, 0)
        this.add([this.bonusContainer, this.rectMockPosition])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public updateView(bean: MinigameResultBean) {
        this.bonusContainer.removeAll(true)
        this.cellList = []
        this.bean = bean

        bean.list.forEach((minigameBonusBean) => {
            var bonus = new MinigameResultBonusCellView(this.scene)
            bonus.doInit(0, 0)
            bonus.updateView(minigameBonusBean)

            bonus.width = bonus.getBounds().width
            bonus.height = bonus.getBounds().height

            this.cellList.push(bonus)
            this.bonusContainer.add(bonus)
        })

        this.bonusContainer.width = this.bonusContainer.getBounds().width
        let cellWidth = this.bonusContainer.width
        this.bonusContainer.height = this.bonusContainer.getBounds().height
        let cellHeight = this.bonusContainer.height
        let spacingOffset = 18
        Phaser.Actions.AlignTo(this.bonusContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacingOffset)
        let containerWidth = cellWidth * this.bean.list.length + spacingOffset * (this.bean.list.length - 1)

        let x = -this.bonusContainer.getBounds().width / 2 + cellWidth / 2

        this.bonusContainer.setPosition(x, 0)
        //this.rectMockPosition.setPosition( this.bonusContainer.x - cellWidth/2,this.bonusContainer.y).setSize(containerWidth,this.bonusContainer.getBounds().height).setOrigin(0,0.5)
        this.bg.setSize(containerWidth + (this.isDesktop ? 33 : 40), cellHeight + (this.isDesktop ? 40 : 50))

        this.bonusContainer.setScale(this.isDesktop ? 1 : 0.9)
    }
}
