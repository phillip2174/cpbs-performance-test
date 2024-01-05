import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { PodProvider } from '../pod/PodProvider'
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage'

export class TownUICircleButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    public static readonly BUTTON_ICON_DEFAULT_SCALE: number = 1

    private backgroundButton: Button

    private buttonIcon: CircleMaskImage
    private buttonNotificationIcon: GameObjects.Image

    private onHoverButtonIconTween: Tweens.Tween
    private onLeaveButtonIconTween: Tweens.Tween

    private callback: Function
    private holdCallback: Function

    private isInteractable: boolean = true
    private isUseDefault: boolean = true

    private buttonType: TownUIButtonType

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, iconKey: string, buttonType?: TownUIButtonType): void {
        this.buttonType = buttonType
        this.buttonIcon = this.scene.add
            .rexCircleMaskImage(0, 0, iconKey + TownUICircleButtonView.ICON_IMAGE_KEY, {
                maskType: buttonType == TownUIButtonType.UserProfile ? 0 : null,
            })
            .setOrigin(0.5)

        switch (buttonType) {
            case TownUIButtonType.Zoom:
                this.backgroundButton = new Button(this.scene, 0, 0, 40, 40, 'zoom-circle-button-bg', 0)
                this.add([this.backgroundButton, this.buttonIcon])
                break
            case TownUIButtonType.MainMenu:
                this.buttonIcon.setPosition(0, -2).setDisplaySize(38, 38)
                break
            case TownUIButtonType.MenuGroup:
                this.buttonIcon.setPosition(0, -2).setScale(0.65)
                break
            case TownUIButtonType.UserProfile:
                this.buttonIcon.setPosition(1, DeviceChecker.instance.isDesktop() ? -2 : -1)
                if (iconKey == 'user-profile-default') {
                    this.isUseDefault = true
                    this.buttonIcon.setScale(1)
                } else {
                    this.isUseDefault = false
                    this.buttonIcon.setScale(0.04)
                }
                break
            default:
                break
        }

        if (buttonType != TownUIButtonType.Zoom) {
            this.backgroundButton = new Button(this.scene, 0, 0, 48, 48, 'ui-circle-button-bg')
            this.buttonNotificationIcon = this.scene.add
                .image(15, -15, 'button-notification')
                .setOrigin(0.5)
                .setScale(0.8)
                .setVisible(false)

            this.add([this.backgroundButton, this.buttonIcon, this.buttonNotificationIcon])
        }

        this.setPosition(x, y)

        if (DeviceChecker.instance.isDesktop()) {
            this.createHoverLeaveTweens()
            this.CheckHoverOnButton()
        }

        this.addButtonClickListener()
    }

    public onClick(callback: Function, holdCallback: Function = null): void {
        this.callback = callback
        this.holdCallback = () => {
            PodProvider.instance.cameraControlPod.setIsHoldingButton(true)
        }
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
                    from: this.buttonIcon.scale,
                    to:
                        this.buttonIcon.scale +
                        (this.buttonType == TownUIButtonType.UserProfile ? (this.isUseDefault ? 0.15 : 0.0075) : 0.15),
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
                    from:
                        this.buttonIcon.scale +
                        (this.buttonType == TownUIButtonType.UserProfile ? (this.isUseDefault ? 0.15 : 0.0075) : 0.15),
                    to: this.buttonIcon.scale,
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
        this.backgroundButton.onClick(
            () => {
                PodProvider.instance.cameraControlPod.setIsHoldingButton(false)
                if (this.callback != undefined || this.callback != null) {
                    this.callback()
                }
            },
            () => {
                if (this.holdCallback != undefined || this.holdCallback != null) {
                    this.holdCallback()
                }
            }
        )
    }
}
