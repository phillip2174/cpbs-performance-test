import { Vector } from 'matter'
import { Dictionary } from '../../plugins/Dictionary'
import { ResourceLoader } from '../../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageCellView } from './MinigameCPPuzzleImageCellView'
import { Observable, Observer, concatMap, finalize, interval, map, take, takeLast, tap } from 'rxjs'
import { MinigameCPPuzzleImageGroupPod } from './MinigameCPPuzzleImageGroupPod'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameState } from '../MinigameState'
import { PodProvider } from '../../pod/PodProvider'
import { AudioManager } from '../../Audio/AudioManager'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class MinigameCPPuzzleImageGroupView extends GameObjects.Container {
    private readonly WIDTH = 3
    private readonly HEIGHT = 4
    private readonly CELL_WIDTH = 87.6
    private readonly CELL_HEIGHT = 98
    private readonly CELL_OFFSET = 0
    private readonly TWEEN_TIME = 210
    private isDesktop: boolean
    private cellList: MinigameCPPuzzleImageCellView[] = []
    pod: MinigameCPPuzzleImageGroupPod
    scenePod: MinigameScenePod
    private callBackFunction: Function
    fullImage: GameObjects.Image
    tweenFull: Tweens.Tween

    private audioManager: AudioManager

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
        this.pod = new MinigameCPPuzzleImageGroupPod(this.scene)
    }

    public doInit(scenePod: MinigameScenePod) {
        this.audioManager = PodProvider.instance.audioManager
        this.scenePod = scenePod
        this.pod.canClick = false

        this.pod.afterSwap = (_) => {
            var isWin = this.pod.checkCorrectAllList(this.cellList.map((x) => x.indexPosition))
            if (isWin) {
                this.callBackFunction()
                this.audioManager.playSFXSound('win_sfx')
            }
        }

        this.setDepth(2)

        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public showPreview(): Observable<string> {
        this.fullImage?.destroy()
        this.cellList.forEach((x) => {
            x.destroy()
        })
        this.cellList = []

        this.scene.game.textures.removeKey('minigame1')
        this.scene.game.textures.removeKey('minigame1-full')
        return ResourceManager.instance
            .loadSpriteSheet('minigame1', this.scenePod.balance.image, {
                frameWidth: this.CELL_WIDTH,
                frameHeight: this.CELL_HEIGHT,
            })
            .pipe(
                concatMap(() => ResourceManager.instance.loadTexture('minigame1-full', this.scenePod.balance.image)),
                tap((x) => {
                    this.createPreview()
                })
            )
    }

    tweenShowFullImage(): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            this.tweenFull = this.scene.tweens.add({
                targets: this.fullImage,
                ease: `Sine.easeInOut`,
                duration: 1000,
                props: {
                    alpha: { from: 0, to: 1 },
                },
                onStart: () => {
                    this.fullImage.setVisible(true)
                },
                onComplete: () => {
                    observer.next()
                    observer.complete()
                },
            })
        })
    }

    setCallBackOnFinish(callBack: Function) {
        this.callBackFunction = callBack
    }

    createPreview() {
        for (let index = 0; index < this.WIDTH * this.HEIGHT; index++) {
            const imageCell = new MinigameCPPuzzleImageCellView(this.scene)
            imageCell.doInit(this, this.pod, index, index, this.CELL_WIDTH, this.CELL_HEIGHT)
            this.add(imageCell)
            this.cellList.push(imageCell)
            var x = index % this.WIDTH
            var y = Math.FloorTo(index / this.WIDTH)
            var width = this.CELL_WIDTH + this.CELL_OFFSET
            var height = this.CELL_HEIGHT + this.CELL_OFFSET
            var posX = -width + x * width
            var posY = -height + y * height

            this.pod.positionIndexMap.set(index, new Phaser.Math.Vector2(posX, posY))
            //console.log(x + ':' + y, posX, posY)
            imageCell.setPosition(posX, posY)
        }

        // var debug1 = this.scene.add.rectangle(0, 0, 50, 50, 0xff0000).setOrigin(0.5).setDepth(1000);
        // this.add(debug1);

        this.fullImage = this.scene.add.image(0, this.CELL_HEIGHT / 2, 'minigame1-full')
        var diff = this.fullImage.width - this.WIDTH * this.CELL_WIDTH

        this.fullImage.setCrop(0, 0, this.WIDTH * this.CELL_WIDTH, this.HEIGHT * this.CELL_HEIGHT)
        this.fullImage.setPosition(diff / 2, this.CELL_HEIGHT / 2)
        this.add(this.fullImage)
        this.fullImage.setVisible(false)
    }

    public onUpdate() {
        this.cellList.forEach((cellView) => {
            cellView.onUpdate()
        })
    }

    public reset() {
        this.cellList.forEach((cellView) => {
            cellView.onDeSelect()
        })
        this.pod.selectImage = undefined
        this.pod.selectImagePositionIndex.next(undefined)
    }
    public shuffleImage(count: number): Observable<number> {
        this.pod.canClick = false
        return interval(this.TWEEN_TIME + 10)
            .pipe(
                take(count),
                finalize(() => (this.pod.canClick = true))
            )
            .pipe(tap((_) => this.randomImage()))
            .pipe(takeLast(1))
    }

    public randomImage() {
        const randomIndex = this.pod.randomIndex(this.cellList.length)
        for (let index = 0; index < this.cellList.length; index++) {
            const cell = this.cellList[index]
            const newPosition = randomIndex[index]
            const newPositionXY = this.pod.positionIndexMap.get(newPosition)
            cell.indexPosition = newPosition
            const startPosition = new Math.Vector2(cell.getLocalTransformMatrix().tx, cell.getLocalTransformMatrix().ty)
            this.scene.tweens
                .add({
                    targets: cell,
                    ease: `Sine.easeInOut`,
                    duration: this.TWEEN_TIME,
                    props: {
                        x: { from: startPosition.x, to: newPositionXY.x },
                        y: { from: startPosition.y, to: newPositionXY.y },
                    },
                })
                .play()
        }

        this.audioManager.playSFXSound('jigsaw_puzzle_move_sfx')
    }
}
