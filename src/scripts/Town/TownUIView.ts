import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { GuideLineUIView } from '../Guideline/GuideLineUIView'
import { CameraControlPod } from '../camera/CameraControlPod'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { CPPointUIButtonView } from './CPPointUIButtonView'
import { TownUIPod } from './Pod/TownUIPod'
import { TownUIButtonGroupView } from './TownUIButtonGroupView'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'
import { TownUIButtonView } from './TownUIButtonView'
import { TownUICircleButtonView } from './TownUICircleButtonView'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { TownUIState } from './Type/TownUIState'
import { CPLogoUIButtonView } from './CPLogoUIButtonView'
import { UserPod } from './Pod/UserPod'
import { UserType } from '../User/UserType'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'
import { AudioManager } from '../Audio/AudioManager'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { TownTimeState } from './Type/TownTimeState'
import { Button } from './../button/Button'
import { TutorialManager } from './../Manager/TutorialManager'
import { TutorialState } from '../../Tutorial/TutorialState'
import { DeviceChecker } from '../plugins/DeviceChecker'
export class TownUIView extends GameObjects.GameObject {
    private guideLineUIView: GuideLineUIView

    private menuGroupButton: TownUIButtonView
    private dailyLoginButton: TownUIButtonView
    private minigameButton: TownUIButtonView
    private cookingButton: TownUIButtonView
    private inventoryButton: TownUIButtonView
    private collectionsButton: TownUIButtonView
    private cpCityButton: TownUIButtonView
    private townUIButtonGroupView: TownUIButtonGroupView

    private userProfileCircleButtonView: TownUICircleButtonView
    private settingCircleButtonView: TownUICircleButtonView
    private zoomInCircleButtonView: TownUICircleButtonView
    private zoomOutCircleButtonView: TownUICircleButtonView

    private zoomButtonGroupContainer: GameObjects.Container
    private townUIButtonsContainer: GameObjects.Container
    private topButtonsContainer: GameObjects.Container
    private zoomButtonGroupBackground: GameObjects.Image
    private townUIMenuBackground: GameObjects.NineSlice
    private separateButtonLine: GameObjects.Rectangle

    private cpLogoButton: CPLogoUIButtonView
    private cpPointButton: CPPointUIButtonView

    private loginButton: Button

    private showTownUIButtonsTween: Tweens.TweenChain
    private showTopButtonsTween: Tweens.Tween
    private showZoomButtonsTween: Tweens.Tween
    private showMenuGroupButtonTween: Tweens.Tween
    private showTownUIMenuBackgroundTween: Tweens.Tween
    private showLoginButtonTween: Tweens.Tween

    private uiStateDisposable: Subscription
    private cameraZoomSubscription: Subscription
    private firstLoginSubscription: Subscription
    private playTweenTimerSubscription: Subscription
    private delayTweenTimerSubscription: Subscription
    private tutorialStateSubscription: Subscription

    private audioManager: AudioManager

    private cameraControlPod: CameraControlPod
    private townUIPod: TownUIPod
    private townUIButtonNotificationManager: TownUIButtonNotificationManager
    private userPod: UserPod
    private townDayNightPod: TownDayNightPod
    private tutorialManager: TutorialManager

    private gameScreenCenterX: number = this.scene.cameras.main.centerX
    private gameScreenCenterY: number = this.scene.cameras.main.centerY
    private gameScreenWidth: number = this.scene.cameras.main.width
    private gameScreenHeight: number = this.scene.cameras.main.height

    private isDesktop: boolean

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
        this.cameraControlPod = PodProvider.instance.cameraControlPod
        this.userPod = PodProvider.instance.userPod
        this.audioManager = PodProvider.instance.audioManager
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.tutorialManager = PodProvider.instance.tutorialManager

        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.townUIMenuBackground = this.scene.add
            .nineslice(
                this.gameScreenWidth / 2,
                this.gameScreenHeight - 39,
                'town-ui-menu-bg',
                '',
                this.gameScreenWidth,
                77,
                0,
                0,
                30,
                0
            )
            .setDepth(202)
            .setInteractive()

        this.guideLineUIView = new GuideLineUIView(this.scene)
        this.guideLineUIView.doInit(this.gameScreenWidth / 2, this.gameScreenHeight - 65)

