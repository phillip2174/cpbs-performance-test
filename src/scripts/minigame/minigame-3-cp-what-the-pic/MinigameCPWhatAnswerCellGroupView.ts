import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { MinigameCPWhatPod } from './MinigameCPWhatPod'
import { MinigameCPWhatAnswerCellView } from './MinigameCPWhatAnswerCellView'

export class MinigameCPWhatAnswerCellGroupView extends GameObjects.Container {
    private answerCellAmount: number = 3
    private answerArray: number[] = []

    private isDesktop: boolean
    private cellViewArray: MinigameCPWhatAnswerCellView[] = []
    private guessgamePod: MinigameCPWhatPod

    constructor(scene: Scene, pod: MinigameCPWhatPod, x: number, y: number) {
        super(scene, x, y)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit() {
        this.cellViewArray = []
        this.randomImage()

        for (let order = 0; order < this.answerCellAmount; order++) {
            let newCellView = new MinigameCPWhatAnswerCellView(this.scene, this.guessgamePod)
            newCellView.doInit()
            this.cellViewArray.push(newCellView)
        }

        const cellWidth = this.isDesktop ? 135 : 97
        const cellHeight = this.isDesktop ? 108 : 108
        this.cellViewArray = Phaser.Actions.GridAlign(this.cellViewArray, {
            width: 3,
            cellWidth: cellWidth,
            cellHeight: cellHeight,
        })

        this.add(this.cellViewArray)
    }

    public setCellBeforeStart() {
        this.randomImage()
        for (let order = 0; order < this.answerCellAmount; order++) {
            this.cellViewArray[order].setCellBeforeStart(
                this.guessgamePod.choiceBeans[this.answerArray[order]].imageUrl,
                this.guessgamePod.choiceBeans[this.answerArray[order]].isAnswer
            )
        }
    }

    public setActiveButtonAllCell() {
        for (let index = 0; index < this.answerCellAmount; index++) {
            this.cellViewArray[index].setNewGameButton()
        }
    }

    public setCanInteractButton(value: boolean) {
        this.cellViewArray.forEach((cellView) => {
            cellView.setCanInteractButton(value)
        })
    }

    private randomImage() {
        const shuffle = (array: number[]) => {
            return array.sort(() => Math.random() - 0.5)
        }
        this.answerArray = []
        for (let order = 0; order < this.answerCellAmount; order++) {
            this.answerArray.push(order)
        }
        this.answerArray = shuffle(this.answerArray)
    }
}
