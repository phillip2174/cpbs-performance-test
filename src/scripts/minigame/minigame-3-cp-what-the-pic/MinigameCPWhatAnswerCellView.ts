import { GameObjects, Scene } from 'phaser'
import { MinigameCPWhatPod } from './MinigameCPWhatPod'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Button } from '../../button/Button'

export class MinigameCPWhatAnswerCellView extends GameObjects.Container {
    private cellBgImage: GameObjects.Image
    private cellImage: GameObjects.Image
    private cellHideImage: GameObjects.Image
    private overlaySelected: GameObjects.Image
    private button: Button
    private isAnswer: boolean

    private guessgamePod: MinigameCPWhatPod
    private isDesktop: boolean

    constructor(scene: Scene, pod: MinigameCPWhatPod) {
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
            .image(0, 0, this.isDesktop ? 'minigame-3-answer-hidecell-desktop' : 'minigame-3-answer-hidecell-mobile')
            .setDisplaySize(cellWidth, cellHeight)
            .setSize(cellWidth, cellHeight)

        this.button = new Button(this.scene, 0, 0, cellWidth, cellHeight, '').setAlpha(0.01)
        this.button.onClick(() => {
            this.onClickAnswerCell()
        })
        this.button.setCanInteract(false, false)

        this.add([this.cellBgImage, this.cellImage, this.overlaySelected, this.cellHideImage, this.button])
    }

    public setCellBeforeStart(imageUrl: string, isAnswer: boolean) {
        this.cellBgImage.setVisible(false)
        this.cellHideImage.setVisible(true)
        this.overlaySelected.setVisible(false)
        this.isAnswer = isAnswer
        this.cellImage.setTexture(imageUrl)
        this.cellImage
            .setDisplaySize(this.isDesktop ? 70 : 65, this.isDesktop ? 100 : 90)
            .setSize(this.isDesktop ? 70 : 65, this.isDesktop ? 100 : 90)
    }

    public setNewGameButton() {
        this.cellBgImage.setVisible(true)
        this.cellHideImage.setVisible(false)
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
