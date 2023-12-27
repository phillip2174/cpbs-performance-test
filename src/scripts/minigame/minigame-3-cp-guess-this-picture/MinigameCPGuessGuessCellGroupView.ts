import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameCPGuessPod } from './MinigameCPGuessPod'
import { MinigameCPGuessGuessCellView } from './MinigameCPGuessGuessCellView'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Subscription, interval } from 'rxjs'
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage'

export class MinigameCPGuessGuessCellGroupView extends GameObjects.Container {
    private static CELL_AMOUNT: number = 16
    private static MAX_ALL_CELL_FADE_TIME: number = 800

    private sizeGuess: number

    private cellBorder: GameObjects.Image
    private guessImageMask: CircleMaskImage

    private isDesktop: boolean

    private allCellFadeSubscription: Subscription
    private clickTimeSubscription: Subscription
    private gameResultIsWinSubscription: Subscription

    private cellViewArray: MinigameCPGuessGuessCellView[] = []
    private guessgamePod: MinigameCPGuessPod

    constructor(scene: Scene, pod: MinigameCPGuessPod, x: number, y: number) {
        super(scene, x, y)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.sizeGuess = this.isDesktop ? 380 : 278
    }

    public doInit() {
        this.cellViewArray = []

        const sizeBorder = this.isDesktop ? 394 : 280
        this.cellBorder = this.scene.add
            .image(0, 0, 'minigame-3-guess-border-tint')
            .setDisplaySize(sizeBorder, sizeBorder)
            .setSize(sizeBorder, sizeBorder)

        for (let order = 1; order <= MinigameCPGuessGuessCellGroupView.CELL_AMOUNT; order++) {
            let newCellView = new MinigameCPGuessGuessCellView(this.scene, this.guessgamePod)
            newCellView.doInit(order)
            this.cellViewArray.push(newCellView)
        }
        const cellSize = this.isDesktop ? 94 : 68
        const cellGroupPosition = this.isDesktop ? -143 : -104
        this.cellViewArray = Phaser.Actions.GridAlign(this.cellViewArray, {
            width: 4,
            height: 4,
            cellWidth: cellSize,
            cellHeight: cellSize,
            x: cellGroupPosition,
            y: cellGroupPosition,
        })

        this.add(this.cellBorder)
        this.add(this.cellViewArray)
        this.setupGuessGamePod()

        this.on('destroy', () => {
            this.allCellFadeSubscription?.unsubscribe()
            this.clickTimeSubscription?.unsubscribe()
            this.gameResultIsWinSubscription?.unsubscribe()
        })
    }

    public setCellBeforeStart() {
        this.cellBorder.setTint(0xf19d63)
        this.cellBorder.setVisible(true)
        this.cellViewArray.forEach((cellview) => {
            cellview.setCellBeforeStart()
        })
    }

    public setNewGameCellGroup() {
        if (this.guessImageMask == undefined) {
            this.guessImageMask = this.scene.add
                .rexCircleMaskImage(0, 0, this.guessgamePod.dataBean.productImageUrl, {
                    maskType: 2,
                    radius: 10,
                })
                .setDisplaySize(this.sizeGuess, this.sizeGuess)
                .setSize(this.sizeGuess, this.sizeGuess)

            this.guessImageMask.setTexture(this.guessgamePod.dataBean.productImageUrl, {
                maskType: 2,
                radius: 10,
            })

            this.add(this.guessImageMask)
            this.sendToBack(this.guessImageMask)
        } else {
            this.guessImageMask.setTexture(this.guessgamePod.dataBean.productImageUrl, {
                maskType: 2,
                radius: 10,
            })
        }
        this.cellViewArray.forEach((cellView) => {
            cellView.resetCellView()
        })
    }

    // public hideCellShowAnswer() {
    //     this.cellViewArray.forEach((cellview) => {
    //         cellview.playTweenHide()
    //     })
    // }

    private setupGuessGamePod() {
        this.clickTimeSubscription = this.guessgamePod.remainingClickTimes.subscribe((value) => {
            if (value <= 0) {
                this.cellBorder.setTint(0xaeaec1)
                this.disableRemainCell()
            }
        })
        this.gameResultIsWinSubscription = this.guessgamePod.gameResultIsWin.subscribe(() => {
            this.disableCellButton()
        })
    }

    private disableRemainCell() {
        this.cellViewArray.forEach((cellView) => {
            cellView.disableCellView()
        })
    }

    private disableCellButton() {
        this.cellViewArray.forEach((cellView) => {
            cellView.disableButton()
        })
    }

    public randomHideAllCell() {
        let cloneCellViewArray = [...this.cellViewArray]
        let timePerCell =
            MinigameCPGuessGuessCellGroupView.MAX_ALL_CELL_FADE_TIME / MinigameCPGuessGuessCellGroupView.CELL_AMOUNT

        this.cellViewArray.forEach((cellView) => {
            if (!cellView.visible)
                cloneCellViewArray.splice(
                    cloneCellViewArray.findIndex((x) => x.idOrder == cellView.idOrder),
                    1
                )
        })

        let indexArray: number[] = []
        this.allCellFadeSubscription = interval(timePerCell).subscribe(() => {
            if (cloneCellViewArray.length == 0) {
                this.cellBorder.setVisible(false)
                this.allCellFadeSubscription?.unsubscribe()
            } else {
                let randomIndex = Math.floor(Math.random() * cloneCellViewArray.length)
                indexArray.push(cloneCellViewArray[randomIndex].idOrder)
                this.cellViewArray.find((x) => x.idOrder == cloneCellViewArray[randomIndex].idOrder).hideCell()
                cloneCellViewArray.splice(randomIndex, 1)
            }
        })
    }
}
