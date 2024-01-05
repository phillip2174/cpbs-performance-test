import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { BoldText } from '../../../BoldText/BoldText'
import { MinigameCPWhatPod } from './MinigameCPWhatPod'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Button } from '../../button/Button'
import { timer } from 'rxjs'
import Tween from 'phaser3-rex-plugins/plugins/gameobjects/containerlite/Tween'
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage'

export class MinigameCPWhatGuessCellView extends GameObjects.Container {
    private static FLIP_DURATION: number = 100

    public idOrder: number
    public isOpen: boolean
    private isWhiteCell: boolean
    private cellImage: CircleMaskImage
    private cellText: GameObjects.Text
    private containerText: GameObjects.Container
    private button: Button

    //private tweenHide: Phaser.Tweens.Tween
    private tweenFlip: Phaser.Tweens.Tween
    private tweenHover: Phaser.Tweens.Tween
    private tweenHoverOut: Phaser.Tweens.Tween

    private isDesktop: boolean
    private guessgamePod: MinigameCPWhatPod

    constructor(scene: Scene, pod: MinigameCPWhatPod) {
        super(scene)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit(order: number) {
        this.idOrder = order
        this.isWhiteCell = (Math.floor((this.idOrder - 1) / 4) + this.idOrder) % 2 == 0 ? false : true

        const cellSize = this.isDesktop ? 94 : 69
        this.cellImage = this.scene.add.rexCircleMaskImage(0, 0, '')
        this.setCellTexture('minigame-3-guess-cell-active')
        this.cellImage.setDisplaySize(cellSize, cellSize).setSize(cellSize, cellSize)

        this.cellText = new BoldText(this.scene, 0, -7, order.toString(), this.isDesktop ? 72 : 52, '#EE843C')
        this.setCellColorActive()

        this.containerText = this.scene.add.container(0, 0, this.cellText)

        this.button = new Button(this.scene, 0, 0, cellSize, cellSize, '').setAlpha(0.01)
        this.button.onClick(() => {
            this.onClickGuessCell()
        })
        this.button.on('pointerover', () => {
            this.playHoverTween()
        })
        this.button.on('pointerout', () => {
            this.playHoverOutTween()
        })
        this.button.setCanInteract(false, false)
        this.add([this.cellImage, this.containerText, this.button])
    }

    public createTweenFlip() {
        this.tweenFlip = this.scene.tweens.add({
            targets: this,
            props: {
                scaleX: { value: 0, duration: MinigameCPWhatGuessCellView.FLIP_DURATION, yoyo: true },
            },
            ease: 'linear',
            onStart: () => {
                console.log('Flipping')
                timer(MinigameCPWhatGuessCellView.FLIP_DURATION).subscribe(() => {
                    this.setTextureOpenCard()
                })
            },
        })
    }

    public createTweenHover() {
        this.tweenHover = this.scene.tweens.add({
            targets: this.containerText,
            props: {
                angle: { from: 0, to: 15, duration: 100 },
            },
            loop: 3,
            persist: true,
            paused: true,
        })
    }

    public createTweenHoverOut() {
        this.tweenHoverOut = this.scene.tweens.add({
            targets: this.containerText,
            props: {
                angle: { from: 15, to: 0, duration: 100 },
            },
            loop: 3,
            persist: true,
            paused: true,
        })
    }

    public playHoverTween() {
        this.tweenHoverOut?.pause()
        this.tweenHover?.restart()
    }
    public playHoverOutTween() {
        this.tweenHover?.pause()
        this.tweenHoverOut?.restart()
    }

    public setCellBeforeStart() {
        this.createTweenHover()
        this.createTweenHoverOut()
        this.isOpen = false
        this.cellText.setVisible(true)
        this.setCellTexture('minigame-3-guess-cell-active')
        this.setCellColorActive()
        this.setVisible(true)
    }

    public setActiveButtonCellView() {
        this.button.setCanInteract(true, false)
    }

    public disableCellView() {
        if (!this.isOpen) {
            this.setCellTexture('minigame-3-guess-cell-disactive')
            this.setCellColorDisactive()
        }
        this.button.setCanInteract(false, false)
    }

    public disableButton() {
        console.log('disableButton')
        this.tweenHover?.destroy()
        this.tweenHoverOut?.destroy()
        this.containerText.setRotation(0)
        this.button.setCanInteract(false, false)
    }

    public flipCellAndDisableButton() {
        this.button.setCanInteract(false, false)
        this.createTweenFlip()
    }

    private setTextureOpenCard() {
        this.cellText.setVisible(false)
        switch (this.idOrder) {
            case 1:
                this.cellImage.setTexture('minigame-3-hint-sheet', this.idOrder - 1, {
                    maskType: 2,
                    radius: { tl: 18, tr: 0, bl: 0, br: 0 },
                })
                break
            case 4:
                this.cellImage.setTexture('minigame-3-hint-sheet', this.idOrder - 1, {
                    maskType: 2,
                    radius: { tl: 0, tr: 18, bl: 0, br: 0 },
                })
                break
            case 13:
                this.cellImage.setTexture('minigame-3-hint-sheet', this.idOrder - 1, {
                    maskType: 2,
                    radius: { tl: 0, tr: 0, bl: 18, br: 0 },
                })
                break
            case 16:
                this.cellImage.setTexture('minigame-3-hint-sheet', this.idOrder - 1, {
                    maskType: 2,
                    radius: { tl: 0, tr: 0, bl: 0, br: 18 },
                })
                break
            default:
                this.cellImage.setTexture('minigame-3-hint-sheet', this.idOrder - 1, {
                    maskType: 2,
                    radius: 0,
                })
                break
        }
    }

    private setCellTexture(imageString: string) {
        if (this.isWhiteCell)
            this.cellImage.setTexture(imageString + '-white', {
                maskType: 2,
                radius: 0,
            })
        else
            this.cellImage.setTexture(imageString + '-color', {
                maskType: 2,
                radius: 0,
            })
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
        this.isOpen = true
        this.guessgamePod.reduceClickTime()
        this.button.setCanInteract(false, false)
        this.createTweenFlip()
    }
}
