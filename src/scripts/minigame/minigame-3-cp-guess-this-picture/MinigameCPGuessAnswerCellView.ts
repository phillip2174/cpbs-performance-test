import { GameObjects, Scene } from 'phaser'
import { MinigameCPGuessPod } from './MinigameCPGuessPod'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Button } from '../../button/Button'

export class MinigameCPGuessAnswerCellView extends GameObjects.Container {
    private cellBgImage: GameObjects.Image
    private cellImage: GameObjects.Image
    private cellHideImage: GameObjects.Image
    private overlaySelected: GameObjects.Image
    private button: Button
    private isAnswer: boolean

    private guessgamePod: MinigameCPGuessPod
    private isDesktop: boolean

    constructor(scene: Scene, pod: MinigameCPGuessPod) {
        super(scene)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit() {
        const cellWidth = this.isDesktop ? 127 : 91
        const cellHeight = this.isDesktop ? 120 : 108

        this.cellBgImage = this.scene.add
            .image(0, 0, 'minigame-3-answer-cell')
            .setDisplaySize(cellWidth, cellHeight)
            .setSize(cellWidth, cellHeight)

        this.cellImage = this.scene.add.image(0, 0, '')

        this.overlaySelected = this.scene.add
            .image(0, 0, 'minigame-3-answer-select')
            .setDisplaySize(cellWidth + 28, cellHeight + 28)
            .setSize(cellWidth + 28, cellHeight + 28)
            .setAlpha(0.8)
            .setVisible(false)

        this.cellHideImage = this.scene.add
            .image(0, 0, 'minigame-3-answer-hidecell')
            .setDisplaySize(cellWidth, cellHeight)
            .setSize(cellWidth, cellHeight)

        this.button = new Button(this.scene, 0, 0, cellWidth, cellHeight, '').setAlpha(0.01)
        this.button.onClick(() => {
            this.onClickAnswerCell()
        })
        this.button.setCanInteract(false, false)

        this.add([this.cellBgImage, this.cellImage, this.overlaySelected, this.cellHideImage, this.button])
    }

    public setCellBeforeStart() {
        this.cellBgImage.setVisible(false)
        this.cellHideImage.setVisible(true)
        this.overlaySelected.setVisible(false)
    }

    public setNewGameButton(imageUrl: string, isAnswer: boolean) {
        this.cellBgImage.setVisible(true)
        this.cellHideImage.setVisible(false)
        this.isAnswer = isAnswer
        this.cellImage.setTexture(imageUrl)
        this.cellImage.setDisplaySize(70, 100).setSize(70, 100)
        this.button.setCanInteract(true, false)
    }

    public setCanInteractButton(value: boolean) {
        this.button.setCanInteract(value, false)
    }

    private onClickAnswerCell() {
        this.button.setCanInteract(false, false)
        this.overlaySelected.setVisible(true)
        this.guessgamePod.setGameResultIsWin(this.isAnswer)
    }
}
