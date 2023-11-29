import { GameObjects, Tweens } from 'phaser'
import { AccessibilityButtonGroupView } from './../Town/AccessibilityButtonGroupView'
import { PodProvider } from '../pod/PodProvider'
import { AudioManager } from '../Audio/AudioManager'

export class DimButton extends GameObjects.Container {
    private dimBackground: GameObjects.Rectangle
    private dimSprite: GameObjects.Image

    private accessibilityButtonGroupView: AccessibilityButtonGroupView

    private isPointerDown: boolean = false
    private isCanInteract: boolean = true
    private isShowSprite: boolean = false

    private callBack: Function

    private audioManager: AudioManager

    private onOpenRectTween: Tweens.Tween
    private onCloseRectTween: Tweens.Tween

    constructor(
        scene: Phaser.Scene,
        dimValue: number = 0.5,
        isShowSprite: boolean = false,
        keyImage: string = 'kitchen-bg'
    ) {
        super(scene)
        this.audioManager = PodProvider.instance.audioManager

        this.isShowSprite = isShowSprite
        this.createUI(dimValue, isShowSprite, keyImage)
        this.createAction()
        this.createTween()
    }

    createUI(dimValue: number, isShowSprite: boolean, keyImage: string) {
        if (isShowSprite) {
            if (this.scene.sys.game.device.os.desktop) {
                this.dimSprite = this.scene.add
                    .image(0, 0, keyImage)
                    .setOrigin(0.5)
                    .setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height)
                this.add(this.dimSprite)
            } else {
                this.dimSprite = this.scene.add
                    .image(0, 0, keyImage)
                    .setOrigin(0.5)
                    .setDisplaySize(2291, this.scene.cameras.main.height)
                this.dimSprite.x = this.dimSprite.x + this.scene.cameras.main.width / 1.1

                this.accessibilityButtonGroupView = new AccessibilityButtonGroupView(this.scene)
                this.accessibilityButtonGroupView.doInit(0, 0)

                this.add([this.dimSprite, this.accessibilityButtonGroupView])
            }
        } else {
            this.dimBackground = this.scene.add
                .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, dimValue)
                .setOrigin(0.5)
            this.add(this.dimBackground)
        }
    }

    createAction() {
        if (this.isShowSprite) {
            this.dimSprite?.setInteractive().on('pointerdown', () => {
                if (!this.isCanInteract) return
                this.audioManager.playSFXSound('negative_click_sfx')
                this.isPointerDown = true
            })

            this.dimSprite?.setInteractive().on('pointerup', () => {
                if (!this.isCanInteract) return
                if (this.isPointerDown) {
                    this.callBack()

                    this.isPointerDown = false
                }
            })
        } else {
            this.dimBackground?.setInteractive().on('pointerdown', () => {
                if (!this.isCanInteract) return
                this.audioManager.playSFXSound('negative_click_sfx')
                this.isPointerDown = true
            })

            this.dimBackground?.setInteractive().on('pointerup', () => {
                if (!this.isCanInteract) return
                if (this.isPointerDown) {
                    this.callBack()

                    this.isPointerDown = false
                }
            })
        }
    }

    createTween() {
        if (this.isShowSprite) {
            this.onOpenRectTween = this.scene.add.tween({
                targets: this,
                duration: 300,
                props: {
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                },
                ease: 'Sine.easeInOut',
                persist: true,
                paused: true,

                onComplete: () => {},
            })

            this.onCloseRectTween = this.scene.add.tween({
                targets: this,
                duration: 300,
                props: {
                    alpha: {
                        from: 1,
                        to: 0,
                    },
                },
                ease: 'Sine.easeInOut',
                persist: true,
                paused: true,
                onComplete: () => {},
            })
        } else {
            this.onOpenRectTween = this.scene.add.tween({
                targets: this.dimBackground,
                duration: 300,
                props: {
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                },
                ease: 'Sine.easeInOut',
                persist: true,
                paused: true,

                onComplete: () => {},
            })

            this.onCloseRectTween = this.scene.add.tween({
                targets: this.dimBackground,
                duration: 300,
                props: {
                    alpha: {
                        from: 1,
                        to: 0,
                    },
                },
                ease: 'Sine.easeInOut',
                persist: true,
                paused: true,
                onComplete: () => {},
            })
        }
    }

    public setActiveDim(isActive: boolean, isTween: boolean = true) {
        if (isTween) {
            this.setVisible(true)
            if (isActive) {
                this.onCloseRectTween?.pause()
                this.onOpenRectTween?.restart()
                this.alpha = 1
            } else {
                this.onOpenRectTween?.pause()
                this.onCloseRectTween?.restart()
                this.alpha = 0
            }
        } else {
            this.setVisible(isActive)
            if (isActive) {
                this.alpha = 1
            } else {
                this.alpha = 0
            }
        }
    }

    public onClick(callBack: Function) {
        this.callBack = callBack
    }

    public setCanInteract(isCanInteract: boolean) {
        this.isCanInteract = isCanInteract
    }
}
