import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'
import { TownUIButtonType } from './Type/TownUIButtonType'

export class TownUIButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    public static readonly BUTTON_ICON_DEFAULT_SCALE: number = 1
    public static readonly BUTTON_ICON_MAX_SCALE: number = 1.3
    public static readonly BUTTON_ICON_MIN_SCALE: number = 0.7
    public static readonly BUTTON_TEXT_DEFAULT_SIZE: number = 16
    public static readonly BUTTON_TEXT_MAX_SIZE: number = 18
    public static readonly BUTTON_TEXT_MIN_SIZE: number = 14

    private backgroundButton: Button
    private buttonIcon: GameObjects.Image
    private buttonNotificationIcon: GameObjects.Image
    private buttonText: GameObjects.Text

    private buttonType: TownUIButtonType

    private onHoverButtonIconTween: Tweens.Tween
    private onHoverButtonTextTween: Tweens.Tween
    private onLeaveButtonIconTween: Tweens.Tween
    private onLeaveButtonTextTween: Tweens.Tween
    private onClickDownButtonIconTween: Tweens.Tween
    private onClickDownButtonTextTween: Tweens.Tween
    private onClickUpButtonIconTween: Tweens.Tween
    private onClickUpButtonTextTween: Tweens.Tween
    private onHoverNotificationIconTween: Tweens.Tween
    private onLeaveNotificationIconTween: Tweens.Tween

    private callback: Function
    private holdCallback: Function

    private clickDelay: number

    private isOnClickDelay: boolean = false
    private isClick: boolean = false

    private townUIButtonNotificationManager: TownUIButtonNotificationManager

    private menuGroupNotificationDisposable: Subscription
    private dailyLoginNotificationDisposable: Subscription
    private minigameNotificationDisposable: Subscription
    private cookingNotificationDisposable: Subscription
    private inventoryNotificationDisposable: Subscription
    private collectionsNotificationDisposable: Subscription
    private notificationNotificationDisposable: Subscription

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
        isUseMobileBg: boolean = false
    ): void {
        this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
        this.buttonType = buttonType
        this.clickDelay = clickDelay

        if (this.isButtonTypeWithoutText()) {
            this.setupButtonWithoutText(iconKey, isUseMobileBg)
        } else if (this.buttonType == TownUIButtonType.Close) {
            this.setupCloseButton(iconKey, buttonText)
        } else {
            this.setupButtonWithText(iconKey, buttonText, isUseMobileBg)
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
        this.buttonNotificationIcon.setActive(true)
        this.buttonNotificationIcon.setVisible(true)
    }

    public hideNotification(): void {
        this.buttonNotificationIcon.setActive(false)
        this.buttonNotificationIcon.setVisible(false)
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
        this.onHoverButtonIconTween = this.scene.add.tween({
            targets: this.buttonIcon,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: TownUIButtonView.BUTTON_ICON_DEFAULT_SCALE,
                    to: TownUIButtonView.BUTTON_ICON_MAX_SCALE,
                },
            },
            persist: true,
            paused: true,
        })

        this.onLeaveButtonIconTween = this.scene.add.tween({
            targets: this.buttonIcon,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: this.buttonIcon.scale,
                    to: this.buttonIcon.scale,
                },
            },
            persist: true,
            paused: true,
        })

        this.onHoverNotificationIconTween = this.scene.add.tween({
            targets: this.buttonNotificationIcon,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: this.buttonNotificationIcon.scale,
                    to: TownUIButtonView.BUTTON_ICON_MAX_SCALE,
                },
            },
            persist: true,
            paused: true,
        })

        this.onLeaveNotificationIconTween = this.scene.add.tween({
            targets: this.buttonNotificationIcon,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: this.buttonNotificationIcon.scale,
                    to: this.buttonNotificationIcon.scale,
                },
            },
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
                    this.buttonText.setStyle({ fill: '#585858', fontSize: tween.getValue() })
                },
                persist: true,
            })
        }
    }

    private onHoverButton(): void {
        this.onHoverButtonIconTween?.restart()
        this.onHoverNotificationIconTween?.restart()
        this.onHoverButtonTextTween?.restart()
        this.isClick = false
    }

    private onLeaveButton(): void {
        this.onLeaveButtonIconTween?.restart()
        this.onLeaveNotificationIconTween?.restart()
        if (!this.isClick) this.onLeaveButtonTextTween?.restart()
    }

    private createButtonClickTweens(): void {
        this.onClickDownButtonIconTween = this.scene.tweens.add({
            targets:
                this.buttonNotificationIcon == undefined
                    ? this.buttonIcon
                    : [this.buttonIcon, this.buttonNotificationIcon],
            duration: 300,
            ease: 'cubic.inout',
            repeat: 0,
            yoyo: false,
            props: {
                scale: {
                    from: this.scene.sys.game.device.os.desktop
                        ? TownUIButtonView.BUTTON_ICON_MAX_SCALE
                        : TownUIButtonView.BUTTON_ICON_DEFAULT_SCALE,
                    to: TownUIButtonView.BUTTON_ICON_MIN_SCALE,
                },
            },
            persist: true,
        })

        this.onClickUpButtonIconTween = this.scene.tweens.add({
            targets:
                this.buttonNotificationIcon == undefined
                    ? this.buttonIcon
                    : [this.buttonIcon, this.buttonNotificationIcon],
            duration: 300,
            ease: 'cubic.inout',
            repeat: 0,
            yoyo: false,
            props: {
                scale: {
                    from: TownUIButtonView.BUTTON_ICON_MIN_SCALE,
                    to: TownUIButtonView.BUTTON_ICON_DEFAULT_SCALE,
                },
            },
            persist: true,
        })

        if (this.buttonText) {
            this.onClickDownButtonTextTween = this.scene.tweens.addCounter({
                from: this.scene.sys.game.device.os.desktop
                    ? TownUIButtonView.BUTTON_TEXT_MAX_SIZE
                    : TownUIButtonView.BUTTON_ICON_DEFAULT_SCALE,
                to: TownUIButtonView.BUTTON_TEXT_MIN_SIZE,
                duration: 300,
                ease: 'cubic.inout',
                onUpdate: (tween) => {
                    this.buttonText?.setStyle({ fill: '#EE843C', fontSize: tween.getValue() })
                },
                persist: true,
            })

            this.onClickUpButtonTextTween = this.scene.tweens.addCounter({
                from: TownUIButtonView.BUTTON_TEXT_MIN_SIZE,
                to: TownUIButtonView.BUTTON_TEXT_DEFAULT_SIZE,
                duration: 300,
                ease: 'cubic.inout',
                onUpdate: (tween) => {
                    this.buttonText?.setStyle({ fill: '#585858', fontSize: tween.getValue() })
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
            case TownUIButtonType.Collections:
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
    }

    private setupMenuGroupButtonSubscribe(): void {
        this.menuGroupNotificationDisposable = this.townUIButtonNotificationManager.menuGroupIsUpdate.subscribe(
            (isUpdate) => {
                this.checkButtonIsUpdate(isUpdate)
            }
        )
    }

    private setupButtonWithText(iconKey: string, buttonText: string, isUseMobileBg?: boolean): void {
        this.buttonNotificationIcon = this.scene.add.image(0, 0, 'button-notification').setOrigin(0.5)
        this.buttonIcon = this.scene.add.image(0, 0, iconKey + TownUIButtonView.ICON_IMAGE_KEY).setOrigin(0.5)
        this.buttonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(buttonText)
            .setOrigin(0.5)

        if (isUseMobileBg) {
            this.backgroundButton = new Button(this.scene, 0, 0, 64, 64, 'ui-button-bg-mobile', this.clickDelay)
            this.buttonNotificationIcon.setPosition(20, -20)
            this.buttonIcon.setPosition(-1.5, -17)
            this.buttonText.setPosition(-0.5, 13).setStyle({ fill: '#585858', fontSize: 13 })
        } else {
            this.backgroundButton = new Button(this.scene, 0, 0, 101, 92, 'ui-button-bg-desktop', this.clickDelay)
            this.buttonNotificationIcon.setPosition(35, -34)
            this.buttonIcon.setPosition(-1.5, -27)
            this.buttonText.setPosition(-0.5, 23).setStyle({ fill: '#585858', fontSize: 16 })
            this.setDepth(202)
        }

        this.add([this.backgroundButton, this.buttonIcon, this.buttonText, this.buttonNotificationIcon])
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

    private setupButtonWithoutText(iconKey: string, isUseMobileBg: boolean): void {
        if (isUseMobileBg) {
            this.backgroundButton = new Button(this.scene, 0, 0, 64, 64, 'ui-button-bg-mobile', this.clickDelay)
            this.buttonNotificationIcon = this.scene.add.image(20, -20, 'button-notification').setOrigin(0.5)
        } else {
            this.backgroundButton = new Button(this.scene, 0, 0, 101, 92, 'ui-button-bg-desktop', this.clickDelay)
            this.buttonNotificationIcon = this.scene.add.image(35, -34, 'button-notification').setOrigin(0.5)
        }

        this.buttonIcon = this.scene.add
            .image(this.x, this.y - 2, iconKey + TownUIButtonView.ICON_IMAGE_KEY)
            .setOrigin(0.5)

        this.add([this.backgroundButton, this.buttonIcon, this.buttonNotificationIcon])
        this.setupMenuGroupButtonSubscribe()
    }
}
