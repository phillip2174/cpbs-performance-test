import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownUIPod } from './Pod/TownUIPod'
import { PodProvider } from '../pod/PodProvider'
import { Subscription, skip } from 'rxjs'
import { TownUIState } from './Type/TownUIState'
import { AnimationController } from './AnimationController'

export class CPPointUIButtonView extends GameObjects.Container {
    public static readonly ICON_IMAGE_KEY: string = `-button-icon`
    private backgroundButton: Button
    private buttonIcon: GameObjects.Image
    private buttonText: GameObjects.Text

    private buttonPosX: number
    private buttonPosY: number

    private onOpenTween: Tweens.Tween
    private onCloseTween: Tweens.Tween

    private isDesktop: boolean

    private townUIPod: TownUIPod

    private stateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, iconKey: string, buttonText?: string): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
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

        this.buttonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText(buttonText)
            .setOrigin(1, 0.5)

        this.isDesktop ? this.setupButtonDesktop() : this.setupButtonMobile()
        this.buttonIcon.setPosition(-this.backgroundButton.getBounds().width + 5, 1)

        this.add([this.backgroundButton, this.buttonIcon, this.buttonText])
        this.setPosition(this.buttonPosX, this.buttonPosY)

        if (this.isDesktop) {
            this.CheckHoverOnButton()
        }

        this.setupSubscribe()
        this.createTweens()
    }

    public setContainerDepth(depth: number): void {
        this.setDepth(depth)
    }

    private setupSubscribe(): void {
        if (!this.isDesktop) return
        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state != TownUIState.MainMenu && state != TownUIState.DailyLogin && state != TownUIState.Settings) {
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

        if (
            this.townUIPod.townUIState.value != TownUIState.MainMenu &&
            this.townUIPod.townUIState.value != TownUIState.DailyLogin &&
            this.townUIPod.townUIState.value != TownUIState.Settings
        ) {
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
        this.buttonText.setPosition(-8, -4).setStyle({ fill: '#D97837', fontSize: 32 })
        this.backgroundButton.setButtonSize(this.buttonText.width + 50, 42)
        this.buttonIcon.setScale(0.85)
    }

    private setupButtonDesktop(): void {
        this.buttonText.setPosition(-15, -5).setStyle({ fill: '#D97837', fontSize: 36 })
        this.backgroundButton.setButtonSize(this.buttonText.width + 65, 50)
    }

    private setActiveButton(isActive: boolean, isTween: boolean): void {
        if (isTween) {
            this.onOpenTween.restart()
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
}
