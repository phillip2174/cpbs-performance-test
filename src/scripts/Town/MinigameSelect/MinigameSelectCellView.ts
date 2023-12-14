import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { Button } from '../../button/Button'
import { PodProvider } from '../../pod/PodProvider'
import { SceneState } from '../../../scenes/SceneState'
import { APILoadingManager } from '../../api-loading/APILoadingManager'
import { AudioManager } from '../../Audio/AudioManager'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class MinigameSelectCellView extends GameObjects.Container {
    private minigameBackground: GameObjects.Image
    private logoIconMinigame: GameObjects.Image
    private playButton: Button
    private iconPlayImage: GameObjects.Image

    private isDesktop: boolean = false

    private audioManager: AudioManager
    private onHoverButtonBackground: Tweens.Tween
    private onLeaveButtonBackground: Tweens.Tween

    private onHoverButtonIcon: Tweens.TweenChain
    private onLeaveButtonIcon: Tweens.TweenChain

    private onHoverButtonText: Tweens.TweenChain
    private onLeaveButtonText: Tweens.TweenChain

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
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

        if (this.isDesktop) {
            this.playButton.on('pointerover', () => {
                this.onHoverButton()
            })

            this.playButton.on('pointerout', () => {
                this.onLeaveButton()
            })
        }

        this.add([this.minigameBackground, this.logoIconMinigame, this.playButton])

        this.width = this.getBounds().width
        this.height = this.getBounds().height

        if (this.isDesktop) {
            this.createTween()
        }
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
            this.iconPlayImage = this.scene.add.image(0, 0, iconKey)
            this.iconPlayImage.setPosition(button.width / 2 - this.iconPlayImage.width / 2 - 22, -1)
            button.add(this.iconPlayImage)
        }

        return button
    }

    private onHoverButton(): void {
        this.onLeaveButtonBackground?.pause()
        this.onLeaveButtonIcon?.pause()
        this.onLeaveButtonText?.pause()

        this.onHoverButtonBackground?.restart()
        this.onHoverButtonIcon?.restart()
        this.onHoverButtonText?.restart()
    }

    private onLeaveButton(): void {
        this.onHoverButtonBackground?.pause()
        this.onHoverButtonIcon?.pause()
        this.onHoverButtonText?.pause()

        this.onLeaveButtonBackground?.restart()
        this.onLeaveButtonIcon?.restart()
        this.onLeaveButtonText?.restart()
    }

    private createTween() {
        this.onHoverButtonBackground = this.scene.add.tween({
            targets: this.playButton.backgroundSlice,
            duration: 0,
            props: {
                texture: { value: 'minigame-play-button-tween' },
            },
            ease: 'cubic.inout',
            paused: true,
            persist: true,
        })

        this.onLeaveButtonBackground = this.scene.add.tween({
            targets: this.playButton.backgroundSlice,
            duration: 0,
            props: {
                texture: { value: 'minigame-play-button' },
            },
            ease: 'cubic.inout',
            paused: true,
            persist: true,
        })

        this.onLeaveButtonIcon = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.iconPlayImage,
                    duration: 320,
                    props: { x: { from: this.iconPlayImage.x - 100, to: this.iconPlayImage.x + 15 } },
                    ease: 'Expo.easeOut',
                },
                {
                    targets: this.iconPlayImage,
                    duration: 230,
                    props: { x: { from: this.iconPlayImage.x + 15, to: this.iconPlayImage.x - 2 } },
                    ease: 'Cubic.easeOut',
                },

                {
                    targets: this.iconPlayImage,
                    duration: 200,
                    props: { x: { from: this.iconPlayImage.x - 2, to: this.iconPlayImage.x + 1 } },
                    ease: 'Expo.easeOut',
                },

                {
                    targets: this.iconPlayImage,
                    duration: 100,
                    props: { x: { from: this.iconPlayImage.x + 1, to: this.iconPlayImage.x } },
                    ease: 'Expo.easeOut',
                },
            ],
            paused: true,
            persist: true,
        })

        this.onHoverButtonIcon = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.iconPlayImage,
                    duration: 320,
                    props: { x: { from: this.iconPlayImage.x, to: this.iconPlayImage.x - 118 } },
                    ease: 'Expo.easeOut',
                },
                {
                    targets: this.iconPlayImage,
                    duration: 230,
                    props: { x: { from: this.iconPlayImage.x - 118, to: this.iconPlayImage.x - 98 } },
                    ease: 'Cubic.easeOut',
                },
                {
                    targets: this.iconPlayImage,
                    duration: 200,
                    props: { x: { from: this.iconPlayImage.x - 98, to: this.iconPlayImage.x - 101 } },
                    ease: 'Expo.easeOut',
                },
                {
                    targets: this.iconPlayImage,
                    duration: 100,
                    props: { x: { from: this.iconPlayImage.x - 101, to: this.iconPlayImage.x - 100 } },
                    ease: 'Expo.easeOut',
                },
            ],
            paused: true,
            persist: true,
        })

        this.onHoverButtonText = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.playButton.label,
                    duration: 300,
                    props: { x: { from: this.playButton.label.x, to: this.playButton.label.x + 45 } },
                    ease: 'Expo.easeOut',
                },
                {
                    targets: this.playButton.label,
                    duration: 100,
                    props: { x: { from: this.playButton.label.x + 45, to: this.playButton.label.x + 40 } },
                    ease: 'Cubic.easeOut',
                },
            ],
            paused: true,
            persist: true,
        })

        this.onLeaveButtonText = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.playButton.label,
                    duration: 300,
                    props: { x: { from: this.playButton.label.x + 40, to: this.playButton.label.x - 5 } },
                    ease: 'Expo.easeOut',
                },
                {
                    targets: this.playButton.label,
                    duration: 100,
                    props: { x: { from: this.playButton.label.x - 5, to: this.playButton.label.x } },
                    ease: 'Cubic.easeOut',
                },
            ],
            paused: true,
            persist: true,
        })
    }
}
