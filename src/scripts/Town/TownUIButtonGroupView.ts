import { Actions, GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { TownUIButtonView } from './TownUIButtonView'
import { PodProvider } from '../pod/PodProvider'
import { TownUIState } from './Type/TownUIState'
import { TownUIButtonType } from './Type/TownUIButtonType'
import { TownUIButtonNotificationManager } from './TownUIButtonNotificationManager'

export class TownUIButtonGroupView extends GameObjects.Container {
   private dimBackground: GameObjects.Rectangle
   private buttonGroupBackground: GameObjects.Image
   private dailyLoginButton: TownUIButtonView
   private minigameButton: TownUIButtonView
   private cookingButton: TownUIButtonView
   private inventoryButton: TownUIButtonView
   private collectionsButton: TownUIButtonView
   private hideButton: TownUIButtonView
   private uiButtonList: TownUIButtonView[] = []
   private townUIButtonNotificationManager: TownUIButtonNotificationManager

   constructor(scene: Scene) {
      super(scene)
      GameObjectConstructor(scene, this)
   }

   private setupButtons(): void {
      this.collectionsButton = new TownUIButtonView(this.scene).setScale(0)
      this.collectionsButton.doInit(0, 0, 'collections', TownUIButtonType.Collections, 'COLLECTIONS')
      this.uiButtonList.push(this.collectionsButton)

      this.inventoryButton = new TownUIButtonView(this.scene).setScale(0)
      this.inventoryButton.doInit(0, 0, 'inventory', TownUIButtonType.Inventory, 'MY INVENTORY')
      this.inventoryButton.onClick(() => {
         this.townUIButtonNotificationManager.setInventoryIsUpdate(false)
      })
      this.uiButtonList.push(this.inventoryButton)

      this.cookingButton = new TownUIButtonView(this.scene).setScale(0)
      this.cookingButton.doInit(0, 0, 'cooking', TownUIButtonType.Cooking, 'COOKING')
      this.uiButtonList.push(this.cookingButton)

      this.dailyLoginButton = new TownUIButtonView(this.scene).setScale(0)
      this.dailyLoginButton.doInit(0, 0, 'daily-login', TownUIButtonType.DailyLogin, 'DAILY LOGIN')
      this.dailyLoginButton.onClick(() => {
         this.townUIButtonNotificationManager.setDailyLoginIsUpdate(false)
      })
      this.uiButtonList.push(this.dailyLoginButton)

      this.minigameButton = new TownUIButtonView(this.scene).setScale(0)
      this.minigameButton.doInit(0, 0, 'minigame', TownUIButtonType.Minigame, 'MINI GAME')
      this.uiButtonList.push(this.minigameButton)

      this.hideButton = new TownUIButtonView(this.scene).setScale(0)
      this.hideButton.doInit(0, 0, 'hide', TownUIButtonType.Hide, 'HIDE')
      this.hideButton.onClick(() => {
         PodProvider.instance.townUIPod.changeUIState(TownUIState.MainMenu)
      })
      this.uiButtonList.push(this.hideButton)

      this.uiButtonList = Actions.GridAlign(this.uiButtonList, {
         width: 3,
         height: 2,
         cellWidth: 110,
         cellHeight: 115,
         x: -110,
         y: -55,
      })

      this.add(this.uiButtonList)
      this.uiButtonList.forEach((uiButtonView) => {
         this.bringToTop(uiButtonView)
      })
   }

   public onShow(): void {
      this.setActive(true)
      this.setVisible(true)

      this.scene.add.tween({
         targets: this.dimBackground,
         duration: 300,
         props: { fillAlpha: { from: 0, to: 0.3 } },
         ease: 'cubic.inout',
      })

      this.scene.add.tween({
         targets: this.buttonGroupBackground,
         duration: 200,
         props: { scale: { from: 0, to: 1 } },
         ease: 'cubic.inout',
      })

      this.uiButtonList.forEach((buttonView) => {
         this.scene.add.tween({
            targets: buttonView,
            delay: 50,
            duration: 300,
            props: { scale: { from: 0, to: 1 } },
            ease: 'cubic.inout',
            onComplete: () => {
               this.dimBackground.setInteractive().once('pointerdown', () => {
                  PodProvider.instance.townUIPod.changeUIState(TownUIState.MainMenu)
               })
            },
         })
      })
   }

   public onHide(): void {
      this.dimBackground.fillAlpha = 0

      this.scene.add.tween({
         targets: this,
         duration: 200,
         props: { scale: { from: 1, to: 0 } },
         ease: 'cubic.inout',
         onComplete: () => {
            this.dimBackground.removeAllListeners()
            this.setActive(false)
            this.setVisible(false)
            this.setScale(1)
            this.uiButtonList.forEach((buttonView) => {
               buttonView.setScale(0)
            })
         },
      })
   }

   public doInit(): void {
      this.townUIButtonNotificationManager = PodProvider.instance.townUIButtonNotificationManager
      this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
      this.setDepth(6)
      this.dimBackground = this.scene.add
         .rectangle(0, 0, UIUtil.getCanvasWidth(), UIUtil.getCanvasHeight(), 0x000000, 0.3)
         .setOrigin(0.5)

      this.buttonGroupBackground = this.scene.add.image(0, 0, 'ui-button-group-bg').setOrigin(0.5)

      this.add([this.dimBackground, this.buttonGroupBackground])
      this.setupButtons()
   }
}
