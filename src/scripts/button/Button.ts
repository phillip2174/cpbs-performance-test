import 'phaser'
import { NineSlice } from 'phaser3-nineslice'
import { timer } from 'rxjs'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { ButtonStyleConfig } from './button-style/ButtonStyleConfig'

export class Button extends Phaser.GameObjects.Container {
   //private static readonly INTERACT_DELAY: number = 1000

   declare scene: Phaser.Scene
   background: Phaser.GameObjects.Sprite
   backgroundSlice: NineSlice

   label: Phaser.GameObjects.Text
   labelSize: {}
   callback: Function
   callbackOnHold: Function

   private buttonPositionX: number
   private buttonPositionY: number
   private buttonWidth: number
   private buttonHeight: number
   private intertactDelay: number

   private interactScaleDown: number = 0.9
   private defaultScale: number = 1

   private isOnPointerDown: boolean
   private isCanInteract: boolean = true
   private isOnInteractDelay: boolean
   private isButtonTween: boolean

   private onClickDownTweener: Phaser.Tweens.Tween
   private onClickUpTweener: Phaser.Tweens.Tween
   private onButtonIdleTweener: Phaser.Tweens.Tween

   constructor(
      scene: Phaser.Scene,
      x: number,
      y: number,
      width: number,
      height: number,
      bgKey: string,
      delay: number = 1000,
      txt: string = ``
   ) {
      super(scene, x, y)
      this.buttonPositionX = x
      this.buttonPositionY = y
      this.buttonWidth = width
      this.buttonHeight = height
      this.intertactDelay = delay

      this.scene = scene
      this.setSize(width, height)
      this.scene.add.existing(this)
      this.setBg(null, bgKey)
      this.setButtonSize(width, height)
      this.isButtonTween = true

      this.label = TextAdapter.instance
         .getVectorText(this.scene, 'PSL245pro')
         .setPosition(0, -10)
         .setOrigin(0.5)
         .setText(txt)
         .setStyle({
            fontFamily: 'PSL245pro',
            fill: 'white',
            fontSize: 50,
         })

      this.setPosition(x, y)
      this.add([this.background, this.label])

      this.setInteractiveButton()
      this.createTweener()
      if (this.onButtonIdleTweener != undefined) this.onButtonIdleTweener.restart()
   }

   private setInteractiveButton() {
      this.setInteractionOnButtonPointerDown()
      this.setInteractionOnButtonPointerUp()
      this.setInteractionOnButtonPointerOut()
      this.setInteractionOnButtonPointerOutside()
   }

   private createTweener(): void {
      this.onClickDownTweener = this.scene.tweens.add({
         targets: this,
         scaleX: {
            value: this.interactScaleDown,
            duration: 100,
            yoyo: false,
            ease: `Quad.easeIn`,
         },
         scaleY: {
            value: this.interactScaleDown,
            duration: 100,
            yoyo: false,
            ease: `Cubic.easeIn`,
         },
      })

      this.onClickUpTweener = this.scene.tweens.add({
         targets: this,
         scaleX: {
            value: this.defaultScale,
            duration: 100,
            yoyo: false,
            ease: `Quad.easeIn`,
         },
         scaleY: {
            value: this.defaultScale,
            duration: 100,
            yoyo: false,
            ease: `Cubic.easeIn`,
         },
         onComplete: () => {
            if (this.onButtonIdleTweener != undefined) this.onButtonIdleTweener.restart()
         },
      })
   }

   public setIdleTween(idleTweenProfile: object): void {
      this.onButtonIdleTweener = this.scene.tweens.add(idleTweenProfile)
   }

   private setInteractionOnButtonPointerDown(): void {
      this.setInteractive().on('pointerdown', () => {
         if (!this.isCanInteract || this.isOnInteractDelay) return

         if (this.onButtonIdleTweener != undefined) this.onButtonIdleTweener.stop()

         if (this.isButtonTween) {
            this.onClickDownTweener.restart()
         }
         if (this.callbackOnHold != null) {
            if (!this.isOnInteractDelay) {
               this.callbackOnHold()
            }
         }
         this.isOnPointerDown = true
      })
   }

   private setInteractionOnButtonPointerUp(): void {
      this.setInteractive().on('pointerup', () => {
         if (!this.isCanInteract || this.isOnInteractDelay) return

         if (this.isOnPointerDown) {
            if (this.isButtonTween) {
               this.onClickUpTweener.restart()
            }
            if (this.callback != null) {
               if (!this.isOnInteractDelay) {
                  this.callback()
                  this.isOnInteractDelay = true
                  timer(this.intertactDelay).subscribe(() => {
                     this.isOnInteractDelay = false
                  })
               }
            }
            this.isOnPointerDown = false
         }
      })
   }

