import { GameObjects, Scene } from 'phaser'
import { Observable, Subscription, of, tap, timer } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Guideline/IngredientBean'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { AnimationController } from './AnimationController'
import { IngredientObjectBean } from './Bean/IngredientObjectBean'
import { ObjectAnimationBean } from './Bean/ObjectAnimationBean'
import { IngredientObjectPod } from './Pod/IngredientObjectPod'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { SuccessIndicatorView } from './SuccessIndicatorView'
import { ObjectAnimationState } from './Type/ObjectAnimationState'
import { ObjectAnimationType } from './Type/ObjectAnimationType'
import { ObjectAssetType } from './Type/ObjectAssetType'

export class IngredientObjectView extends GameObjects.Container {
   public static readonly SPINE_PATH: string = `assets/spines/`
   public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

   spineGameObject: SpineGameObject
   spriteImageObject: GameObjects.Image

   private stateAnimationSubscription: Subscription
   private indicatorSubscription: Subscription
   private timerAnimationSubscription: Subscription
   private endRepeatTimerAnimationSubscription: Subscription

   private isPickIngredient: boolean
   private isCanToggle: boolean
   private isReapet: boolean

   private textStatusMock: GameObjects.Text
   private buttonArea: GameObjects.Rectangle
   private currentTween: Phaser.Tweens.Tween

   private pod: IngredientObjectPod
   private townBuildingPod: TownBuildingPod

   constructor(scene: Scene, bean: IngredientObjectBean, isPickIngredient: boolean = false) {
      super(scene, 0, 0)
      GameObjectConstructor(scene, this)

      this.pod = new IngredientObjectPod(this.scene)
      this.pod.SetIngredientObjectBean(bean)
      this.townBuildingPod = PodProvider.instance.townbuildingPod

      this.isPickIngredient = isPickIngredient

      if (this.pod.ingredientObjectBean.isRandomizable) {
         if (!GameConfig.DEBUG_OBJECT) {
            this.setActive(false)
            this.setVisible(false)
         }
      }
   }

   public doInit(): Observable<any> {
      switch (this.pod.ingredientObjectBean.typeAsset) {
         case ObjectAssetType.Spine:
            let isLoop: boolean = this.pod.ingredientObjectBean.animationWithStateBeans[0].animTime == -1 ? true : false

            let spineConfig = {
               x: 0,
               y: 0,
               key: this.pod.ingredientObjectBean.keyAsset,
               path: IngredientObjectView.SPINE_PATH,
               startAnimation: this.pod.ingredientObjectBean.animationWithStateBeans[0].animKey,
               isLooping: isLoop,
            }

            return ResourceManager.instance.loadSpine(this.scene, spineConfig).pipe(
               tap((spine) => {
                  // console.log(spine)
                  this.spineGameObject = spine
                  this.add(this.spineGameObject as any)

                  this.setPlayer()
                  this.setInteractiveObject()
                  this.setSubscribe()
                  this.mockingWidthAndHeightCanInteract()
               })
            )
         case ObjectAssetType.Sprite:
            this.spriteImageObject = this.scene.add.image(0, 0, this.pod.ingredientObjectBean.keyAsset)
            this.add([this.spriteImageObject])

            this.setPlayer()
            this.setInteractiveObject()
            this.setSubscribe()
            this.mockingWidthAndHeightCanInteract()

            // if (this.pod.ingredientObjectBean.isRandomizable) this.spriteImageObject.setTexture('ingredient_7')

            return of(undefined)
         case ObjectAssetType.SpriteSheet:
            return of(undefined)
      }
   }

