import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { BoldText } from '../../../BoldText/BoldText'
import { MinigameCPGuessPod } from './MinigameCPGuessPod'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Button } from '../../button/Button'

export class MinigameCPGuessGuessCellView extends GameObjects.Container {
    public idOrder: number
    private isWhiteCell: boolean
    private cellImage: GameObjects.Image
    private cellText: GameObjects.Text
    private button: Button

    private isDesktop: boolean
    //private tweenHide: Phaser.Tweens.Tween
    private guessgamePod: MinigameCPGuessPod

    constructor(scene: Scene, pod: MinigameCPGuessPod) {
        super(scene)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit(order: number) {
        this.idOrder = order
        this.isWhiteCell = (Math.floor((this.idOrder - 1) / 4) + this.idOrder) % 2 == 0 ? false : true

        const cellSize = this.isDesktop ? 94 : 68
        this.cellImage = this.scene.add.image(0, 0, '')
        this.setCellTexture('minigame-3-guess-cell-active')
        this.cellImage.setDisplaySize(cellSize, cellSize).setSize(cellSize, cellSize)

        this.cellText = new BoldText(
            this.scene,
            0,
            this.isDesktop ? -10 : -7,
            order.toString(),
            this.isDesktop ? 72 : 52,
            '#EE843C'
        )
        this.setCellColorActive()

        this.button = new Button(this.scene, 0, 0, cellSize, cellSize, '').setAlpha(0.01)
        this.button.onClick(() => {
            this.onClickGuessCell()
        })
        this.button.setCanInteract(false, false)

        this.add([this.cellImage, this.cellText, this.button])
    }

    // public playTweenHide() {
    //     this.tweenHide = this.scene.tweens.add({
    //         targets: this,
    //         props: {
    //             alpha: { from: 1, to: 0 },
    //         },
    //         duration: 400,
    //         onComplete: () => {
    //             this.setVisible(false)
    //         },
    //     })
    // }

    public setCellBeforeStart() {
        this.setCellTexture('minigame-3-guess-cell-active')
        this.setCellColorActive()
        this.setVisible(true)
    }

    public resetCellView() {
        this.button.setCanInteract(true, false)
    }

    public disableCellView() {
        this.setCellTexture('minigame-3-guess-cell-disactive')
        this.setCellColorDisactive()
        this.button.setCanInteract(false, false)
    }

    public disableButton() {
        this.button.setCanInteract(false, false)
    }

    public hideCell() {
        this.setVisible(false)
    }

    private setCellTexture(imageString: string) {
        if (this.isWhiteCell) this.cellImage.setTexture(imageString + '-white')
        else this.cellImage.setTexture(imageString + '-color')
    }

    private setCellColorActive() {
        if (this.isWhiteCell) {
            this.cellText.setColor('#F19D63')
        } else {
            this.cellText.setColor('#EE843C')
        }
    }

    private setCellColorDisactive() {
        if (this.isWhiteCell) {
            this.cellText.setColor('#CECECE')
        } else {
            this.cellText.setColor('#A7A7A7')
        }
    }

    private onClickGuessCell() {
        this.guessgamePod.reduceClickTime()
        this.setVisible(false)
    }
}
