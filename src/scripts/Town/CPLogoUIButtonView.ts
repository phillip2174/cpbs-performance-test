import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { Button } from '../button/Button'
import { Subscription, skip } from 'rxjs'
import { TownUIState } from './Type/TownUIState'
import { AnimationController } from './AnimationController'
import { TownUIPod } from './Pod/TownUIPod'
import { PodProvider } from '../pod/PodProvider'

export class CPLogoUIButtonView extends GameObjects.Container {
    private cpLogoImage: GameObjects.Image
    private cpBrandsiteLogoImage: GameObjects.Image

    private logoButton: Button

    private isDesktop: boolean

    private onOpenTween: Tweens.Tween

    private stateSubscription: Subscription

    private townUIPod: TownUIPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.setPosition(x, y)
        this.setupUI()
        this.setupButtonListener()
        this.setupSubscribe()
        this.createTweens()
    }

    public setContainerDepth(depth: number): void {
        this.setDepth(depth)
    }

    private setupUI(): void {
        this.cpLogoImage = this.scene.add.image(0, 0, 'cp-logo').setOrigin(0.5)
        if (this.isDesktop) {
            this.cpBrandsiteLogoImage = this.scene.add.image(95, 0, 'cp-brandsite-logo').setOrigin(0.5)
            this.logoButton = new Button(
                this.scene,
                this.cpBrandsiteLogoImage.x / 1.4,
                0,
                this.cpLogoImage.width + this.cpBrandsiteLogoImage.width + 15,
                this.cpLogoImage.height + 5,
                ''
            )
            this.add([this.cpLogoImage, this.cpBrandsiteLogoImage, this.logoButton])
        } else {
            this.logoButton = new Button(this.scene, 0, 0, this.cpLogoImage.width + 5, this.cpLogoImage.height + 5, '')
            this.add([this.cpLogoImage, this.logoButton])
        }

        this.logoButton?.setAlpha(0.01)
    }

    private setupButtonListener(): void {
        this.logoButton.onClick(() => {
            window.open('https://www.cpbrandsite.com/')
        })
    }

    private setupSubscribe(): void {
        if (!this.isDesktop) return
        this.stateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            if (state != TownUIState.MainMenu && state != TownUIState.DailyLogin && state != TownUIState.Settings) {
                if (!this.townUIPod.isFinishChangeUITween) {
                    this.setActiveButton(true, true)
                }
            } else if (state == TownUIState.MainMenu || state == TownUIState.DailyLogin) {
                if (this.townUIPod.isFinishChangeUITween) {
                    this.setActiveButton(true, true)
                }
            }
        })

        if (
            this.townUIPod.townUIState.value != TownUIState.MainMenu &&
            this.townUIPod.townUIState.value != TownUIState.DailyLogin &&
            this.townUIPod.townUIState.value != TownUIState.Settings
        ) {
            this.setActiveButton(true, false)
        } else if (
            this.townUIPod.townUIState.value == TownUIState.MainMenu ||
            this.townUIPod.townUIState.value == TownUIState.DailyLogin
        ) {
            this.setActiveButton(true, false)
        }
    }

    private setActiveButton(isActive: boolean, isTween: boolean): void {
        if (isTween) {
            this.onOpenTween?.restart()
            this.setActive(true)
            this.setVisible(true)
        } else {
            this.setActive(isActive)
            this.setVisible(isActive)
        }
    }

    private createTweens(): void {
        if (!this.isDesktop) return
        this.onOpenTween = AnimationController.instance.tweenOpenContainer(this.scene, this).onOpenTween
    }

    destroy(fromScene?: boolean): void {
        this.onOpenTween?.destroy()
        this.stateSubscription?.unsubscribe()
        super.destroy(fromScene)
    }
}