   private setPlayer(): void {
      switch (this.pod.ingredientObjectBean.typeAsset) {
         case ObjectAssetType.Spine:
            this.spineGameObject.setScale(this.pod.ingredientObjectBean.scaleX, this.pod.ingredientObjectBean.scaleY)

            this.setSize(
               this.pod.ingredientObjectBean.interactWidth != 0
                  ? this.pod.ingredientObjectBean.interactWidth
                  : this.spineGameObject.displayWidth,
               this.pod.ingredientObjectBean.interactHeight != 0
                  ? this.pod.ingredientObjectBean.interactHeight
                  : this.spineGameObject.displayHeight
            )
            break
         case ObjectAssetType.Sprite:
            this.spriteImageObject.setScale(this.pod.ingredientObjectBean.scaleX, this.pod.ingredientObjectBean.scaleY)

            this.setSize(
               this.pod.ingredientObjectBean.interactWidth != 0
                  ? this.pod.ingredientObjectBean.interactWidth
                  : this.spriteImageObject.displayWidth,
               this.pod.ingredientObjectBean.interactHeight != 0
                  ? this.pod.ingredientObjectBean.interactHeight
                  : this.spriteImageObject.displayHeight
            )
            break
         case ObjectAssetType.SpriteSheet:
            break
      }

      this.setDepth(this.pod.ingredientObjectBean.depth)

      if (GameConfig.DEBUG_OBJECT) {
         this.buttonArea?.setDisplaySize(this.width, this.height)
      }

      // console.log(this.width + ' : ' + this.height)
      // console.log(this.displayWidth + ' : ' + this.displayHeight)
      // console.log(this.spineGameObject.displayWidth + ' : ' + this.spineGameObject.displayHeight)
      // console.log(this.spineGameObject.width + ' : ' + this.spineGameObject.height)
      // console.log(this.spineGameObject.displayOriginX + ' : ' + this.spineGameObject.displayOriginY)
   }

   public setPositionContainer(isInContainer: boolean = false, x: number = 0, y: number = 0) {
      if (!isInContainer) {
         this.setPosition(
            this.scene.cameras.main.centerX + this.pod.ingredientObjectBean.positionX,
            this.scene.cameras.main.centerY + this.pod.ingredientObjectBean.positionY
         )
      } else {
         this.setPosition(x, y)
      }
   }

   private setSubscribe() {
      let animBean: ObjectAnimationBean
      this.stateAnimationSubscription = this.pod.currentAnimationState.subscribe((state) => {
         switch (state) {
            case ObjectAnimationState.Idle:
               console.log('Idle state')

               animBean = this.pod.ingredientObjectBean.animationWithStateBeans[0]
               this.isCanToggle = true

               this.playAnimation(animBean, ObjectAnimationState.Transition1)
               break
            case ObjectAnimationState.Transition1:
               console.log('Transition1')

               this.isCanToggle = false
               animBean = this.pod.ingredientObjectBean.animationWithStateBeans[1]
               this.playAnimation(animBean, ObjectAnimationState.End, () => {
                  this.doOnObjectActive()
               })
               break
            case ObjectAnimationState.End:
               console.log('End')

               animBean = this.pod.ingredientObjectBean.animationWithStateBeans[2]
               this.isCanToggle =
                  this.pod.ingredientObjectBean.typeAnimation == ObjectAnimationType.Toggle ||
                  this.pod.ingredientObjectBean.typeAnimation == ObjectAnimationType.Repeat
                     ? true
                     : false

               this.playAnimation(
                  animBean,
                  ObjectAnimationState.Transition2,
                  this.pod.ingredientObjectBean.typeAnimation == ObjectAnimationType.Repeat
                     ? () => {
                          if (this.isReapet) this.pod.ChangeAnimationState(ObjectAnimationState.End)
                       }
                     : undefined
               )
               break
            case ObjectAnimationState.Transition2:
               console.log('Transition2')

               this.isCanToggle = false
               animBean = this.pod.ingredientObjectBean.animationWithStateBeans[3]
               this.playAnimation(animBean, ObjectAnimationState.Idle)
               break
         }
      })
   }

   private playAnimation(
      objectAnimationBean: ObjectAnimationBean,
      nextState: ObjectAnimationState,
      callBack: Function = undefined
   ): void {
      switch (this.pod.ingredientObjectBean.typeAsset) {
         case ObjectAssetType.Spine:
            if (objectAnimationBean.animTime != -1) {
               this.spineGameObject.setAnimation(0, objectAnimationBean.animKey, false)

               this.timerAnimationSubscription?.unsubscribe()
               this.timerAnimationSubscription = timer(objectAnimationBean.animTime).subscribe((_) => {
                  if (callBack != null || callBack != undefined) {
                     callBack()
                  }
                  if (!this.isReapet) {
                     this.pod.ChangeAnimationState(nextState)
                  }
               })
            } else {
               this.spineGameObject.setAnimation(0, objectAnimationBean.animKey, true)
            }

            this.tweenWithID(objectAnimationBean)
            break
         case ObjectAssetType.Sprite:
            this.tweenWithID(objectAnimationBean)

            if (objectAnimationBean.animTime != -1) {
               this.timerAnimationSubscription?.unsubscribe()
               this.timerAnimationSubscription = timer(objectAnimationBean.animTime).subscribe((_) => {
                  if (callBack != null || callBack != undefined) {
                     callBack()
                  }
                  this.pod.ChangeAnimationState(nextState)
               })
            }

            break
         case ObjectAssetType.SpriteSheet:
            break
      }
   }

