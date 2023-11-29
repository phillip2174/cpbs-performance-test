import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { PodProvider } from '../../pod/PodProvider'
import { SceneState } from '../../../scenes/SceneState'
import { APILoadingManager } from '../../api-loading/APILoadingManager'
import { AudioManager } from '../../Audio/AudioManager'

export class MinigameSelectCellView extends GameObjects.Container {
    private minigameBackground: GameObjects.Image
    private logoIconMinigame: GameObjects.Image
    private playButton: Button

    private isDesktop: boolean = false

    private audioManager: AudioManager

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)

        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
    }

    public doInit(miniGameID: number) {
        this.audioManager = PodProvider.instance.audioManager

        this.minigameBackground = this.scene.add.image(0, 0, `minigame-${miniGameID}-select-bg`)
        this.logoIconMinigame = this.scene.add.image(
            0,
            -this.minigameBackground.height / 2 + (this.isDesktop ? 55 : 70),
            `minigame-${miniGameID}-logo`
        )

        this.playButton = this.createButton(179, 48, 'minigame-play-button', 'Play Now!', 'play-icon')

        if (this.isDesktop) {
            this.logoIconMinigame.setScale(0.7)
            this.playButton.setPosition(0, this.minigameBackground.height / 2 - 45)
        } else {
            this.minigameBackground.setScale(0.9)
            this.logoIconMinigame.setScale(0.58)
            this.playButton.setPosition(0, this.minigameBackground.height / 2 - 67)
        }

        this.playButton.onClick(() => {
            APILoadingManager.instance.showSceneLoading(PodProvider.instance.splashPod.launchScene)
            switch (miniGameID) {
                case 1:
                    PodProvider.instance.splashPod.setLaunchScene(SceneState.MinigameCPPuzzle)
                    break
                case 2:
                    PodProvider.instance.splashPod.setLaunchScene(SceneState.MinigameCPOrder)
                    break
            }
            this.scene.scene.stop('TownScene')
            this.scene.scene.stop('CityUIScene')
            this.scene.scene.start(`SplashLoaddingScene`)

            this.audioManager.stopBGMSound()
        })

        this.add([this.minigameBackground, this.logoIconMinigame, this.playButton])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        iconKey?: string,
        offset?: number
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 20,
            rightWidth: 20,
            topHeight: 1,
            bottomHeight: 1,
            safeAreaOffset: 0,
        })

        button.setTextStyle({
            fontFamily: 'DB_HeaventRounded_Bd',
            fill: 'white',
            fontSize: 28,
        })

        button.setTextPosition(-button.width / 2 + button.label.width / 2 + 25, 1)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(button.width / 2 - icon.width / 2 - 22, -1)
            button.add(icon)
        }

        return button
    }
}
