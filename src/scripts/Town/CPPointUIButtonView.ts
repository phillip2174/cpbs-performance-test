import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownUIPod } from './Pod/TownUIPod'
import { PodProvider } from '../pod/PodProvider'
import { Subscription, skip } from 'rxjs'
import { TownUIState } from './Type/TownUIState'
import { AnimationController } from './AnimationController'
import { UserPod } from './Pod/UserPod'
import { SceneState } from '../../scenes/SceneState'
import { BoldText } from '../../BoldText/BoldText'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class CPPointUIButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    private backgroundButton: Button
    private buttonIcon: GameObjects.Image
    private buttonText: GameObjects.Text

    private buttonPosX: number
    private buttonPosY: number

    private onOpenTween: Tweens.Tween
    private onCloseTween: Tweens.Tween

    private callback: Function
    private holdCallback: Function

    private isDesktop: boolean

    private userPod: UserPod
    private townUIPod: TownUIPod

    private stateSubscription: Subscription
    private cpPointSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, iconKey: string): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.userPod = PodProvider.instance.userPod
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.buttonPosX = x
        this.buttonPosY = y

        this.backgroundButton = new Button(this.scene, 0, 0, 1, 1, '')
        this.backgroundButton.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'cp-point-button-bg',
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 4,
            bottomHeight: 4,
            safeAreaOffset: 0,
        })
        this.backgroundButton.setBackgroundButtonOrigin(1, 0.5)

        this.buttonIcon = this.scene.add.image(0, 0, iconKey + CPPointUIButtonView.ICON_IMAGE_KEY).setOrigin(0, 0.5)

        this.buttonText = new BoldText(
            this.scene,
            0,
            0,
            this.convertFormatPoint(this.userPod.userCPpoint.value)
        ).setOrigin(1, 0.5)

        this.isDesktop ? this.setupButtonDesktop() : this.setupButtonMobile()

        this.buttonIcon.setPosition(-this.backgroundButton.getBounds().width + 5, 1)

        this.add([this.backgroundButton, this.buttonIcon, this.buttonText])
        this.setPosition(this.buttonPosX, this.buttonPosY)

        if (this.isDesktop) {
            this.CheckHoverOnButton()
        }

        this.setupSubscribe()
        this.createTweens()
        this.onClick(() => {})
        this.setButtonAction()
    }

    public setContainerDepth(depth: number): void {
        this.setDepth(depth)
    }

    public onClick(callback: Function, holdCallback: Function = null): void {
        this.callback = callback
        this.holdCallback = () => {
            PodProvider.instance.cameraControlPod.setIsHoldingButton(true)
        }
    }

    private convertFormatPoint(point: number): string {
        if (point > 99999) {
            return new Intl.NumberFormat('en', {
                notation: 'compact',
                //@ts-ignore
                roundingMode: 'floor',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            }).format(point)
        } else {
            return new Intl.NumberFormat().format(point)
        }
    }

    private setupSubscribe(): void {
        if (!this.isDesktop) return

        if (PodProvider.instance.splashPod.launchScene == SceneState.TownScene) {
            this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
                if (this.checkIsStateUseDimSprite(state)) {
                    if (!this.townUIPod.isFinishChangeUITween) {
                        this.setPosition(this.buttonPosX, this.buttonPosY - 65)
                        this.setActiveButton(true, true)
                    }
                } else if (state == TownUIState.MainMenu || state == TownUIState.DailyLogin) {
                    if (this.townUIPod.isFinishChangeUITween) {
                        this.townUIPod.setIsFinishChangeUITween(false)
                        this.setPosition(this.buttonPosX, this.buttonPosY)
                        this.setActiveButton(true, true)
                    }
                }
            })

            if (this.checkIsStateUseDimSprite(this.townUIPod.townUIState.value)) {
                this.townUIPod.setIsFinishChangeUITween(true)
                this.setPosition(this.buttonPosX, this.buttonPosY - 65)
                this.setActiveButton(true, false)
            } else if (
                this.townUIPod.townUIState.value == TownUIState.MainMenu ||
                this.townUIPod.townUIState.value == TownUIState.DailyLogin
            ) {
                this.townUIPod.setIsFinishChangeUITween(false)
                this.setPosition(this.buttonPosX, this.buttonPosY)
                this.setActiveButton(true, false)
            }
        }

        this.cpPointSubscription = this.userPod.userCPpoint.subscribe((point) => {
            this.buttonText.setText(this.convertFormatPoint(point))
            this.isDesktop ? this.setupButtonDesktop() : this.setupButtonMobile()
            this.buttonIcon.setPosition(-this.backgroundButton.getBounds().width + 5, 1)
        })
    }

    private checkIsStateUseDimSprite(state: TownUIState): boolean {
        return (
            state != TownUIState.MainMenu &&
            state != TownUIState.DailyLogin &&
            state != TownUIState.Settings &&
            state != TownUIState.CompleteIngredients &&
            state != TownUIState.NextIngredients
        )
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
        this.backgroundButton?.setBackgroundButtonTexture('cp-point-hover-button-bg')
        this.buttonText.setStyle({ fill: '#DF2B41' })
    }

    private onLeaveButton(): void {
        this.backgroundButton?.setBackgroundButtonTexture('cp-point-button-bg')
        this.buttonText.setStyle({ fill: '#D97837' })
    }

    private setupButtonMobile(): void {
        this.buttonText.setPosition(-8, -5).setStyle({ fill: '#D97837', fontSize: 32 })
        this.backgroundButton.setButtonSize((this.buttonText.width <= 28 ? 25 : this.buttonText.width) + 50, 42)
        this.buttonIcon.setScale(0.85)
    }

    private setupButtonDesktop(): void {
        this.buttonText.setPosition(-15, -5).setStyle({ fill: '#D97837', fontSize: 36 })
        this.backgroundButton.setButtonSize((this.buttonText.width <= 28 ? 28 : this.buttonText.width) + 65, 50)
    }

    private setActiveButton(isActive: boolean, isTween: boolean): void {
        if (isTween) {
            this.onOpenTween?.restart()
            this.setActive(true)
            this.setVisible(true)
        } else {
            this.onOpenTween?.pause()
            this.setActive(isActive)
            this.setVisible(isActive)
        }
    }

    private createTweens(): void {
        if (!this.isDesktop) return
        this.onOpenTween = AnimationController.instance.tweenOpenContainer(this.scene, this, () => {}).onOpenTween
    }

    private setButtonAction(): void {
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

    destroy(fromScene?: boolean): void {
        this.onOpenTween?.destroy()
        this.stateSubscription?.unsubscribe()
        this.cpPointSubscription?.unsubscribe()
        super.destroy(fromScene)
    }
}
