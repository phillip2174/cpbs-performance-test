import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
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

export class TownUIView extends GameObjects.GameObject {
    private guideLineUIView: GuideLineUIView

    private menuGroupButton: TownUIButtonView
    private dailyLoginButton: TownUIButtonView
    private minigameButton: TownUIButtonView
    private cookingButton: TownUIButtonView
    private inventoryButton: TownUIButtonView
    private collectionsButton: TownUIButtonView
    private townUIButtonGroupView: TownUIButtonGroupView

    private userProfileCircleButtonView: TownUICircleButtonView
    private settingCircleButtonView: TownUICircleButtonView
    private zoomInCircleButtonView: TownUICircleButtonView
    private zoomOutCircleButtonView: TownUICircleButtonView

    private zoomButtonGroupContainer: GameObjects.Container
    private zoomButtonGroupBackground: GameObjects.Image
    private townUIMenuBackground: GameObjects.NineSlice
    private separateButtonLine: GameObjects.Rectangle

    private cpLogoButton: CPLogoUIButtonView
    private cpPointButton: CPPointUIButtonView

    private uiStateDisposable: Subscription
    private cameraZoomSubscription: Subscription

    private cameraControlPod: CameraControlPod
    private townUIPod: TownUIPod
    private townUIButtonNotificationManager: TownUIButtonNotificationManager

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

        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

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

        this.guideLineUIView = new GuideLineUIView(this.scene)
        this.guideLineUIView.doInit(this.gameScreenWidth / 2, this.gameScreenHeight - 65)

        this.setupUIButtons()
        this.setupSubscribe()
        this.setupActionButton()
    }

    private setupSubscribe(): void {
        this.uiStateDisposable = this.townUIPod.townUIState.subscribe((state) => {
            switch (state) {
                case TownUIState.MainMenu:
                    this.townUIPod.setLayerScrollView(0)
                    this.townUIMenuBackground.setVisible(true)
                    break
                case TownUIState.Collection:
                    this.hideTownUIMenuBg()
                    break
                case TownUIState.Inventory:
                    this.hideTownUIMenuBg()
                    break
                case TownUIState.Cooking:
                    this.hideTownUIMenuBg()
                    break
                case TownUIState.DailyLogin:
                    this.townUIMenuBackground.setVisible(true)
                    break
            }
        })
    }

    private hideTownUIMenuBg(): void {
        if (!this.isDesktop) {
            this.townUIMenuBackground.setVisible(false)
        }
    }

    private setupUIButtons(): void {
        this.setupCircleButtons()

        this.cpPointButton = new CPPointUIButtonView(this.scene)

        if (!this.isDesktop) {
            this.menuGroupButton = new TownUIButtonView(this.scene)
            this.menuGroupButton.doInit(
                this.gameScreenWidth - 50,
                this.gameScreenHeight - 152,
                'menu-group',
                TownUIButtonType.MenuGroup,
                'MENU',
                1000,
                true
            )

            this.townUIButtonGroupView = new TownUIButtonGroupView(this.scene)
            this.townUIButtonGroupView.doInit()

            this.cpPointButton.doInit(this.gameScreenWidth - 25, 105, 'cp-point', '1,200')
        } else {
            this.setupZoomButtonGroup()
            this.setActionButtonZoom()

            this.cpPointButton.doInit(this.gameScreenWidth - 15, 105, 'cp-point', '1,200')
            this.cpPointButton.setContainerDepth(201)
            this.dailyLoginButton = new TownUIButtonView(this.scene)
            this.dailyLoginButton.doInit(
                this.gameScreenWidth - 195,
                this.gameScreenHeight - 60,
                'daily-login',
                TownUIButtonType.DailyLogin,
                'DAILY LOGIN'
            )

            this.minigameButton = new TownUIButtonView(this.scene)
            this.minigameButton.doInit(
                this.gameScreenWidth - 85,
                this.gameScreenHeight - 60,
                'minigame',
                TownUIButtonType.Minigame,
                'MINI GAME'
            )

            this.cookingButton = new TownUIButtonView(this.scene)
            this.cookingButton.doInit(305, this.gameScreenHeight - 60, 'cooking', TownUIButtonType.Cooking, 'COOKING')

            this.inventoryButton = new TownUIButtonView(this.scene)
            this.inventoryButton.doInit(
                195,
                this.gameScreenHeight - 60,
                'inventory',
                TownUIButtonType.Inventory,
                'MY INVENTORY'
            )

            this.collectionsButton = new TownUIButtonView(this.scene)
            this.collectionsButton.doInit(
                85,
                this.gameScreenHeight - 60,
                'collections',
                TownUIButtonType.Collections,
                'COLLECTIONS'
            )
        }
    }

    private setupActionButton() {
        this.menuGroupButton?.onClick(() => {
            this.townUIButtonNotificationManager.setMenuGroupIsUpdate(false)
            this.townUIPod.setIsShowMenuGroup(true)
        })

        this.dailyLoginButton?.onClick(() => {
            this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
            this.townUIPod.changeUIState(TownUIState.DailyLogin)
        })

        this.inventoryButton?.onClick(() => {
            this.townUIButtonNotificationManager.setInventoryIsUpdate(false)
            this.townUIPod.changeUIState(TownUIState.Inventory)
            this.townUIPod.setIsShowGuideline(false)
        })

        this.collectionsButton?.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.Collection)
            this.townUIPod.setIsShowGuideline(false)
        })

        this.cookingButton?.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.Cooking)
            this.townUIPod.setIsShowGuideline(false)
        })

        this.settingCircleButtonView?.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.Settings)
        })
    }

    private setupCircleButtons(): void {
        this.userProfileCircleButtonView = new TownUICircleButtonView(this.scene)
        this.userProfileCircleButtonView.doInit(this.gameScreenWidth - 115, 40, 'user-profile')

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
        this.cpLogoButton.doInit(50, this.userProfileCircleButtonView.y)
        if (this.isDesktop) {
            this.cpLogoButton.setContainerDepth(201)
        }
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
        this.zoomButtonGroupContainer.setPosition(this.gameScreenWidth - 60, this.gameScreenHeight - 205)
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
}
