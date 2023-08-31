import { GameObjects, Scene } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'

export class CPPointUIButtonView extends GameObjects.Container {
   public static readonly ICON_IMAGE_KEY: string = `-button-icon`
   private backgroundButton: Button
   private buttonIcon: GameObjects.Image
   private buttonText: GameObjects.Text

   constructor(scene: Scene) {
      super(scene)
      GameObjectConstructor(scene, this)
   }

   private CheckHoverOnButton(): void {
      this.backgroundButton.on('pointerover', () => {
         this.onHoverButton()
      })

      this.backgroundButton.on('pointerout', () => {
         this.onLeaveButton()
      })
   }

   private onHoverButton(): void {
      this.backgroundButton?.setBackgroundButtonTexture('cp-point-hover-button-bg')
      this.buttonText.setStyle({ fill: '#DF2B41' })
   }

   private onLeaveButton(): void {
      this.backgroundButton?.setBackgroundButtonTexture('cp-point-button-bg')
      this.buttonText.setStyle({ fill: '#D97837' })
   }

   public doInit(x: number, y: number, iconKey: string, buttonText?: string): void {
      this.backgroundButton = new Button(this.scene, 0, 0, 133, 50, 'cp-point-button-bg')
      this.buttonIcon = this.scene.add.image(-40, 2, iconKey + CPPointUIButtonView.ICON_IMAGE_KEY).setOrigin(0.5)

      this.buttonText = TextAdapter.instance
         .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
         .setText(buttonText)
         .setOrigin(0.5)
         .setPosition(15, -5)
         .setStyle({ fill: '#D97837', fontSize: 36 })

      this.add([this.backgroundButton, this.buttonIcon, this.buttonText])
      this.setPosition(x, y)

      if (this.scene.sys.game.device.os.desktop) {
         this.CheckHoverOnButton()
      }
   }
}
