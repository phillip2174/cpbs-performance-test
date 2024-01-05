import { Cameras, GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, skip } from 'rxjs'
import { BoldText } from '../../BoldText/BoldText'
import { AnimationController } from '../Town/AnimationController'
import { TownUIState } from '../Town/Type/TownUIState'
import { UIDepthConfig } from '../UIDepthConfig'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { DimButton } from '../button/DimButton'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownUIPod } from './../Town/Pod/TownUIPod'
import { UserBean } from './UserBean'

export class UserProfilePanelView extends GameObjects.Container {
    public static readonly MAX_PANEL_BG_WIDTH: number = 255
    public static readonly MIN_PANEL_BG_WIDTH: number = 164

    private dimButton: DimButton

    private panelUIContainer: GameObjects.Container

    private logoutIcon: GameObjects.Image
    private showBg: GameObjects.Image
    private panelBg: GameObjects.NineSlice

    private userNameText: GameObjects.Text
    private userIDText: GameObjects.Text
    private logoutText: GameObjects.Text

    private logoutButton: GameObjects.Rectangle

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private mainCamera: Cameras.Scene2D.Camera

    private isDesktop: boolean

    private townUIPod: TownUIPod

    private userBean: UserBean

    private uiStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit(): void {
        this.userBean = PodProvider.instance.userPod.userBean
        this.townUIPod = PodProvider.instance.townUIPod
        this.mainCamera = this.scene.cameras.main

        this.setPosition(this.mainCamera.centerX, this.mainCamera.centerY)
        this.setDepth(UIDepthConfig.USER_PROFILE)

        this.dimButton = new DimButton(this.scene, 0.01)
        this.dimButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })

        this.setupUIContainer()
        this.createTweens()
        this.setupSubscribe()

        this.add([this.dimButton, this.panelUIContainer])
    }

    private setupSubscribe(): void {
        this.uiStateSubscription = this.townUIPod.townUIState.pipe(skip(1)).subscribe((state) => {
            this.setActiveContainer(state == TownUIState.UserProfile, true)
        })

        this.setActiveContainer(this.townUIPod.townUIState.value == TownUIState.UserProfile, false)

        this.on('destroy', () => {
            this.uiStateSubscription?.unsubscribe()
        })
    }

    private setupUIContainer(): void {
        this.panelUIContainer = this.scene.add.container(
            this.mainCamera.width / 2 - 115,
            -this.mainCamera.height / 2 + 90
        )
        this.showBg = this.scene.add.image(0, 0, 'user-profile-show-bg').setOrigin(0.5)
        this.panelBg = this.scene.add
            .nineslice(
                this.showBg.x + 35,
                this.showBg.y,
                'user-profile-bg',
                '',
                UserProfilePanelView.MIN_PANEL_BG_WIDTH,
                96,
                15,
                15,
                15,
                15
            )
            .setOrigin(1, 0)

        this.setupUserTexts()
        this.setupLogoutButton()
        this.panelUIContainer.add([
            this.showBg,
            this.panelBg,
            this.userNameText,
            this.userIDText,
            this.logoutIcon,
            this.logoutText,
            this.logoutButton,
        ])
    }

    private setupUserTexts(): void {
        this.userNameText = new BoldText(
            this.scene,
            0,
            0,
            this.userBean.firstName + ' ' + this.userBean.lastName,
            22,
            '#2B2B2B'
        ).setOrigin(0, 0.5)

        this.userIDText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setPosition(0, 0)
            .setText('ID' + this.userBean.userId)
            .setOrigin(0, 0.5)
            .setStyle({ fill: '#AEAEC1', fontSize: 16 })

        if (this.userNameText.width + 40 > UserProfilePanelView.MIN_PANEL_BG_WIDTH) {
            if (this.userNameText.width + 40 > UserProfilePanelView.MAX_PANEL_BG_WIDTH) {
                this.panelBg.width = UserProfilePanelView.MAX_PANEL_BG_WIDTH
                const nameText = TextAdapter.splitThaiStringByLegth(
                    this.userBean.firstName + ' ' + this.userBean.lastName,
                    30
                )
                this.userNameText.setText(`${nameText[0]}...`)
            } else {
                this.panelBg.width = this.userNameText.width + 40
            }
        }

        this.userNameText.setPosition(-this.panelBg.width + 55, -this.panelBg.height / 2 + 68)
        this.userIDText.setPosition(this.userNameText.x, this.userNameText.y + this.userNameText.height / 2 - 5)
    }

    private setupLogoutButton(): void {
        this.logoutIcon = this.scene.add
            .image(-this.panelBg.width + 55, this.panelBg.height / 2 + 28, 'logout-icon')
            .setOrigin(0, 0.5)

        this.logoutText = new BoldText(
            this.scene,
            this.logoutIcon.x + 28,
            this.logoutIcon.y - (this.isDesktop ? 2 : 2.5),
            'LOGOUT',
            18,
            '#DF2B41'
        ).setOrigin(0, 0.5)

        this.logoutButton = this.scene.add
            .rectangle(
                this.logoutIcon.x,
                this.logoutIcon.y - 1,
                this.logoutIcon.width + this.logoutText.width + 10,
                this.logoutIcon.height,
                0xff00ff,
                0
            )
            .setOrigin(0, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                AlertDialogue.showYesNoPopup(
                    this.scene,
                    'ยืนยันออกจากระบบ',
                    '\n ต้องการออกจากระบบ หรือไม่',
                    () => {
                        console.log('Logout Success!!')
                    },
                    () => {
                        console.log('Logout Canceled')
                    },
                    'CONFIRM',
                    'CANCEL',
                    true
                )
            })
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()

                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.setActive(true)
                this.setVisible(true)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.dimButton.setActiveDim(false)
            }
        } else {
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
        }
    }

    private createTweens(): void {
        let openTweens = AnimationController.instance.tweenOpenContainer(this.scene, this.panelUIContainer)
        this.onOpenTween = openTweens.onOpenTween
        this.onOpenTweenChain = openTweens.onOpenTweenChain

        let closeTweens = AnimationController.instance.tweenCloseContainer(this.scene, this.panelUIContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = closeTweens.onCloseTween
        this.onCloseTweenChain = closeTweens.onCloseTweenChain
    }
}
