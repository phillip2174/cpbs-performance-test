import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { MinigameState } from '../MinigameState'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameSuccessIndicatorView } from '../MinigameSuccessIndicatorView'
import { PodProvider } from '../../pod/PodProvider'
import { AudioManager } from '../../Audio/AudioManager'
import { Subscription, timer } from 'rxjs'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class MinigameCPOrderMenuCellView extends GameObjects.Container {
    public static readonly CELL_BG_KEY: string = 'minigame-menu-cell-bg-'
    public static readonly CELL_ICON_KEY: string = 'recipe-'

    private cellBg: GameObjects.Image
    private cellIcon: GameObjects.Image

    private cellButton: GameObjects.Rectangle

    private cellId: number
    private interactDelay: number = 650

    private successIndicatorView: MinigameSuccessIndicatorView

    private isDesktop: boolean
    private isTweening: boolean = false
    private isIconChanged: boolean = false
    private isOnInteractDelay: boolean = false

    private onClickTween: Tweens.Tween

    private updateIconCallback: Function

    private audioManager: AudioManager

    private scenePod: MinigameScenePod
    private minigamePod: MinigameCPOrderPod

    private interactDelaySubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(cellId: number): void {
        this.cellId = cellId
        this.scenePod = PodProvider.instance.minigameScenePod
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.audioManager = PodProvider.instance.audioManager
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.isDesktop ? this.setupCellDesktop() : this.setupCellMobile()
        this.cellButton = this.scene.add
            .rectangle(0, 0, this.cellBg.width, this.cellBg.height)
            .setOrigin(0.5)
            .setAlpha(0.01)
        this.successIndicatorView = new MinigameSuccessIndicatorView(this.scene)
        this.successIndicatorView.doInit()
        this.setOnClickAction()
        //this.createOnClickTween()
        this.add([this.cellBg, this.cellIcon, this.cellButton, this.successIndicatorView])
    }

    public setCellBg(colorKey: string): void {
        this.cellBg.setTexture(MinigameCPOrderMenuCellView.CELL_BG_KEY + colorKey)
    }

    public setCellIcon(iconKey: string): void {
        this.cellIcon.setTexture(MinigameCPOrderMenuCellView.CELL_ICON_KEY + iconKey)
    }

    public showSuccessIndicator(isCorrect: boolean): void {
        this.successIndicatorView?.playIndicatorTween(isCorrect)
        this.audioManager.playSFXSound('order_click_sfx')
    }

    public onStartGame(): void {
        this.cellBg.setTexture(MinigameCPOrderMenuCellView.CELL_BG_KEY + 'white')
        this.cellIcon.setTexture('minigame-menu-cell-icon-secret')
    }

    public playOnClickTween(callback: Function, isCorrect: boolean): void {
        this.updateIconCallback = callback
        if (!this.isTweening) {
            this.onClickTween?.restart()
            this.successIndicatorView?.playIndicatorTween(isCorrect)
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
        this.cellButton.setInteractive().on('pointerdown', () => {
            if (!this.checkIsCellClickable() || this.isOnInteractDelay) return
            this.minigamePod.setCurrentClickedCellId(this.cellId)
            this.isOnInteractDelay = true
            this.interactDelaySubscription = timer(this.interactDelay).subscribe((_) => {
                this.isOnInteractDelay = false
                this.interactDelaySubscription.unsubscribe()
            })
        })
    }

    private checkIsCellClickable(): boolean {
        return (
            this.scenePod.sceneState.value == MinigameState.GameStart &&
            !this.minigamePod.getIsTimerZero() &&
            this.minigamePod.isClickable
        )
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
