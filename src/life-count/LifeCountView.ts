import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { LifeCountCellView } from './LifeCountCellView'
import { timer } from 'rxjs'

export class LifeCountView extends GameObjects.Container {
    private lifeCells: LifeCountCellView[] = []
    private currentLifeCount: number = 0
    private maxLife: number = 0
    private lifeCellsIndex: number = 0

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(lifeLength: number, sizeHeart: number, isHeart: boolean = true) {
        this.maxLife = lifeLength
        this.currentLifeCount = this.maxLife
        this.lifeCellsIndex = 0
        this.createUI(sizeHeart, isHeart)
    }

    public decreaseLifeCount() {
        if (this.currentLifeCount <= 0) return
        this.lifeCells[this.lifeCellsIndex].tweenHeartDown()
        this.currentLifeCount--
        this.lifeCellsIndex++
    }

    public increaseLifeCount() {
        console.log(this.maxLife)
        if (this.currentLifeCount >= this.maxLife) return
        this.currentLifeCount++
        this.lifeCellsIndex--
        this.lifeCells[this.lifeCellsIndex].tweenHeartUp()
    }

    public resetAllLifeCount() {
        this.currentLifeCount = this.maxLife
        this.lifeCellsIndex = 0
        this.lifeCells.map((x) => x.resetHeart())
    }

    public getCurrentLifeCount(): number {
        return this.currentLifeCount
    }

    private createUI(sizeHeart: number, isHeart: boolean) {
        let rect = this.scene.add.rectangle(0, 0, 21 * this.maxLife + 6 * (this.maxLife - 1), 20, 0xff00ff, 0)
        this.add(rect)

        let cellCon: GameObjects.Container = this.scene.add.container(0, 0)
        for (let i = 0; i < this.maxLife; i++) {
            let cell = new LifeCountCellView(this.scene)
            if (isHeart) cell.doInitHeart(i, sizeHeart)
            else cell.doInitCard(i, sizeHeart)
            this.lifeCells.push(cell)
            cellCon.add(cell)
        }

        cellCon.width = cellCon.getBounds().width
        cellCon.height = cellCon.getBounds().height

        this.add([cellCon])

        Phaser.Actions.AlignTo(cellCon.getAll(), Phaser.Display.Align.LEFT_CENTER, isHeart ? 5 : 4)
        cellCon.width = cellCon.getBounds().width
        cellCon.height = cellCon.getBounds().height

        rect.setSize(cellCon.width, cellCon.height)
        Phaser.Display.Align.In.RightCenter(cellCon, rect, cellCon.width / 2 - this.lifeCells[0].width / 2)
    }
}
