import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription } from 'rxjs'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownUIPod } from './Pod/TownUIPod'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'
import { ButtonNotificationView } from './ButtonNotificationView'
import { TownUIButtonType } from './Type/TownUIButtonType'

export class TownUIButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    public static readonly BUTTON_ICON_TWEEN_EASE: string = 'linear'
    public static readonly BUTTON_ICON_MAX_SCALE: number = 1.15
    public static readonly BUTTON_ICON_MIN_SCALE: number = 0.7
    public static readonly BUTTON_ICON_ROTATE_DEGREE: number = 8
    public static readonly BUTTON_TEXT_DEFAULT_SIZE: number = 16
    public static readonly BUTTON_TEXT_MAX_SIZE: number = 18
    public static readonly BUTTON_TEXT_MIN_SIZE: number = 14

    private backgroundButton: Button

    private buttonIcon: GameObjects.Image
    private buttonNotification: ButtonNotificationView

    private buttonText: GameObjects.Text

    private buttonType: TownUIButtonType

    private onHoverButtonIconTween: Tweens.TweenChain
    private onHoverButtonTextTween: Tweens.Tween
    private onLeaveButtonIconTween: Tweens.TweenChain
    private onLeaveButtonTextTween: Tweens.Tween
    private onClickUpButtonIconTween: Tweens.Tween
    private onClickUpButtonTextTween: Tweens.Tween
    private onHoverNotificationIconTween: Tweens.Tween
    private onLeaveNotificationIconTween: Tweens.Tween

    private callback: Function
    private holdCallback: Function

    private clickDelay: number

    private isUseMobileBg: boolean = false
    private isOnClickDelay: boolean = false
    private isClick: boolean = false
    private isSelected: boolean = false
    private isActiveSelectedState: boolean = false

    private townUIButtonNotificationManager: TownUIButtonNotificationManager
    private townUIPod: TownUIPod

    private menuGroupNotificationDisposable: Subscription
    private dailyLoginNotificationDisposable: Subscription
    private minigameNotificationDisposable: Subscription
    private cookingNotificationDisposable: Subscription
    private inventoryNotificationDisposable: Subscription
    private collectionsNotificationDisposable: Subscription
    private notificationNotificationDisposable: Subscription
    private uiStateDisposable: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(
        x: number,
        y: number,
        iconKey: string,
        buttonType: TownUIButtonType,
        buttonText?: string,
        clickDelay: number = 1000,
        isUseMobileBg: boolean = false,
        isActiveSelectedState: boolean = true
    ): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
        this.buttonType = buttonType
        this.clickDelay = clickDelay
        this.isUseMobileBg = isUseMobileBg
        this.isActiveSelectedState = isActiveSelectedState

        if (this.isButtonTypeWithoutText()) {
            this.setupButtonWithoutText(iconKey)
        } else if (this.buttonType == TownUIButtonType.Close) {
            this.setupCloseButton(iconKey, buttonText)
        } else {
            this.setupButtonWithText(iconKey, buttonText)
        }

        this.setPosition(x, y)

        if (this.scene.sys.game.device.os.desktop) {
            this.createHoverLeaveTweens()
            this.checkHoverOnButton()
        }

        this.createButtonClickTweens()
        this.addButtonClickListeners()
        this.setupUIButtonSubscribe(this.buttonType)
    }

    public onClick(callback: Function, holdCallback: Function = null): void {
        this.callback = callback
        this.holdCallback = holdCallback
    }

    public showNotification(): void {
        this.buttonNotification?.setNotificationActive(true)
    }

    public hideNotification(): void {
        this.buttonNotification?.setNotificationActive(false)
    }

    public setButtonIcon(iconKey: string): void {
        this.buttonIcon.setTexture(iconKey + TownUIButtonView.ICON_IMAGE_KEY)
    }

    private isButtonTypeWithoutText(): boolean {
        return (
            this.buttonType == TownUIButtonType.Notification ||
            this.buttonType == TownUIButtonType.Guide ||
            this.buttonType == TownUIButtonType.SoundEffect ||
            this.buttonType == TownUIButtonType.BGMusic
        )
    }

    private checkHoverOnButton(): void {
        this.backgroundButton.on('pointerover', () => {
            this.onHoverButton()
        })

        this.backgroundButton.on('pointerout', () => {
            this.onLeaveButton()
        })
    }

    private createHoverLeaveTweens(): void {
        this.onHoverButtonIconTween = this.scene.tweens.chain({
            targets: this.buttonIcon,
            tweens: [
                {
                    duration: 150,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale,
                            to: this.buttonIcon.scale + 0.15,
                        },
                        angle: {
                            from: this.buttonIcon.angle,
                            to: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                        },
                    },
                },
                {
                    duration: 200,
                    delay: 50,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.15,
                            to: this.buttonIcon.scale + 0.075,
                        },
                        angle: {
                            from: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                            to: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE - 5,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.075,
                            to: this.buttonIcon.scale + 0.15,
                        },
                        angle: {
                            from: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE - 5,
                            to: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.15,
                            to: this.buttonIcon.scale + 0.13,
                        },
                        angle: {
                            from: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                            to: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE - 2.5,
                        },
                    },
                },
                {
                    duration: 100,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.13,
                            to: this.buttonIcon.scale + 0.15,
                        },
                        angle: {
                            from: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE - 2.5,
                            to: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        this.onLeaveButtonIconTween = this.scene.tweens.chain({
            targets: this.buttonIcon,
            tweens: [
                {
                    duration: 150,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.15,
                            to: this.buttonIcon.scale,
                        },
                        angle: {
                            from: this.buttonIcon.angle + TownUIButtonView.BUTTON_ICON_ROTATE_DEGREE,
                            to: this.buttonIcon.angle,
                        },
                    },
                },
                {
                    duration: 200,
                    delay: 50,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale,
                            to: this.buttonIcon.scale + 0.075,
                        },
                        angle: {
                            from: this.buttonIcon.angle,
                            to: this.buttonIcon.angle + 5,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.075,
                            to: this.buttonIcon.scale,
                        },
                        angle: {
                            from: this.buttonIcon.angle + 5,
                            to: this.buttonIcon.angle,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale,
                            to: this.buttonIcon.scale + 0.02,
                        },
                        angle: {
                            from: this.buttonIcon.angle,
                            to: this.buttonIcon.angle + 2.5,
                        },
                    },
                },
                {
                    duration: 100,
                    ease: TownUIButtonView.BUTTON_ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.buttonIcon.scale + 0.02,
                            to: this.buttonIcon.scale,
                        },
                        angle: {
                            from: this.buttonIcon.angle + 2.5,
                            to: this.buttonIcon.angle,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        if (this.buttonText) {
            this.onHoverButtonTextTween = this.scene.tweens.addCounter({
                from: TownUIButtonView.BUTTON_TEXT_DEFAULT_SIZE,
                to: TownUIButtonView.BUTTON_TEXT_MAX_SIZE,
                duration: 300,
                ease: 'cubic.inout',
                onUpdate: (tween) => {
                    this.buttonText.setStyle({ fill: '#EE843C', fontSize: tween.getValue() })
                },
                persist: true,
            })

            this.onLeaveButtonTextTween = this.scene.tweens.addCounter({
                from: TownUIButtonView.BUTTON_TEXT_MAX_SIZE,
                to: TownUIButtonView.BUTTON_TEXT_DEFAULT_SIZE,
                duration: 300,
                ease: 'cubic.inout',
                onUpdate: (tween) => {
                    if (!this.isSelected) {
                        this.buttonText.setColor('#585858')
                    }
                    this.buttonText.setStyle({ fontSize: tween.getValue() })
                },
                persist: true,
            })
        }
    }

    private onHoverButton(): void {
        this.onLeaveButtonIconTween?.pause()
        this.onLeaveButtonTextTween?.pause()
        this.onHoverButtonIconTween?.restart()
        this.onHoverButtonTextTween?.restart()
        this.buttonNotification?.playOnHoverTweens()
        this.isClick = false
    }

    private onLeaveButton(): void {
        this.onHoverButtonIconTween?.pause()
        this.onHoverButtonTextTween?.pause()
        this.onLeaveButtonIconTween?.restart()
        if (!this.isClick) this.onLeaveButtonTextTween?.restart()
        this.buttonNotification?.playOnLeaveTweens()
    }

    private createButtonClickTweens(): void {
        this.onClickUpButtonIconTween = this.scene.tweens.add({
            targets:
                this.buttonNotification == undefined ? this.buttonIcon : [this.buttonIcon, this.buttonNotification],
            duration: 300,
            ease: 'cubic.inout',
            repeat: 0,
            yoyo: false,
            props: {
                scale: {
                    from: TownUIButtonView.BUTTON_ICON_MIN_SCALE,
                    to: this.buttonIcon.scale,
                },
            },
            persist: true,
        })

        if (this.buttonText) {
            this.onClickUpButtonTextTween = this.scene.tweens.addCounter({
                from: TownUIButtonView.BUTTON_TEXT_MIN_SIZE,
                to: TownUIButtonView.BUTTON_TEXT_DEFAULT_SIZE,
                duration: 300,
                ease: 'cubic.inout',
                onUpdate: (tween) => {
                    this.buttonText?.setStyle({ fontSize: tween.getValue() })
                },
                persist: true,
            })
        }
    }

    private addButtonClickListeners(): void {
        this.backgroundButton.onClick(
            () => {
                if (this.callback != undefined || this.callback != null) {
                    this.callback()
                }
                this.onClickUpButtonIconTween?.restart()
                this.onClickUpButtonTextTween?.restart()

                this.isClick = true
            },
            () => {
                if (this.holdCallback != undefined || this.holdCallback != null) {
                    this.holdCallback()
                }
            }
        )
    }

    private checkButtonIsUpdate(isUpdate: boolean): void {
        if (isUpdate) {
            this.showNotification()
        } else {
            this.hideNotification()
        }
    }

    private setupUIButtonSubscribe(buttonType: TownUIButtonType): void {
        switch (buttonType) {
            case TownUIButtonType.DailyLogin:
                this.dailyLoginNotificationDisposable =
                    this.townUIButtonNotificationManager.dailyLoginIsUpdate.subscribe((isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    })
                break
            case TownUIButtonType.Minigame:
                this.minigameNotificationDisposable = this.townUIButtonNotificationManager.minigameIsUpdate.subscribe(
                    (isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    }
                )
                break
            case TownUIButtonType.Cooking:
                this.cookingNotificationDisposable = this.townUIButtonNotificationManager.cookingIsUpdate.subscribe(
                    (isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    }
                )
                break
            case TownUIButtonType.Inventory:
                this.inventoryNotificationDisposable = this.townUIButtonNotificationManager.inventoryIsUpdate.subscribe(
                    (isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    }
                )
                break
            case TownUIButtonType.Collection:
                this.collectionsNotificationDisposable =
                    this.townUIButtonNotificationManager.collectionsIsUpdate.subscribe((isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    })
                break
            case TownUIButtonType.Notification:
                this.notificationNotificationDisposable =
                    this.townUIButtonNotificationManager.notificationIsUpdate.subscribe((isUpdate) => {
                        this.checkButtonIsUpdate(isUpdate)
                    })
                break
        }
        if (this.isActiveSelectedState) {
            this.uiStateDisposable = this.townUIPod.townUIState.subscribe((state) => {
                if (
                    !this.buttonText ||
                    this.buttonType == TownUIButtonType.Close ||
                    this.buttonType == TownUIButtonType.MenuGroup
                )
                    return
                this.setButtonSelectState(state.toString() == this.buttonType.toString())
            })
        }
    }

    private setButtonSelectState(isSelected: boolean): void {
        this.isSelected = isSelected
        if (this.isSelected) {
            this.backgroundButton?.setBackgroundButtonTexture('ui-button-selected-bg')
            this.buttonText.setColor('#EE843C')
        } else {
            this.backgroundButton?.setBackgroundButtonTexture(
                this.isUseMobileBg ? 'ui-button-bg-mobile' : 'ui-button-bg-desktop'
            )
            this.buttonText.setColor('#585858')
        }
    }

    private setupMenuGroupButtonSubscribe(): void {
        this.menuGroupNotificationDisposable = this.townUIButtonNotificationManager.menuGroupIsUpdate.subscribe(
            (isUpdate) => {
                this.checkButtonIsUpdate(isUpdate)
            }
        )
    }

    private setupButtonWithText(iconKey: string, buttonText: string): void {
        this.buttonNotification = new ButtonNotificationView(this.scene)
        this.buttonIcon = this.scene.add.image(0, 0, iconKey + TownUIButtonView.ICON_IMAGE_KEY).setOrigin(0.5)
        this.buttonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(buttonText)
            .setOrigin(0.5)

        if (this.isUseMobileBg) {
            this.backgroundButton = new Button(this.scene, 0, 0, 64, 64, 'ui-button-bg-mobile', this.clickDelay)
            this.buttonNotification.doInit(20, -20)
            this.buttonIcon.setPosition(0, -17)
            this.buttonText.setPosition(-0.5, 13).setStyle({ fill: '#585858', fontSize: 13 })
        } else {
            this.backgroundButton = new Button(this.scene, 0, 0, 101, 92, 'ui-button-bg-desktop', this.clickDelay)
            this.buttonNotification.doInit(35, -34)
            this.buttonIcon.setPosition(0, -27)
            this.buttonText.setPosition(-0.5, 23).setStyle({ fill: '#585858', fontSize: 16 })
            this.setDepth(202)
        }

        this.add([this.backgroundButton, this.buttonIcon, this.buttonText, this.buttonNotification])
    }

    private setupCloseButton(iconKey: string, buttonText: string): void {
        this.backgroundButton = new Button(this.scene, 0, 0, 101, 92, 'close-button-bg', this.clickDelay)
        this.buttonIcon = this.scene.add.image(0, -13, iconKey + TownUIButtonView.ICON_IMAGE_KEY).setOrigin(0.5)
        this.buttonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(buttonText)
            .setOrigin(0.5)
            .setPosition(-0.5, 23)
            .setStyle({ fill: '#585858', fontSize: 16 })
        this.add([this.backgroundButton, this.buttonIcon, this.buttonText])
    }

    private setupButtonWithoutText(iconKey: string): void {
        this.buttonNotification = new ButtonNotificationView(this.scene)

        if (this.isUseMobileBg) {
            this.backgroundButton = new Button(this.scene, 0, 0, 64, 64, 'ui-button-bg-mobile', this.clickDelay)
            this.buttonNotification.doInit(20, -20)
        } else {
            this.backgroundButton = new Button(this.scene, 0, 0, 101, 92, 'ui-button-bg-desktop', this.clickDelay)
            this.buttonNotification.doInit(35, -34)
        }

        this.buttonIcon = this.scene.add
            .image(this.x, this.y - 2, iconKey + TownUIButtonView.ICON_IMAGE_KEY)
            .setOrigin(0.5)

        this.add([this.backgroundButton, this.buttonIcon, this.buttonNotification])
        this.setupMenuGroupButtonSubscribe()
    }
}
