import { Pod } from './../../plugins/objects/Pod'
import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { Button } from '../../button/Button'
import { MinigameScenePod } from '../MinigameScenePod'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { CPPointUIButtonView } from '../../Town/CPPointUIButtonView'
import { MinigameState } from '../MinigameState'

export class MinigameStartMenuUIView extends GameObjects.Container {
    private startButton: Button
    private subBg: GameObjects.Image
    private logo: GameObjects.Image
    private group: GameObjects.Group
    private scenePod: MinigameScenePod
    private isDesktop: boolean
    private minigameNumber: number

    constructor(scene: Scene) {
        super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY)
        GameObjectConstructor(scene, this)
    }

    public doInit(minigameNumber: number, pod: MinigameScenePod): void {
        this.scenePod = pod
        this.minigameNumber = minigameNumber
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.group = this.scene.add.group()
        this.setUpImage()
        this.setUpButton()

        if (!this.isDesktop) {
            this.setScale(0.73)
        }

        this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.StartMenu) this.showUI()
            else this.hideUI()
        })
    }

    public showUI() {
        this.setActive(true)
        this.setVisible(true)
    }

    public hideUI() {
        this.setActive(false)
        this.setVisible(false)
    }

    private setUpImage() {
        this.subBg = this.scene.add.image(0, 20, `minigame-${this.minigameNumber}-sub-bg`)
        this.add(this.subBg)
        this.logo = this.scene.add.image(0, -35, `minigame-${this.minigameNumber}-logo`)
        this.add(this.logo)
    }

    private setUpButton() {
        this.startButton = new Button(this.scene, 0, 180, 1, 64, '', 1000, 'PLAY')
        this.startButton.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'minigame-start-button',
            leftWidth: 29,
            rightWidth: 27,
            topHeight: 30,
            bottomHeight: 30,
            safeAreaOffset: 0,
        })

        this.startButton.setTextStyle({
            fontFamily: 'DB_HeaventRounded',
            fill: 'white',
            fontSize: 36,
        })

        this.startButton.setButtonSize(this.startButton.label.width + 100, this.startButton.displayHeight)
        this.startButton.setTextPosition(-this.startButton.width / 2 + this.startButton.label.width / 2 + 35, 0)
        let icon = this.scene.add.image(this.startButton.label.width / 2 + 10, 0, 'minigame-button-icon-play')

        this.startButton.add(icon)

        this.add(this.startButton)
        this.startButton.onClick(() => {
            this.scenePod.startGame().subscribe(_ => {
                this.hideUI()
                this.scenePod.sceneState.next(MinigameState.BeforeStart)
            })
        })
    }
}
