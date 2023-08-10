import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { IngredientBean } from './IngredientBean'
import { GuideLineUICellPod } from './GuideLineUICellPod'
import { Subscription } from 'rxjs'
import { GuideLineUICellState } from './GuideLineUICellState'
import { PodProvider } from '../pod/PodProvider'

export class GuideLineUICellView extends GameObjects.Container {
   public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
   public static readonly INGREDIENT_IMAGE_NOTFOUND_KEY: string = `ingredient_bw_`
   public ingredientBean: IngredientBean
   private ingredientImage: GameObjects.Image
   private backgroundImage: GameObjects.Image

   private pod: GuideLineUICellPod
   private stateSubscription: Subscription

   constructor(scene: Scene, ingredientBean: IngredientBean) {
      super(scene)
      GameObjectConstructor(scene, this)
      this.ingredientBean = ingredientBean
      this.pod = new GuideLineUICellPod(this.scene)

      if (this.ingredientBean.isFound) this.pod.changeState(GuideLineUICellState.IdleFound)
      else this.pod.changeState(GuideLineUICellState.IdleNotFound)
   }

   public doInit(x: number, y: number) {
      this.ingredientImage = this.scene.add
         .image(x, y, GuideLineUICellView.INGREDIENT_IMAGE_NOTFOUND_KEY + this.ingredientBean.ingredientID)
         .setScale(0.3)
         .setDepth(1)

      this.stateSubscription = this.pod.guideLineUICellState.subscribe((state) => {
         switch (state) {
            case GuideLineUICellState.IdleFound:
               this.ingredientImage.setTexture(
                  GuideLineUICellView.INGREDIENT_IMAGE_KEY + this.ingredientBean.ingredientID
               )
               break
            case GuideLineUICellState.IdleNotFound:
               this.ingredientImage.setTexture(
                  GuideLineUICellView.INGREDIENT_IMAGE_NOTFOUND_KEY + this.ingredientBean.ingredientID
               )
               break
            case GuideLineUICellState.TweenToFound:
               this.tweenGuideLine()
               break
         }
      })
      this.backgroundImage = this.scene.add.image(x, y, 'bg_guideline').setScale(0.8)
   }

   private tweenGuideLine() {
      this.scene.add.tween({
         targets: this.ingredientImage,
         ease: 'cubic.inout',
         duration: 500,
         props: {
            scale: { from: 0.3, to: 0 },
         },
         onComplete: () => {
            this.ingredientImage.setTexture(GuideLineUICellView.INGREDIENT_IMAGE_KEY + this.ingredientBean.ingredientID)

            this.scene.add.tween({
               targets: this.ingredientImage,
               ease: 'cubic.inout',
               duration: 500,
               props: {
                  scale: { from: 0, to: 0.3 },
               },
               onComplete: () => {
                  this.ingredientBean.isFound = true
                  PodProvider.instance.guideLineUIManager.checkIsAllIngredientFound()
               },
            })
         },
      })
   }

   public updateCellView() {
      console.log('update cellview')
      this.pod.changeState(GuideLineUICellState.TweenToFound)
   }

   public destroy(fromScene?: boolean): void {
      if (!fromScene) {
         this.ingredientImage?.destroy()
         this.backgroundImage?.destroy()
      }
      this.stateSubscription?.unsubscribe()
      super.destroy(fromScene)
   }
}
