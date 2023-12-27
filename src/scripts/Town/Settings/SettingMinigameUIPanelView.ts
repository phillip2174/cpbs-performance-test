import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { TownUIState } from '../Type/TownUIState'
import { SettingButtonGroupView } from './SettingButtonGroupView'
import { DimButton } from '../../button/DimButton'
import { AnimationController } from '../AnimationController'
import { TownUIPod } from '../Pod/TownUIPod'
import { Subscription, skip } from 'rxjs'
import { MinigameScenePod } from '../../minigame/MinigameScenePod'
import { BoldText } from '../../../BoldText/BoldText'
import { UIDepthConfig } from '../../UIDepthConfig'

export class SettingMinigameUIPanelView extends GameObjects.Container {
    private dimButton: DimButton
    private settingsUIContainer: GameObjects.Container
    private buttonGroupBackground: GameObjects.Image
    private settingsText: GameObjects.Text
    private closeButton: Button
    private settingButtonGroupView: SettingButtonGroupView
    private isFirstInit: boolean = true

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onOpenButtonGroup: Tweens.Tween
    private onCloseTween: Tweens.Tween
    private onCloseScaleTween: Tweens.TweenChain

    private pod: MinigameScenePod

    private stateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(pod: MinigameScenePod): void {
        this.pod = pod
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.setDepth(UIDepthConfig.SETTING)
        this.dimButton = new DimButton(this.scene)

        this.setupSettingsUIContainer()
        this.createTween()
        this.buttonGroupBackground?.setInteractive()
        this.dimButton.onClick(() => {
            this.pod.settingState.next(false)
        })

        this.add([this.dimButton, this.settingsUIContainer])
        this.setupSubscribe()
    }

    private setupSubscribe(): void {
        this.stateSubscription = this.pod.settingState.subscribe((state) => {
            if (state) {
                this.showUIPanel()
            } else {
                this.hideUIPanel()
            }
        })

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
        })

        this.setFirstActive(this.pod.settingState.value)
    }

    private createTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.settingsUIContainer)

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this.settingsUIContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseScaleTween = tweensClose.onCloseTweenChain

        this.onOpenButtonGroup = this.scene.add.tween({
            targets: this.settingButtonGroupView,
            delay: 250,
            duration: 400,
            alpha: { from: 0, to: 1 },
            ease: 'cubic.inout',
            persist: true,
            paused: true,
        })
    }

    private showUIPanel(): void {
        this.dimButton.setActiveDim(true)
        this.onCloseTween?.pause()
        this.onCloseScaleTween?.pause()
        this.onOpenTween.restart()
        this.onOpenTweenChain?.restart()
        this.onOpenButtonGroup?.restart()

        this.setActive(true)
        this.setVisible(true)
    }

    private hideUIPanel(): void {
        this.onOpenTween?.pause()
        this.onOpenTweenChain?.pause()
        this.onOpenButtonGroup?.pause()

        this.onCloseTween?.restart()
        this.onCloseScaleTween?.restart()
        this.dimButton.setActiveDim(false)
    }

    private setFirstActive(isActive: boolean): void {
        this.setActive(isActive)
        this.setVisible(isActive)
    }

    private setupSettingsUIContainer(): void {
        this.settingsUIContainer = this.scene.add.container()
        this.buttonGroupBackground = this.scene.add.image(0, 0, 'setting-button-group-bg').setOrigin(0.5)
        this.settingsText = new BoldText(this.scene, 0, -155.5, 'Settings', 36, '#2B2B2B')

        this.closeButton = new Button(this.scene, 125.5, -180.5, 40, 40, 'close-button')
        this.closeButton.onClick(() => {
            this.pod.settingState.next(false)
        })

        this.settingButtonGroupView = new SettingButtonGroupView(this.scene)
        this.settingButtonGroupView.doInit(0, 0)

        this.settingsUIContainer.add([
            this.buttonGroupBackground,
            this.settingsText,
            this.closeButton,
            this.settingButtonGroupView,
        ])
    }
}