   private setInteractionOnButtonPointerOut(): void {
      this.setInteractive().on('pointerout', () => {
         this.onButtonPointerOutOrOutside()
      })
   }

   private setInteractionOnButtonPointerOutside(): void {
      this.setInteractive().on('pointerupoutside', () => {
         this.onButtonPointerOutOrOutside()
      })
   }

   private onButtonPointerOutOrOutside(): void {
      if (this.isOnPointerDown) {
         this.onClickUpTweener.restart()
         if (this.callbackOnHold != null) {
            if (!this.callback != null) {
               this.callback()
            }
         }
         this.isOnPointerDown = false
      }
   }

   private setBg(bgSpriteKey: string, bgKey: string) {
      if (bgSpriteKey != null || bgSpriteKey != undefined)
         this.background = this.scene.add.sprite(0, 0, bgSpriteKey, bgKey).setOrigin(0.5)
      else this.background = this.scene.add.sprite(0, 0, bgKey).setOrigin(0.5)
   }

   setNineSlice(buttonStyleObject: ButtonStyleConfig): void {
      let imageKey = `${buttonStyleObject.imageKey}_slice`
      if (this.scene.textures.exists(imageKey)) this.scene.textures.remove(imageKey)

      this.scene.textures.addImage(
         imageKey,
         this.scene.textures.get(buttonStyleObject.imageKey).getSourceImage() as HTMLImageElement
      )

      this.backgroundSlice = this.scene.add
         .nineslice(
            0,
            0,
            this.buttonWidth,
            this.buttonHeight,
            imageKey,
            buttonStyleObject.offset,
            buttonStyleObject.safeAreaOffset
         )
         .setOrigin(0.5)

      this.background.setVisible(false)
      this.add([this.backgroundSlice])
      this.sendToBack(this.backgroundSlice)
   }

   onClick(callback: Function, holdCallback: Function = null): void {
      this.callback = callback
      this.callbackOnHold = holdCallback
   }

   setText(txt: string): void {
      this.label.setText(txt)
   }

   setTextSize(size: number) {
      this.label.setFontSize(size)
      this.label.setOrigin(0.5, 0.5)
   }

   setButtonSize(widht: number, height: number) {
      this.background.setSize(widht, height)
      this.background.setDisplaySize(widht, height)

      if (this.backgroundSlice) this.backgroundSlice.resize(widht, height)

      this.setSize(widht, height)
      this.setDisplaySize(widht, height)

      if (this.input) this.input.hitArea.setSize(widht, height)

      this.buttonWidth = widht
      this.buttonHeight = height
   }

   setButtonDepth(value: number) {
      this.setDepth(value)
   }

   setInteractScale(value: number) {
      this.interactScaleDown = value
   }

   setDefaultScale(value: number) {
      this.defaultScale = value
   }

   setCanInteract(value: boolean, isAlpha: boolean = true) {
      this.isCanInteract = value

      if (value) {
         this.setInteractive()
      } else {
         this.disableInteractive()
      }

      if (isAlpha) this.changeButtonCanInteractGraphic(value)
   }

   setTextPosition(x: number, y: number) {
      this.label.setPosition(x, y)
   }

   setTextOrigin(x: number, y: number) {
      this.label.setOrigin(x, y)
   }

   setTextStyle(style: object) {
      this.label.setStyle(style)
   }

   setBackgroundButtonTexture(key: string) {
      this.background.setTexture(key)
   }

   setBackgroundButtonTextureWithAtlas(key: string, textureKey: string) {
      this.background.setTexture(key, textureKey)
   }

   setBackgroundButtonOrigin(x: number, y: number) {
      this.background.setOrigin(x, y)
      if (this.backgroundSlice) this.backgroundSlice.setOrigin(x, y)
   }

   fitToText(offsetX: number = 0, offsetY: number = 0) {
      this.setButtonSize(this.label.width + offsetX * 2, this.label.height + offsetY * 2)
   }

   setNativeSize() {
      this.background.setScale(1, 1)
      this.setButtonSize(this.background.displayWidth, this.background.displayHeight)
   }

   horizontalFitToText(offsetX: number) {
      this.setButtonSize(this.label.width + offsetX * 2, this.background.height)
   }

   fitToBorder() {
      TextAdapter.autoSizeTextInBound(this.label, this.background.width)
   }

   private changeButtonCanInteractGraphic(value: boolean) {
      if (!value) this.setAlpha(0.5)
      else this.setAlpha(1)
   }
}
