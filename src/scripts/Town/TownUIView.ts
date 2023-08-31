import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { CountdownManager } from '../Countdown/CountdownManager'
import { GuideLineUIView } from '../Guideline/GuideLineUIView'
import { CameraControlView } from '../camera/CameraControlView'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { PodProvider } from '../pod/PodProvider'
import { CPPointUIButtonView } from './CPPointUIButtonView'
import { TownUIPod } from './Pod/TownUIPod'
import { TownUIButtonGroupView } from './TownUIButtonGroupView'
import { TownUIButtonView } from './TownUIButtonView'
import { TownUICircleButtonView } from './TownUICircleButtonView'
import { TownUIState } from './Type/TownUIState'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'

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
   private cpLogoButton: GameObjects.Image
   private cpPointButton: CPPointUIButtonView
   private uiStateDisposable: Subscription
   private townUIPod: TownUIPod
   private separateButtonLine: GameObjects.Rectangle
   private townUIButtonNotificationManager: TownUIButtonNotificationManager

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
      this.cpPointButton.doInit(UIUtil.getCanvasWidth() - 83, 105, 'cp-point', '1,200')

      if (!this.scene.sys.game.device.os.desktop) {
         this.menuGroupButton = new TownUIButtonView(this.scene)
         this.menuGroupButton.doInit(
            UIUtil.getCanvasWidth() - 70,
            UIUtil.getCanvasHeight() - 152,
            'menu-group',
            TownUIButtonType.MenuGroup
         )
         this.menuGroupButton.onClick(() => {
            this.townUIButtonNotificationManager.setMenuGroupIsUpdate(false)
            this.townUIPod.changeUIState(TownUIState.MenuButtonGroup)
         })
      } else {
         this.dailyLoginButton = new TownUIButtonView(this.scene)
         this.dailyLoginButton.doInit(
            UIUtil.getCanvasWidth() - 200,
            UIUtil.getCanvasHeight() - 60,
            'daily-login',
            TownUIButtonType.DailyLogin,
            'DAILY LOGIN'
         )
         this.dailyLoginButton.onClick(() => {
            this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
         })

         this.minigameButton = new TownUIButtonView(this.scene)
         this.minigameButton.doInit(
            UIUtil.getCanvasWidth() - 85,
            UIUtil.getCanvasHeight() - 60,
            'minigame',
            TownUIButtonType.Minigame,
            'MINI GAME'
         )

         this.cookingButton = new TownUIButtonView(this.scene)
         this.cookingButton.doInit(315, UIUtil.getCanvasHeight() - 60, 'cooking', TownUIButtonType.Cooking, 'COOKING')

         this.inventoryButton = new TownUIButtonView(this.scene)
         this.inventoryButton.doInit(
            200,
            UIUtil.getCanvasHeight() - 60,
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
            UIUtil.getCanvasHeight() - 60,
            'collections',
            TownUIButtonType.Collections,
            'COLLECTIONS'
         )
      }
   }

   private setupCircleButtons(): void {
      console.log(UIUtil.getCanvasWidth() + ':' + UIUtil.getCanvasHeight())
      this.userProfileCircleButtonView = new TownUICircleButtonView(this.scene)
      this.userProfileCircleButtonView.doInit(UIUtil.getCanvasWidth() - 115, 40, 'user-profile')

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

   public doInit(camera: CameraControlView): void {
      this.townUIPod = PodProvider.instance.townUIPod
      this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
      this.cameraControlView = camera

      this.guideLineUIView = new GuideLineUIView(this.scene)
      this.guideLineUIView.doInit()

      this.countdownManager = new CountdownManager(this.scene)
      this.countdownManager.doInit(this.cameraControlView)

      this.setupUIButtons()
      this.setupSubscribe()
   }
}
