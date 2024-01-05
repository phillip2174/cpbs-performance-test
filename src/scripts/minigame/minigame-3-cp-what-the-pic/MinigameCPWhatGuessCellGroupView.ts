import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameCPWhatPod } from './MinigameCPWhatPod'
import { MinigameCPWhatGuessCellView } from './MinigameCPWhatGuessCellView'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Observable, Subscription, concatMap, interval, tap } from 'rxjs'
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager'

export class MinigameCPWhatGuessCellGroupView extends GameObjects.Container {
    private static CELL_AMOUNT: number = 16
    private static MAX_ALL_CELL_FADE_TIME: number = 800
    private static DELAY_PER_CELL: number = 100
    private static CELL_SIZE_FOR_SPRITE_SHEET: number = 96

    //private sizeGuess: number
    private cellSize: number

    private cellGroupBackground: CircleMaskImage
    private cellGroupBorder: GameObjects.Image
    //private guessImageMask: CircleMaskImage

    private isDesktop: boolean

    private allCellFadeSubscription: Subscription
    private allCellFlipSubscription: Subscription
    private clickTimeSubscription: Subscription
    private gameResultIsWinSubscription: Subscription

    private cellViewArray: MinigameCPWhatGuessCellView[] = []
    private guessgamePod: MinigameCPWhatPod

