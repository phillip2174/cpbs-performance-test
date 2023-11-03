import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { MinigameState } from '../MinigameState'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameSuccessIndicatorView } from '../MinigameSuccessIndicatorView'
import { PodProvider } from '../../pod/PodProvider'

export class MinigameCPOrderMenuCellView extends GameObjects.Container {
    public static readonly CELL_BG_KEY: string = 'minigame-menu-cell-bg-'
    public static readonly CELL_ICON_KEY: string = 'recipe-'

    private cellBg: GameObjects.Image
    private cellIcon: GameObjects.Image

    private cellButton: Button

    private cellId: number

    private succesIndicatorView: MinigameSuccessIndicatorView

    private isDesktop: boolean
    private isTweening: boolean = false
    private isIconChanged: boolean = false

    private onClickTween: Tweens.Tween

    private updateIconCallback: Function

    private scenePod: MinigameScenePod
    private minigamePod: MinigameCPOrderPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(cellId: number): void {
        this.cellId = cellId
        this.scenePod = PodProvider.instance.minigameScenePod
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.isDesktop = this.scene.sys.game.device.os.desktop
        this.isDesktop ? this.setupCellDesktop() : this.setupCellMobile()
        this.cellButton = new Button(this.scene, 0, 0, this.cellBg.width, this.cellBg.height, '', 250).setAlpha(0.01)
        this.succesIndicatorView = new MinigameSuccessIndicatorView(this.scene)
        this.succesIndicatorView.doInit()
        this.setOnClickAction()
        this.createOnClickTween()
        this.add([this.cellBg, this.cellIcon, this.cellButton, this.succesIndicatorView])
    }

    public setCellBg(colorKey: string): void {
        this.cellBg.setTexture(MinigameCPOrderMenuCellView.CELL_BG_KEY + colorKey)
    }

    public setCellIcon(iconKey: string): void {
        this.cellIcon.setTexture(MinigameCPOrderMenuCellView.CELL_ICON_KEY + iconKey)
    }

    public playOnClickTween(callback: Function, isCorrect: boolean): void {
        this.updateIconCallback = callback
        if (!this.isTweening) {
            this.onClickTween?.restart()
            this.succesIndicatorView?.playIndicatorTween(isCorrect)
        }
    }

    private setupCellDesktop(): void {
        this.cellBg = this.scene.add.image(0, 0, MinigameCPOrderMenuCellView.CELL_BG_KEY + 'white')
        this.cellIcon = this.scene.add
            .image(0, 0, 'minigame-menu-cell-icon-secret')
            .setSize(80, 80)
            .setDisplaySize(80, 80)
    }

    private setupCellMobile(): void {
        this.cellBg = this.scene.add
            .image(0, 0, MinigameCPOrderMenuCellView.CELL_BG_KEY + 'white')
            .setSize(70, 70)
            .setDisplaySize(70, 70)
        this.cellIcon = this.scene.add
            .image(0, 0, 'minigame-menu-cell-icon-secret')
            .setSize(62, 62)
            .setDisplaySize(62, 62)
    }

    private setOnClickAction(): void {
        this.cellButton.onClick(() => {
            //TODO: Check Minigame State Is Game Start
            this.minigamePod.setCurrentClickedCellId(this.cellId)
        })
    }

    private createOnClickTween(): void {
        this.onClickTween = this.scene.add.tween({
            targets: this.cellIcon,
            duration: 300,
            ease: 'cubic.inout',
            props: { scale: { from: this.cellIcon.scale, to: 0 } },
            yoyo: true,
            repeat: 0,
            persist: true,
            paused: true,
            onStart: () => {
                this.isTweening = true
            },
            onYoyo: () => {
                if (!this.isIconChanged) {
                    this.updateIconCallback()
                    this.isIconChanged = true
                }
            },
            onComplete: () => {
                this.isTweening = false
                this.isIconChanged = false
            },
        })
    }
}
