import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { CountdownManager } from '../Countdown/CountdownManager'
import { GuideLineUIView } from '../Guideline/GuideLineUIView'
import { CameraControlPod } from '../camera/CameraControlPod'
import { CameraControlView } from '../camera/CameraControlView'
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

export class TownUIView extends GameObjects.GameObject {
   private guideLineUIView: GuideLineUIView
   private countdownManager: CountdownManager
   private cameraControlView: CameraControlView
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
   private cpLogoButton: GameObjects.Image
   private cpPointButton: CPPointUIButtonView
   private uiStateDisposable: Subscription
   private townUIPod: TownUIPod
   private separateButtonLine: GameObjects.Rectangle
   private townUIButtonNotificationManager: TownUIButtonNotificationManager
   private townUIMenuBackground: GameObjects.NineSlice
   private gameScreenWidth: number = this.scene.cameras.main.width
   private gameScreenHeight: number = this.scene.cameras.main.height
   private cameraControlPod: CameraControlPod

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   private setupSubscribe(): void {
      this.uiStateDisposable = this.townUIPod.townUIState.subscribe((state) => {
         switch (state) {
            case TownUIState.MainMenu:
               this.hideMenuButtonGroup()
               break
            case TownUIState.MenuButtonGroup:
               this.showMenuButtonGroup()
               break
         }
      })
   }

   private hideMenuButtonGroup(): void {
      this.townUIButtonGroupView?.onHide()
      this.cameraControlView.enableCameraMovements()
   }

   private showMenuButtonGroup(): void {
      if (this.townUIButtonGroupView == undefined) {
         this.townUIButtonGroupView = new TownUIButtonGroupView(this.scene)
         this.townUIButtonGroupView.doInit()
      }
      this.townUIButtonGroupView?.onShow()
      this.cameraControlView.disableCameraMovements()
   }

   private setupUIButtons(): void {
      this.setupCircleButtons()

      this.cpPointButton = new CPPointUIButtonView(this.scene)
      this.cpPointButton.doInit(this.gameScreenWidth - 83, 105, 'cp-point', '1,200')

      if (!this.scene.sys.game.device.os.desktop) {
         this.menuGroupButton = new TownUIButtonView(this.scene)
         this.menuGroupButton.doInit(
            this.gameScreenWidth - 50,
            this.gameScreenHeight - 152,
            'menu-group',
            TownUIButtonType.MenuGroup
         )
         this.menuGroupButton.onClick(() => {
            this.townUIButtonNotificationManager.setMenuGroupIsUpdate(false)
            this.townUIPod.changeUIState(TownUIState.MenuButtonGroup)
         })
      } else {
         this.setupZoomButtonGroup()

         this.dailyLoginButton = new TownUIButtonView(this.scene)
         this.dailyLoginButton.doInit(
            this.gameScreenWidth - 195,
            this.gameScreenHeight - 60,
            'daily-login',
            TownUIButtonType.DailyLogin,
            'DAILY LOGIN'
         )
         this.dailyLoginButton.onClick(() => {
            this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
         })

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
         this.inventoryButton.onClick(() => {
            this.townUIButtonNotificationManager.setInventoryIsUpdate(false)
         })

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

      this.cpLogoButton = this.scene.add.image(50, this.userProfileCircleButtonView.y, 'cp-logo').setOrigin(0.5)

      this.cpLogoButton.setInteractive().on('pointerdown', () => {
         console.log('Linking Out To CP Page')
      })
   }

   private setupZoomButtonGroup(): void {
      let zoomButtonOffsetY = 28
      let midZoomValue =
         (this.cameraControlPod.maxCameraZoom - this.cameraControlPod.minCameraZoom) / 2 +
         this.cameraControlPod.minCameraZoom
      this.zoomButtonGroupContainer = this.scene.add.container()

      this.zoomButtonGroupBackground = this.scene.add.image(0, 0, 'zoom-button-group-bg')

      this.zoomInCircleButtonView = new TownUICircleButtonView(this.scene)
      this.zoomInCircleButtonView.doInit(
         0,
         this.zoomButtonGroupBackground.y - zoomButtonOffsetY,
         'zoom-in',
         TownUIButtonType.Zoom
      )
      this.zoomInCircleButtonView.onClick(() => {
         if (
            this.cameraControlView.getCameraZoom() < midZoomValue &&
            this.cameraControlView.getCameraZoom() >= this.cameraControlPod.minCameraZoom
         ) {
            this.cameraControlView.setCameraZoom(midZoomValue)
            this.zoomOutCircleButtonView.setInteractable(true)
         } else if (
            this.cameraControlView.getCameraZoom() >= midZoomValue &&
            this.cameraControlView.getCameraZoom() < this.cameraControlPod.maxCameraZoom
         ) {
            this.cameraControlView.setCameraZoom(this.cameraControlPod.maxCameraZoom)
            this.zoomInCircleButtonView.setInteractable(false)
         }
      })

      this.zoomOutCircleButtonView = new TownUICircleButtonView(this.scene)
      this.zoomOutCircleButtonView.doInit(
         0,
         this.zoomButtonGroupBackground.y + zoomButtonOffsetY,
         'zoom-out',
         TownUIButtonType.Zoom
      )
      this.zoomOutCircleButtonView.setInteractable(false)
      this.zoomOutCircleButtonView.onClick(() => {
         if (
            this.cameraControlView.getCameraZoom() <= midZoomValue &&
            this.cameraControlView.getCameraZoom() > this.cameraControlPod.minCameraZoom
         ) {
            this.cameraControlView.setCameraZoom(this.cameraControlPod.minCameraZoom)
            this.zoomOutCircleButtonView.setInteractable(false)
         } else if (
            this.cameraControlView.getCameraZoom() > midZoomValue &&
            this.cameraControlView.getCameraZoom() <= this.cameraControlPod.maxCameraZoom
         ) {
            this.cameraControlView.setCameraZoom(midZoomValue)
            this.zoomInCircleButtonView.setInteractable(true)
         }
      })

      this.cameraControlView.zoomInButton = this.zoomInCircleButtonView
      this.cameraControlView.zoomOutButton = this.zoomOutCircleButtonView

      this.zoomButtonGroupContainer.add([
         this.zoomButtonGroupBackground,
         this.zoomInCircleButtonView,
         this.zoomOutCircleButtonView,
      ])
      this.zoomButtonGroupContainer.setPosition(this.gameScreenWidth - 60, this.gameScreenHeight - 205)
   }

   public doInit(camera: CameraControlView): void {
      this.townUIPod = PodProvider.instance.townUIPod
      this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
      this.cameraControlPod = PodProvider.instance.cameraControlPod
      this.cameraControlView = camera

      this.townUIMenuBackground = this.scene.add.nineslice(
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

      this.guideLineUIView = new GuideLineUIView(this.scene)
      this.guideLineUIView.doInit()

      this.countdownManager = new CountdownManager(this.scene)
      this.countdownManager.doInit(this.cameraControlView)

      this.setupUIButtons()
      this.setupSubscribe()
   }
}