    constructor(scene: Scene, pod: MinigameCPWhatPod, x: number, y: number) {
        super(scene, x, y)
        this.guessgamePod = pod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit() {
        this.cellViewArray = []

        //this.sizeGuess = this.isDesktop ? 384 : 278
        const sizeBackground = this.isDesktop ? 384 : 280
        const sizeBorder = this.isDesktop ? 394 : 289

        this.cellGroupBackground = this.scene.add
            .rexCircleMaskImage(2, this.isDesktop ? 0 : -2, 'minigame-3-guess-background-tint', {
                maskType: 2,
                radius: 15,
            })
            .setDisplaySize(sizeBackground, sizeBackground)
        //.setSize(sizeBackground, sizeBackground)
        console.log(this.cellGroupBackground)

        this.cellGroupBorder = this.scene.add
            .image(2, 0, 'minigame-3-guess-border-tint')
            .setDisplaySize(sizeBorder, sizeBorder)
            .setSize(sizeBorder, sizeBorder)

        for (let order = 1; order <= MinigameCPWhatGuessCellGroupView.CELL_AMOUNT; order++) {
            let newCellView = new MinigameCPWhatGuessCellView(this.scene, this.guessgamePod)
            newCellView.doInit(order)
            this.cellViewArray.push(newCellView)
        }
        this.cellSize = this.isDesktop ? 94 : 69
        const cellGroupPosition = this.isDesktop ? -143 : -105
        this.cellViewArray = Phaser.Actions.GridAlign(this.cellViewArray, {
            width: 4,
            height: 4,
            cellWidth: this.cellSize,
            cellHeight: this.cellSize,
            x: cellGroupPosition + 2,
            y: cellGroupPosition,
        })

        this.add([this.cellGroupBackground, this.cellGroupBorder])
        this.add(this.cellViewArray)
        this.setupGuessGamePod()

        this.on('destroy', () => {
            this.allCellFadeSubscription?.unsubscribe()
            this.allCellFlipSubscription?.unsubscribe()
            this.clickTimeSubscription?.unsubscribe()
            this.gameResultIsWinSubscription?.unsubscribe()
        })
    }

    public setBorderAndBackGround() {
        this.cellGroupBackground.setTint(0xf19d63)
        this.cellGroupBackground.setVisible(true)

        this.cellGroupBorder.setTint(0xf19d63)
        this.cellGroupBorder.setVisible(true)
    }

    public setCellBeforeStart() {
        // if (this.guessImageMask == undefined) {
        //     this.guessImageMask = this.scene.add
        //         .rexCircleMaskImage(0, 0, this.guessgamePod.dataBean.productImageUrl, {
        //             maskType: 2,
        //             radius: 10,
        //         })
        //         .setDisplaySize(this.sizeGuess, this.sizeGuess)
        //         .setSize(this.sizeGuess, this.sizeGuess)

        //     this.guessImageMask.setTexture(this.guessgamePod.dataBean.productImageUrl, {
        //         maskType: 2,
        //         radius: 10,
        //     })

        //     this.add(this.guessImageMask)
        //     this.sendToBack(this.guessImageMask)
        // } else {
        //     this.guessImageMask.setTexture(this.guessgamePod.dataBean.productImageUrl, {
        //         maskType: 2,
        //         radius: 10,
        //     })
        // }
        this.cellViewArray.forEach((cellview) => {
            cellview.setCellBeforeStart()
        })
    }

    public setCellImage(): Observable<string> {
        this.scene.game.textures.removeKey('minigame-3-hint-sheet')
        this.scene.game.textures.removeKey('minigame-3-hint-full')
        return ResourceManager.instance
            .loadSpriteSheet('minigame-3-hint-sheet', this.guessgamePod.dataBean.productImageUrl, {
                frameWidth: MinigameCPWhatGuessCellGroupView.CELL_SIZE_FOR_SPRITE_SHEET,
                frameHeight: MinigameCPWhatGuessCellGroupView.CELL_SIZE_FOR_SPRITE_SHEET,
            })
            .pipe(
                concatMap(() =>
                    ResourceManager.instance.loadTexture(
                        'minigame-3-hint-full',
                        this.guessgamePod.dataBean.productImageUrl
                    )
                ),
                tap(() => this.setCellBeforeStart())
            )
    }

    public setActiveButtonAllCell() {
        this.cellViewArray.forEach((cellView) => {
            cellView.setActiveButtonCellView()
        })
    }

    private setupGuessGamePod() {
        this.clickTimeSubscription = this.guessgamePod.remainingClickTimes.subscribe((value) => {
            if (value <= 0) {
                this.cellGroupBackground.setTint(0xaeaec1)
                this.cellGroupBorder.setTint(0xaeaec1)
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

    public disableCellButton() {
        this.cellViewArray.forEach((cellView) => {
            cellView.disableButton()
        })
    }

    public flipAllCell() {
        let cloneCellViewArray = [...this.cellViewArray]
        this.cellViewArray.forEach((cellView) => {
            if (cellView.isOpen) {
                cloneCellViewArray.splice(
                    cloneCellViewArray.findIndex((x) => x.idOrder == cellView.idOrder),
                    1
                )
            }
        })
        this.allCellFlipSubscription = interval(MinigameCPWhatGuessCellGroupView.DELAY_PER_CELL).subscribe(() => {
            if (cloneCellViewArray.length == 0) {
                this.cellGroupBackground.setVisible(false)
                this.cellGroupBorder.setVisible(false)
                this.allCellFlipSubscription?.unsubscribe()
            } else {
                this.cellViewArray.find((x) => x.idOrder == cloneCellViewArray[0].idOrder).flipCellAndDisableButton()
                cloneCellViewArray.splice(0, 1)
            }
        })
    }

    // public randomHideAllCell() {
    //     this.disableCellButton()
    //     let cloneCellViewArray = [...this.cellViewArray]
    //     let timePerCell =
    //         MinigameCPWhatGuessCellGroupView.MAX_ALL_CELL_FADE_TIME / MinigameCPWhatGuessCellGroupView.CELL_AMOUNT

    //     this.cellViewArray.forEach((cellView) => {
    //         if (!cellView.visible) {
    //             cloneCellViewArray.splice(
    //                 cloneCellViewArray.findIndex((x) => x.idOrder == cellView.idOrder),
    //                 1
    //             )
    //         }
    //     })

    //     let indexArray: number[] = []
    //     this.allCellFadeSubscription = interval(timePerCell).subscribe(() => {
    //         if (cloneCellViewArray.length == 0) {
    //             this.cellBorder.setVisible(false)
    //             this.allCellFadeSubscription?.unsubscribe()
    //         } else {
    //             let randomIndex = Math.floor(Math.random() * cloneCellViewArray.length)
    //             indexArray.push(cloneCellViewArray[randomIndex].idOrder)
    //             this.cellViewArray
    //                 .find((x) => x.idOrder == cloneCellViewArray[randomIndex].idOrder)
    //                 .flipCellAndDisableButton()
    //             cloneCellViewArray.splice(randomIndex, 1)
    //         }
    //     })
    // }
}
