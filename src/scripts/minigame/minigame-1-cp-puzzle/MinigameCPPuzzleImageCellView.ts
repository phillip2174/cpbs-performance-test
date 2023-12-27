import { Dictionary } from '../../plugins/Dictionary'
import { ResourceLoader } from '../../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from './MinigameCPPuzzleImageGroupView'
import { MinigameCPPuzzleImageGroupPod } from './MinigameCPPuzzleImageGroupPod'
import { PodProvider } from '../../pod/PodProvider'
import { AudioManager } from '../../Audio/AudioManager'
import { UIDepthConfig } from '../../UIDepthConfig'

export class MinigameCPPuzzleImageCellView extends GameObjects.Container {
    private readonly OFFSET = 2
    private image: GameObjects.Image
    private masker: GameObjects.Graphics
    index: number
    indexPosition: number
    cellWidth: number
    cellHeight: number
    maskerDebug: GameObjects.Graphics
    stroke: GameObjects.Graphics
    isSelect: boolean
    group: MinigameCPPuzzleImageGroupView
    isCanClick: boolean
    textDebug: GameObjects.Text
    pod: MinigameCPPuzzleImageGroupPod
    selectImage: GameObjects.Graphics
    fx: Phaser.FX.Glow
    fxGlow: GameObjects.Graphics

    private audioManager: AudioManager

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(
        group: MinigameCPPuzzleImageGroupView,
        pod: MinigameCPPuzzleImageGroupPod,
        indexOrigin: number,
        indexPosition: number,
        width: number,
        height: number
    ): void {
        this.audioManager = PodProvider.instance.audioManager
        this.index = indexOrigin
        this.group = group
        this.pod = pod
        this.indexPosition = indexPosition
        this.cellWidth = width
        this.cellHeight = height
        this.isSelect = false
        this.isCanClick = true
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.createPreview()
        this.image.setInteractive().on('pointerup', () => {
            if (!this.isCanClick || !this.pod.canClick) return

            if (!this.isSelect) {
                if (this.pod.selectImagePositionIndex.getValue() == undefined) {
                    this.onSelect()
                    this.pod.selectImagePositionIndex.next(this.indexPosition)
                } else {
                    const currentIndex = this.indexPosition
                    const moveIndex = this.pod.selectImagePositionIndex.getValue()
                    this.moveToIndex(moveIndex, this.pod.positionIndexMap.get(moveIndex))
                    this.pod.selectImagePositionIndex.next(currentIndex)
                }
            } else {
                this.onDeSelect()
                this.audioManager.playSFXSound('negative_click_sfx')
                this.pod.selectImagePositionIndex.next(undefined)
            }
        })

        this.pod.selectImagePositionIndex.subscribe((positionIndex) => {
            if (this.isSelect && positionIndex != this.indexPosition) {
                this.isSelect = false
                this.moveToIndex(positionIndex, this.pod.positionIndexMap.get(positionIndex))
                this.pod.selectImagePositionIndex.next(undefined)
                this.pod.afterSwap()
            }
        })
    }

    createPreview() {
        const x = -this.cellWidth / 2
        const y = -this.cellHeight / 2
        this.fxGlow = this.scene.add
            .graphics()
            .fillStyle(0xffffff, 0.6)
            .fillRoundedRect(x, y, this.cellWidth - this.OFFSET, this.cellHeight - this.OFFSET, 6)
        this.add(this.fxGlow)
        this.fxGlow.setActive(false)

        this.image = this.scene.add.image(0, 0, 'minigame1', this.index)
        this.add(this.image)
        this.image.setPosition(0, 0)

        this.masker = this.scene.add
            .graphics()
            .fillRoundedRect(x, y, this.cellWidth - this.OFFSET, this.cellHeight - this.OFFSET, 6)

        this.selectImage = this.scene.add
            .graphics()
            .fillStyle(0xf78a3b, 0.6)
            .fillRoundedRect(x, y, this.cellWidth - this.OFFSET, this.cellHeight - this.OFFSET, 6)
        this.stroke = this.scene.add
            .graphics()
            .lineStyle(6, 0xee843c)
            .strokeRoundedRect(x + 2, y + 2, this.cellWidth - this.OFFSET - 4, this.cellHeight - this.OFFSET - 4, 6)
        this.add([this.selectImage, this.stroke])
        this.selectImage.setVisible(false)
        this.stroke.setVisible(false)

        //this.textDebug = this.scene.add.text(0, 0, this.index.toString() + ":" + this.indexPosition.toString()).setColor("green");
        //this.add(this.textDebug);

        this.image.setMask(this.masker.createGeometryMask())

        // var debug1 = this.scene.add.rectangle(0,0, 50, 50, 0xff00ff).setOrigin(0.5).setDepth(1002);
        // this.add(debug1);

        this.setDepth(UIDepthConfig.MINI_GAME_GAMEPLAY)
    }

    public onSelect() {
        this.setDepth(UIDepthConfig.MINI_GAME_GAMEPLAY)
        this.selectImage.setVisible(true)
        this.stroke.setVisible(true)
        this.fx = this.fxGlow.postFX.addGlow(0xee843c, 6, 0, false, 1, 10)
        this.fxGlow.setActive(true)
        this.isSelect = true

        this.audioManager.playSFXSound('positive_click_sfx')
    }

    public onDeSelect() {
        this.setDepth(UIDepthConfig.MINI_GAME_GAMEPLAY)
        this.selectImage.setVisible(false)
        this.stroke.setVisible(false)
        this.fxGlow.clearFX()
        this.fxGlow.setActive(false)
        this.isSelect = false
    }

    public onUpdate() {
        const transfrom = this.image.getWorldTransformMatrix()
        this.masker.setPosition(transfrom.tx, transfrom.ty).setScale(transfrom.scaleX, transfrom.scaleY)
        //this.textDebug.setText(this.index.toString() + ":" + this.indexPosition.toString())
    }

    moveToIndex(secondImageIndex: number, moveTo: Math.Vector2) {
        //console.log(this.indexPosition + "-> " + secondImageIndex);
        this.indexPosition = secondImageIndex
        this.isCanClick = false
        this.scene.tweens
            .add({
                targets: this,
                ease: `Sine.easeInOut`,
                duration: 100,
                props: {
                    x: { from: this.getLocalTransformMatrix().tx, to: moveTo.x },
                    y: { from: this.getLocalTransformMatrix().ty, to: moveTo.y },
                },
                onComplete: () => {
                    this.isCanClick = true
                    this.onDeSelect()
                },
            })
            .play()

        this.audioManager.playSFXSound('jigsaw_puzzle_move_sfx')
    }
}
