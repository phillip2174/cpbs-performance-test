import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TownUIButtonType } from './Type/TownUIButtonType'

export class TownUICircleButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    public static readonly BUTTON_ICON_DEFAULT_SCALE: number = 1
    public static readonly BUTTON_ICON_MAX_SCALE: number = 1.15
    public static readonly BUTTON_ICON_MIN_SCALE: number = 0.7

    private backgroundButton: Button

    private buttonIcon: GameObjects.Image
    private buttonNotificationIcon: GameObjects.Image

    private onHoverButtonIconTween: Tweens.Tween
    private onLeaveButtonIconTween: Tweens.Tween

    private callback: Function
    private holdCallback: Function

    private isInteractable: boolean = true

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, iconKey: string, buttonType?: TownUIButtonType): void {
        this.buttonIcon = this.scene.add.image(0, 0, iconKey + TownUICircleButtonView.ICON_IMAGE_KEY).setOrigin(0.5)

        if (buttonType == TownUIButtonType.Zoom) {
            this.backgroundButton = new Button(this.scene, 0, 0, 40, 40, 'zoom-circle-button-bg', 0)
            this.add([this.backgroundButton, this.buttonIcon])
        } else {
            if (buttonType == TownUIButtonType.MenuGroup) {
                this.buttonIcon.setPosition(0, -2).setScale(0.65)
            } else if (buttonType == TownUIButtonType.CPCity) {
                this.buttonIcon.setPosition(0, -2).setScale(0.45)
            }

            this.backgroundButton = new Button(this.scene, 0, 0, 48, 48, 'ui-circle-button-bg')
            this.buttonNotificationIcon = this.scene.add
                .image(15, -15, 'button-notification')
                .setOrigin(0.5)
                .setScale(0.8)
                .setVisible(false)

            this.add([this.backgroundButton, this.buttonIcon, this.buttonNotificationIcon])
        }

        this.setPosition(x, y)

        if (this.scene.sys.game.device.os.desktop) {
            this.createHoverLeaveTweens()
            this.CheckHoverOnButton()
        }

        this.addButtonClickListener()
    }

    public onClick(callback: Function, holdCallback: Function = null): void {
        this.callback = callback
        this.holdCallback = holdCallback
    }

    public setInteractable(isInteractable: boolean): void {
        this.isInteractable = isInteractable
        if (this.isInteractable) {
            this.backgroundButton.background.clearTint()
            this.backgroundButton.setCanInteract(true)
        } else {
            this.backgroundButton.background.setTint(0xa9a9a9).tintFill = true
            this.backgroundButton.setCanInteract(false)
        }
    }

    private createHoverLeaveTweens(): void {
        this.onHoverButtonIconTween = this.scene.add.tween({
            targets: this.buttonIcon,
            duration: 300,
            ease: 'cubic.inout',
            repeat: 0,
            yoyo: false,
            props: {
                scale: {
                    from: TownUICircleButtonView.BUTTON_ICON_DEFAULT_SCALE,
                    to: TownUICircleButtonView.BUTTON_ICON_MAX_SCALE,
                },
            },
            persist: true,
            paused: true,
        })

        this.onLeaveButtonIconTween = this.scene.add.tween({
            targets: this.buttonIcon,
            duration: 300,
            ease: 'cubic.inout',
            repeat: 0,
            yoyo: false,
            props: {
                scale: {
                    from: TownUICircleButtonView.BUTTON_ICON_MAX_SCALE,
                    to: TownUICircleButtonView.BUTTON_ICON_DEFAULT_SCALE,
                },
            },
            persist: true,
            paused: true,
        })
    }

    private CheckHoverOnButton(): void {
        this.backgroundButton.on('pointerover', () => {
            this.onHoverButton()
        })

        this.backgroundButton.on('pointerout', () => {
            this.onLeaveButton()
        })
    }

    private onHoverButton(): void {
        if (this.isInteractable) {
            this.onHoverButtonIconTween?.resume()
            this.onHoverButtonIconTween?.restart()
        } else {
            this.onHoverButtonIconTween?.pause()
        }
    }

    private onLeaveButton(): void {
        if (this.buttonIcon.scale != TownUICircleButtonView.BUTTON_ICON_DEFAULT_SCALE && this.isInteractable) {
            this.onLeaveButtonIconTween?.resume()
            this.onLeaveButtonIconTween?.restart()
        } else {
            this.onLeaveButtonIconTween?.pause()
        }
    }

    private addButtonClickListener(): void {
        this.backgroundButton.onClick(() => {
            if (this.callback != null) this.callback()
        })
    }
}