   private tweenWithID(objectAnimationBean: ObjectAnimationBean) {
      this.currentTween = AnimationController.instance.getTweenAnimationContainer(
         this.scene,
         this,
         this.pod.ingredientObjectBean.id,
         objectAnimationBean
      )
   }

   private doOnObjectActive() {
      if (
         this.pod.ingredientID != -1 &&
         !PodProvider.instance.guideLineUIManager.isAllFound.value &&
         !this.pod.isActiveObject
      ) {
         this.pod.isActiveObject = true
         this.townBuildingPod.interactObject(this.pod.ingredientID).subscribe((bean) => {
            //Remove when have backend api
            if (GameConfig.IS_MOCK_DATA) {
               timer(200).subscribe((_) => {
                  console.log('random Result : ' + bean.ingredientID)
                  this.doOnPickupItem(bean)
               })
            }
         })
      }
   }

   private setInteractiveObject() {
      this.setInteractionOnButtonPointerUp()
   }

   private setInteractionOnButtonPointerUp(): void {
      this.setInteractive().on('pointerup', () => {
         console.log('click interactive')
         if (this.isCanToggle) {
            if (
               this.pod.currentAnimationState.value == ObjectAnimationState.End &&
               this.pod.ingredientObjectBean.typeAnimation == ObjectAnimationType.Repeat
            ) {
               this.isReapet = true
               this.endRepeatTimerAnimationSubscription?.unsubscribe()
               this.endRepeatTimerAnimationSubscription = timer(
                  this.pod.ingredientObjectBean.animationWithStateBeans[2].animTime
               ).subscribe((_) => {
                  this.isReapet = false
               })
            } else {
               if (this.pod.currentAnimationState.value == ObjectAnimationState.Idle) {
                  this.pod.ChangeAnimationState(ObjectAnimationState.Transition1)
               }

               if (this.pod.currentAnimationState.value == ObjectAnimationState.End) {
                  this.pod.ChangeAnimationState(ObjectAnimationState.Transition2)
               }
            }
         }
      })
   }

   private doOnPickupItem(bean: IngredientBean) {
      let indicator = new SuccessIndicatorView(
         this.scene,
         this.scene.cameras.main.centerX + this.pod.ingredientObjectBean.positionX,
         this.scene.cameras.main.centerY + this.pod.ingredientObjectBean.positionY
      )
      bean.isFound = true //Change To Mutation API Update Bean To Server
      indicator.doInit(bean)
   }

   private mockingWidthAndHeightCanInteract() {
      if (GameConfig.DEBUG_OBJECT) {
         this.buttonArea = this.scene.add.rectangle(0, 0, this.width, this.height, 0xff0000, 0.1).disableInteractive()

         if (this.isPickIngredient) {
            this.textStatusMock = TextAdapter.instance
               .getVectorText(this.scene, 'FC_Lamoon_Bold')
               .setText('false' + `(${this.pod.ingredientObjectBean.depth})`)
               .setPosition(0, 60)
               .setOrigin(0.5, 0.5)
               .setStyle({
                  fill: 'Red',
                  fontSize: 30,
               })

            this.add([this.textStatusMock])
         }

         let textType = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText(`${this.pod.ingredientObjectBean.typeAnimation} : ID (${this.pod.ingredientObjectBean.id})`)
            .setPosition(0, 40)
            .setOrigin(0.5, 0.5)
            .setStyle({
               fill: 'Black',
               fontSize: 15,
            })

         this.add([this.buttonArea, textType])
      }
   }

   public setFoundIngredient(id: number) {
      this.pod.ingredientID = id

      if (this.pod.ingredientObjectBean.isRandomizable) {
         this.spriteImageObject.setTexture(IngredientObjectView.INGREDIENT_IMAGE_KEY + this.pod.ingredientID)

         this.setActive(true)
         this.setVisible(true)

         this.setPlayer()
      }
      if (GameConfig.DEBUG_OBJECT) {
         this.textStatusMock.setText('true' + `(${this.pod.ingredientObjectBean.depth})`)

         this.textStatusMock.setStyle({
            fill: 'Green',
            fontSize: 20,
         })

         let idIngredientText = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText(`ID Item : ${this.pod.ingredientID}`)
            .setPosition(0, 80)
            .setOrigin(0.5, 0.5)
            .setStyle({
               fill: 'Blue',
               fontSize: 20,
            })

         this.add([idIngredientText])
      }
   }
}
