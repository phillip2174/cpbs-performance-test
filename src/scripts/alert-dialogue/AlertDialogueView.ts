import { GameObjects, Scene } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'

export class AlertDialogueView extends GameObjects.GameObject {
   container: GameObjects.Container
   headerText: GameObjects.Text
   descriptionText: GameObjects.Text
   yesButton: Button
   noButton: Button
   confirmButton: Button
   sprite: GameObjects.Sprite
   background: GameObjects.Image
   dim: GameObjects.Rectangle

   hideCallback: () => any
   showCallback: () => any
   exitButton: Button

   constructor(scene: Scene) {
      super(scene, 'gameobject')
      GameObjectConstructor(scene, this)
      this.container = this.scene.add.container(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
      this.container.setDepth(100)

      this.dim = this.scene.add
         .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.7)
         .setOrigin(0.5, 0.5)
      this.container.add(this.dim)

      this.background = this.scene.add.image(0, -45, 'alert-panel').setOrigin(0.5, 0.5).setScale(0.05, 0.1)

      this.dim.setInteractive()
      this.container.add(this.background)
   }

   createYesButton(onClickCallback: () => any, textInButton: string): void {
      this.yesButton = new Button(this.scene, -100, 160, 174, 88.5, 'button_confirm', 1000, textInButton)

      this.yesButton.setBackgroundButtonTexture('guideline-bg')
      //this.yesButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'confirm_button.png')
      this.yesButton.setButtonSize(174, 88.5)

      this.yesButton.setTextStyle({
         fill: 'white',
         fontSize: 30,
         fontFamily: 'PSL245pro',
      })

      this.yesButton.setTextPosition(0, 0.5)
      this.yesButton.onClick(() => {
         this.hide()
         onClickCallback?.()
         this.yesButton.setCanInteract(false)
         this.noButton.setCanInteract(false)
      })
      this.container.add(this.yesButton)
   }

   createNoButton(onClickCallback: () => any, textInButton: string): void {
      this.noButton = new Button(this.scene, 100, 160, 174, 88.5, 'button_cancel', 1000, textInButton)
      this.noButton.setBackgroundButtonTexture('guideline-bg')
      //this.noButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'cancel_button.png')
      this.noButton.setButtonSize(174, 88.5)

      this.noButton.setTextStyle({
         fill: 'white',
         fontSize: 30,
         fontFamily: 'PSL245pro',
      })

      this.noButton.setTextPosition(0, 0.5)
      this.noButton.onClick(() => {
         this.hide(() => {
            this.noButton.setCanInteract(true)
         })
         onClickCallback?.()
         this.yesButton.setCanInteract(false)
         this.noButton.setCanInteract(false)
      })
      this.container.add(this.noButton)
   }

   createConfirmButton(onClickCallback: () => any, textInButton: string): void {
      this.confirmButton = new Button(this.scene, 0, 160, 174, 88.5, 'button_confirm', 1000, textInButton)
      this.confirmButton.setBackgroundButtonTexture('guideline-bg')
      //this.confirmButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'confirm_button.png')
      this.confirmButton.setButtonSize(174, 88.5)

      this.confirmButton.setTextStyle({
         fill: 'white',
         fontSize: 30,
         fontFamily: 'PSL245pro',
      })

      this.confirmButton.onClick(() => {
         onClickCallback?.()
         this.hide()
         this.confirmButton.setCanInteract(false)
      })
      this.container.add(this.confirmButton)
   }

   createExitButton(onClickCallback: () => any): void {
      this.exitButton = new Button(this.scene, 305, -298, 90, 90, 'button_exit', 1000)
      this.exitButton.setBackgroundButtonTexture('guideline-bg')
      //this.exitButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'exit_button.png')
      this.exitButton.setButtonSize(90, 90)

      this.exitButton.onClick(() => {
         onClickCallback?.()
         this.hide()
         this.exitButton.setCanInteract(false)
      })
      this.container.add(this.exitButton)
   }

   createHeaderText(headerText: string): void {
      this.headerText = TextAdapter.instance
         .getVectorText(this.scene, 'PSL245pro')
         .setPosition(0, -130)
         .setOrigin(0.5, 0.5)
         .setText(headerText)
         .setAlign('center')
         .setStyle({
            fill: 'Red',
            fontSize: 55,
         })
      this.headerText.setOrigin(0.5, 0.5)
      this.container.add(this.headerText)
   }

   getHeader() {
      return this.headerText
   }

   createDescriptionText(decriptionText: string): void {
      this.descriptionText = TextAdapter.instance
         .getVectorText(this.scene, 'PSL245pro')
         .setPosition(0, -50)
         .setOrigin(0.5, 0.5)
         .setText(decriptionText)
         .setAlign('center')
         .setStyle({
            fill: 'gray',
            fontSize: 30,
         })
      this.descriptionText.setOrigin(0.5, 0.5)
      this.container.add(this.descriptionText)
   }

   show(onShowFinishCallback?: () => any) {
      this.scene.tweens.add({
         targets: this.container,
         ease: `Quad.easeOut`,
         duration: 300,
         alpha: 1,
         onStart: () => {
            this.container.setActive(true)
         },
         onComplete: () => {
            onShowFinishCallback?.()
         },
      })
   }

   hide(onHideFinishCallback?: () => any) {
      this.scene.tweens.add({
         targets: this.container,
         ease: `Quad.easeIn`,
         duration: 300,
         alpha: 0,
         onComplete: () => {
            onHideFinishCallback?.()
            this.container.setActive(false)
            this.destroy(true)
         },
      })
   }

   setDepth(depth: number) {
      this.container.setDepth(depth)
   }

   doDestroy() {
      this.container.destroy()
      this.dim.destroy()
   }
}