        this.setupUIButtons()
        this.createTweens()
        this.playTweens()
        this.setupSubscribe()
        this.setupActionButton()
    }

    private setupSubscribe(): void {
        this.uiStateDisposable = this.townUIPod.townUIState.subscribe((state) => {
            switch (state) {
                case TownUIState.MainMenu:
                    this.townUIPod.setLayerScrollView(0)
                    this.showTownUIs()

                    if (this.townDayNightPod.getTownTimeState() == TownTimeState.Day)
                        this.audioManager.playAmbientSound('town_day_ambient', false)
                    else this.audioManager.playAmbientSound('town_night_ambient', false)

                    this.audioManager.playBGMSound('citygame_01_bgm', false)
                    break
                case TownUIState.Collection:
                    this.hideTownUIs()

                    this.audioManager.stopBGMSound()
                    this.audioManager.playAmbientSound('cooking_ambient', false)

                    this.audioManager.playSFXSound('collection_open_sfx')
                    break
                case TownUIState.Inventory:
                    this.hideTownUIs()

                    this.audioManager.stopBGMSound()
                    this.audioManager.playAmbientSound('cooking_ambient', false)

                    this.audioManager.playSFXSound('inventory_open_sfx')
                    break
                case TownUIState.Cooking:
                    this.hideTownUIs()

                    this.audioManager.stopBGMSound()
                    this.audioManager.playAmbientSound('cooking_ambient', false)

                    this.audioManager.playSFXSound('cooking_open_sfx')
                    break
                case TownUIState.DailyLogin:
                    this.showTownUIs()

                    this.audioManager.playSFXSound('daily_login_open_sfx')
                    break
                case TownUIState.MiniGameSelect:
                    this.hideTownUIs()
                    break
            }
        })

        if (this.tutorialManager.isCompletedTutorial() && this.userPod.userLoginType == UserType.Login) {
            this.firstLoginSubscription = this.userPod.isFirstLoginOfTheDay.subscribe((isFirstLogin) => {
                if (isFirstLogin) {
                    this.townUIPod.changeUIState(TownUIState.DailyLogin)
                    this.userPod.setIsFirstLoginOfTheDay(false)
                }
            })
        } else {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.loginButton?.setDepth(202)
            } else {
                this.tutorialStateSubscription = this.tutorialManager.tutorialState.subscribe((state) => {
                    switch (state) {
                        case TutorialState.CountDown:
                        case TutorialState.WaitClick:
                            this.loginButton?.setDepth(301)
                            break
                        default:
                            this.loginButton?.setDepth(299)
                            break
                    }
                })
            }
        }

        this.on('destroy', () => {
            this.uiStateDisposable?.unsubscribe()
            this.firstLoginSubscription?.unsubscribe()
            this.cameraZoomSubscription?.unsubscribe()
            this.playTweenTimerSubscription?.unsubscribe()
            this.delayTweenTimerSubscription?.unsubscribe()
            this.tutorialStateSubscription?.unsubscribe()
        })
    }

    private showTownUIs(): void {
        this.townUIMenuBackground?.setVisible(true)
        this.topButtonsContainer?.setVisible(true)
        if (this.userPod.userLoginType == UserType.Login) {
            this.userProfileCircleButtonView?.setVisible(true)
        } else {
            this.loginButton?.setVisible(true)
        }
        this.settingCircleButtonView?.setVisible(true)
        this.separateButtonLine?.setVisible(true)
    }

    private hideTownUIs(): void {
        if (!this.isDesktop) {
            this.townUIMenuBackground?.setVisible(false)
            this.topButtonsContainer?.setVisible(false)
        } else {
            this.userProfileCircleButtonView?.setVisible(false)
            this.settingCircleButtonView?.setVisible(false)
            this.separateButtonLine?.setVisible(false)
        }

        this.loginButton?.setVisible(false)
    }

    private setupUIButtons(): void {
        this.setupCircleButtons()

        this.cpPointButton = new CPPointUIButtonView(this.scene)
        this.topButtonsContainer.add([this.cpPointButton])

        if (!this.isDesktop) {
            this.menuGroupButton = new TownUIButtonView(this.scene)
            this.menuGroupButton.doInit(
                this.gameScreenWidth + 100,
                this.gameScreenHeight - 152,
                'menu-group',
                TownUIButtonType.MenuGroup,
                'MENU',
                1000,
                true
            )

            this.townUIButtonGroupView = new TownUIButtonGroupView(this.scene)
            this.townUIButtonGroupView.doInit()

            this.cpPointButton.doInit(this.gameScreenWidth / 2 - 25, -this.gameScreenHeight / 2 + 105, 'cp-point')
        } else {
            this.setupZoomButtonGroup()
            this.setActionButtonZoom()

            this.cpPointButton.doInit(this.gameScreenWidth / 2 - 15, -this.gameScreenHeight / 2 + 105, 'cp-point')
            this.cpPointButton.setContainerDepth(201)
            this.setupTownUIButtons()
        }
    }

    private setupTownUIButtons(): void {
        this.townUIButtonsContainer = this.scene.add
            .container(this.gameScreenCenterX, this.gameScreenCenterY)
            .setDepth(202)

        this.dailyLoginButton = new TownUIButtonView(this.scene)
        this.dailyLoginButton.doInit(
            this.gameScreenWidth / 2 - 85,
            this.gameScreenHeight / 2 - 60,
            'daily-login',
            TownUIButtonType.DailyLogin,
            'DAILY LOGIN'
        )

        this.minigameButton = new TownUIButtonView(this.scene)
        this.minigameButton.doInit(
            this.gameScreenWidth / 2 - 195,
            this.gameScreenHeight / 2 - 60,
            'minigame',
            TownUIButtonType.Minigame,
            'MINI GAME'
        )

        this.cookingButton = new TownUIButtonView(this.scene)
        this.cookingButton.doInit(
            this.gameScreenWidth / 2 - 305,
            this.gameScreenHeight / 2 - 60,
            'cooking',
            TownUIButtonType.Cooking,
            'COOKING'
        )

        this.inventoryButton = new TownUIButtonView(this.scene)
        this.inventoryButton.doInit(
            -this.gameScreenWidth / 2 + 305,
            this.gameScreenHeight / 2 - 60,
            'inventory',
            TownUIButtonType.Inventory,
            'MY INVENTORY'
        )

        this.collectionsButton = new TownUIButtonView(this.scene)
        this.collectionsButton.doInit(
            -this.gameScreenWidth / 2 + 195,
            this.gameScreenHeight / 2 - 60,
            'collections',
            TownUIButtonType.Collection,
            'COLLECTIONS'
        )

        this.cpCityButton = new TownUIButtonView(this.scene)
        this.cpCityButton.doInit(
            -this.gameScreenWidth / 2 + 85,
            this.gameScreenHeight / 2 - 60,
            'cp-city',
            TownUIButtonType.MainMenu,
            'CP TOWN'
        )
        this.cpCityButton.hideNotification()

        this.townUIButtonsContainer.add([
            this.dailyLoginButton,
            this.minigameButton,
            this.cookingButton,
            this.inventoryButton,
            this.collectionsButton,
            this.cpCityButton,
        ])
    }

    private setupActionButton() {
        this.menuGroupButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial(true, TutorialStepState.CompletedCollectedIngredient)) {
                this.townUIButtonNotificationManager.setMenuGroupIsUpdate(false)
                this.townUIPod.setIsShowMenuGroup(true)
            }
        })

        this.dailyLoginButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
                this.townUIPod.changeUIState(TownUIState.DailyLogin)
            }
        })

        this.inventoryButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.townUIButtonNotificationManager.setInventoryIsUpdate(false)
                this.townUIPod.changeUIState(TownUIState.Inventory)
                this.townUIPod.setIsShowGuideline(false)
            }
        })

        this.collectionsButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial(true, TutorialStepState.CompleteCooking)) {
                this.townUIPod.changeUIState(TownUIState.Collection)
                this.townUIPod.setIsShowGuideline(false)
            }
        })

        this.cookingButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial(true, TutorialStepState.CompletedCollectedIngredient)) {
                this.townUIPod.changeUIState(TownUIState.Cooking)
                this.townUIPod.setIsShowGuideline(false)
            }
        })

        this.cpCityButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.townUIPod.changeUIState(TownUIState.MainMenu)
                this.townUIPod.setIsShowGuideline(true)
            }
        })

        this.minigameButton?.onClick(() => {
            if (this.tutorialManager.isCompletedTutorial()) {
                this.townUIPod.changeUIState(TownUIState.MiniGameSelect)
                this.townUIPod.setIsShowGuideline(false)
                this.townUIPod.setIsShowMenuGroup(false)
            }
        })

        this.settingCircleButtonView?.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.Settings)
        })

        this.loginButton?.onClick(() => {
            window.open('https://www.cpbrandsite.com/')
        })
    }

    private setupCircleButtons(): void {
        this.topButtonsContainer = this.scene.add
            .container(this.gameScreenCenterX, this.gameScreenCenterY - 150)
            .setDepth(201)

        this.userProfileCircleButtonView = new TownUICircleButtonView(this.scene)
        this.userProfileCircleButtonView.doInit(
            this.gameScreenWidth / 2 - 115,
            -this.gameScreenHeight / 2 + 40,
            'user-profile'
        )

        if (this.userPod.userLoginType == UserType.Guest) {
            this.loginButton = this.createButton(
                this.isDesktop ? 117 : 95,
                48,
                'minigame-play-button',
                'เข้าสู่ระบบ',
                24
            )
                .setDepth(301)
                .setPosition(
                    this.gameScreenCenterX + this.gameScreenWidth / 2 - (this.isDesktop ? 150 : 140),
                    this.gameScreenCenterY + -this.gameScreenHeight / 2 - 110
                )

            this.userProfileCircleButtonView.setVisible(false)
        }

        this.settingCircleButtonView = new TownUICircleButtonView(this.scene)
        this.settingCircleButtonView.doInit(
            this.userProfileCircleButtonView.x + 70,
            this.userProfileCircleButtonView.y,
            'setting'
        )

        this.separateButtonLine = this.scene.add
            .rectangle(this.userProfileCircleButtonView.x + 35, this.userProfileCircleButtonView.y, 3, 32, 0xcecece, 1)
            .setOrigin(0.5)

        this.cpLogoButton = new CPLogoUIButtonView(this.scene)
        this.cpLogoButton.doInit(-this.gameScreenWidth / 2 + 50, this.userProfileCircleButtonView.y)
        if (this.isDesktop) {
            this.cpLogoButton.setContainerDepth(201)
        }

        this.topButtonsContainer.add([
            this.userProfileCircleButtonView,
            this.settingCircleButtonView,
            this.separateButtonLine,
            this.cpLogoButton,
        ])
    }

    private setupZoomButtonGroup(): void {
        let zoomButtonOffsetY = 28

        this.zoomButtonGroupContainer = this.scene.add.container()

        this.zoomButtonGroupBackground = this.scene.add.image(0, 0, 'zoom-button-group-bg')

        this.zoomInCircleButtonView = new TownUICircleButtonView(this.scene)
        this.zoomInCircleButtonView.doInit(
            0,
            this.zoomButtonGroupBackground.y - zoomButtonOffsetY,
            'zoom-in',
            TownUIButtonType.Zoom
        )

        this.zoomOutCircleButtonView = new TownUICircleButtonView(this.scene)
        this.zoomOutCircleButtonView.doInit(
            0,
            this.zoomButtonGroupBackground.y + zoomButtonOffsetY,
            'zoom-out',
            TownUIButtonType.Zoom
        )
        this.zoomOutCircleButtonView.setInteractable(false)

        this.zoomButtonGroupContainer.add([
            this.zoomButtonGroupBackground,
            this.zoomInCircleButtonView,
            this.zoomOutCircleButtonView,
        ])
        this.zoomButtonGroupContainer.setPosition(this.gameScreenWidth + 90, this.gameScreenHeight - 205)
    }

    private setActionButtonZoom() {
        this.zoomInCircleButtonView.onClick(() => {
            let currentZoomValue = this.cameraControlPod.currentZoomValue.value.zoomValue
            if (currentZoomValue < this.cameraControlPod.midCameraZoom) {
                this.setZoomAndSetInteractableButton(this.cameraControlPod.midCameraZoom, true, false)
            } else if (currentZoomValue >= this.cameraControlPod.midCameraZoom) {
                this.setZoomAndSetInteractableButton(this.cameraControlPod.maxCameraZoom, false, true)
            }
        })

        this.zoomOutCircleButtonView.onClick(() => {
            let currentZoomValue = this.cameraControlPod.currentZoomValue.value.zoomValue
            if (currentZoomValue <= this.cameraControlPod.midCameraZoom) {
                this.setZoomAndSetInteractableButton(this.cameraControlPod.minCameraZoom, false, false)
            } else if (currentZoomValue > this.cameraControlPod.midCameraZoom) {
                this.setZoomAndSetInteractableButton(this.cameraControlPod.midCameraZoom, true, true)
            }
        })

        this.cameraZoomSubscription = this.cameraControlPod.currentZoomValue.subscribe((value) => {
            this.zoomInCircleButtonView?.setInteractable(!(value.zoomValue >= this.cameraControlPod.maxCameraZoom))
            this.zoomOutCircleButtonView?.setInteractable(!(value.zoomValue <= this.cameraControlPod.minCameraZoom))
        })
    }

    private setZoomAndSetInteractableButton(value: number, interactable: boolean, isButtonZoomIn: boolean) {
        this.cameraControlPod.setCurrentZoomValue(value)

        if (isButtonZoomIn) {
            this.zoomInCircleButtonView.setInteractable(interactable)
        } else {
            this.zoomOutCircleButtonView.setInteractable(interactable)
        }
    }

    private createTweens(): void {
        this.showTownUIMenuBackgroundTween = this.scene.add.tween({
            targets: this.townUIMenuBackground,
            ease: 'cubic.inout',
            duration: 500,
            props: { y: { from: this.townUIMenuBackground.y + 150, to: this.townUIMenuBackground.y } },
            persist: true,
            paused: true,
        })

        this.showTopButtonsTween = this.scene.add.tween({
            targets: this.topButtonsContainer,
            ease: 'cubic.inout',
            duration: 300,
            props: { y: { from: this.topButtonsContainer.y, to: this.topButtonsContainer.y + 150 } },
            persist: true,
            paused: true,
        })

        if (this.loginButton != undefined || this.loginButton != null) {
            this.showLoginButtonTween = this.scene.add.tween({
                targets: this.loginButton,
                ease: 'cubic.inout',
                duration: 300,
                props: { y: { from: this.loginButton.y, to: this.loginButton.y + 150 } },
                persist: true,
                paused: true,
            })
        }

        if (this.isDesktop) {
            this.showTownUIButtonsTween = this.scene.tweens.chain({
                targets: this.townUIButtonsContainer,
                tweens: [
                    {
                        ease: 'cubic.inout',
                        duration: 500,
                        props: {
                            y: { from: this.townUIButtonsContainer.y + 150, to: this.townUIButtonsContainer.y - 10 },
                        },
                    },
                    {
                        ease: 'linear',
                        duration: 100,
                        props: { y: { from: this.townUIButtonsContainer.y - 10, to: this.townUIButtonsContainer.y } },
                    },
                ],
                persist: true,
                paused: true,
            })

            this.showZoomButtonsTween = this.scene.add.tween({
                targets: this.zoomButtonGroupContainer,
                ease: 'cubic.inout',
                duration: 300,
                props: { x: { from: this.zoomButtonGroupContainer.x, to: this.zoomButtonGroupContainer.x - 150 } },
                persist: true,
                paused: true,
            })
        } else {
            this.showMenuGroupButtonTween = this.scene.add.tween({
                targets: this.menuGroupButton,
                ease: 'cubic.inout',
                duration: 300,
                props: { x: { from: this.menuGroupButton.x, to: this.menuGroupButton.x - 150 } },
                persist: true,
                paused: true,
            })
        }
    }

    private playTweens(): void {
        this.playTweenTimerSubscription = timer(250).subscribe((_) => {
            if (this.showTownUIButtonsTween != undefined) {
                this.showTownUIMenuBackgroundTween?.restart()
                this.showTownUIButtonsTween?.restart().setCallback('onComplete', () => {
                    if (
                        this.townUIPod.townUIState.value == TownUIState.MainMenu ||
                        this.townUIPod.townUIState.value == TownUIState.DailyLogin
                    ) {
                        this.townUIPod.setIsShowGuideline(true)
                    }

                    this.delayTweenTimerSubscription = timer(450).subscribe((_) => {
                        this.showTopButtonsTween?.restart()
                        this.showLoginButtonTween?.restart()
                        this.showZoomButtonsTween?.restart()
                        this.delayTweenTimerSubscription?.unsubscribe()
                    })
                    this.playTweenTimerSubscription?.unsubscribe()
                })
            } else {
                this.showTownUIMenuBackgroundTween?.restart().setCallback('onComplete', () => {
                    if (
                        this.townUIPod.townUIState.value == TownUIState.MainMenu ||
                        this.townUIPod.townUIState.value == TownUIState.DailyLogin
                    ) {
                        this.townUIPod.setIsShowGuideline(true)
                    }
                    this.delayTweenTimerSubscription = timer(450).subscribe((_) => {
                        this.showTopButtonsTween?.restart()
                        this.showLoginButtonTween?.restart()
                        this.showMenuGroupButtonTween?.restart()
                        this.delayTweenTimerSubscription?.unsubscribe()
                    })
                    this.playTweenTimerSubscription?.unsubscribe()
                })
            }
        })
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        fontSizeDesktop: number = 24,
        fontSizeMobile: number = 22,
        colorBG?: number,
        iconKey?: string
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 21,
            bottomHeight: 23,
            safeAreaOffset: 0,
        })

        button.setTextStyle(
            {
                fontFamily: 'DB_HeaventRounded_Bd',
                fill: 'white',
                fontSize: this.isDesktop ? fontSizeDesktop : fontSizeMobile,
            },
            !DeviceChecker.instance.isAppleOS()
        )

        button.setTextPosition(0, this.isDesktop ? (DeviceChecker.instance.isMacOS() ? 2 : 3) : 1)
        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        if (colorBG != undefined) {
            button.setTintColorBackground(colorBG)
        }

        return button
    }
}
