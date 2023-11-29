import { GameObjects, Scene } from 'phaser'
import { Observable, Subscription, of, tap, timer } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Ingredient/IngredientBean'
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
import { CameraControlPod } from '../camera/CameraControlPod'
import { TutorialStepState } from '../../Tutorial/TutorialStepState'
import { TutorialState } from '../../Tutorial/TutorialState'
import { AudioManager } from '../Audio/AudioManager'

export class IngredientObjectView extends GameObjects.Container {
    public static readonly SPINE_PATH: string = `assets/spines/`
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

    spineGameObject: SpineGameObject
    spriteImageObject: GameObjects.Image
    spriteSheetObject: GameObjects.Sprite

    private interactZone: GameObjects.Rectangle

    private stateAnimationSubscription: Subscription
    private indicatorSubscription: Subscription
    private timerAnimationSubscription: Subscription
    private endRepeatTimerAnimationSubscription: Subscription

    private isPickIngredient: boolean
    private isCanToggle: boolean
    private isReapet: boolean
    private isInContainer: boolean
    private isPointerDown: boolean

    private textStatusMock: GameObjects.Text
    private currentTween: Phaser.Tweens.Tween

    private audioManager: AudioManager

    private pod: IngredientObjectPod
    private townBuildingPod: TownBuildingPod
    private cameraPod: CameraControlPod

    constructor(scene: Scene, bean: IngredientObjectBean, isPickIngredient: boolean = false) {
        super(scene, 0, 0)
        GameObjectConstructor(scene, this)

        this.pod = new IngredientObjectPod(this.scene)
        this.pod.SetIngredientObjectBean(bean)
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.cameraPod = PodProvider.instance.cameraControlPod
        this.audioManager = PodProvider.instance.audioManager

        this.isPickIngredient = isPickIngredient

        if (this.pod.ingredientObjectBean.isRandomizable) {
            if (!GameConfig.DEBUG_OBJECT) {
                this.setActive(false)
                this.setVisible(false)
            }
        }
    }

    public doInit() {
        let bean: IngredientObjectBean = this.pod.ingredientObjectBean
        switch (bean.typeAsset) {
            case ObjectAssetType.Spine:
                let isLoop: boolean = bean.animationWithStateBeans[0].animTime == -1 ? true : false

                let spineConfig = {
                    x: 0,
                    y: 0,
                    key: bean.keyAsset,
                    startAnimation: bean.animationWithStateBeans[0].animKey,
                    isLooping: isLoop,
                }

                this.spineGameObject = this.scene.add.spine(
                    spineConfig.x,
                    spineConfig.y,
                    spineConfig.key,
                    spineConfig.startAnimation,
                    spineConfig.isLooping
                )

                this.add(this.spineGameObject as any)

                this.setPlayer()
                this.setInteractiveObject()
                this.setSubscribe()
                this.debugInteract()

                break

            case ObjectAssetType.Sprite:
                this.spriteImageObject = this.scene.add.image(0, 0, bean.keyAsset)
                this.add([this.spriteImageObject])

                this.setPlayer()
                this.setInteractiveObject()
                this.setSubscribe()
                this.debugInteract()

                // if (this.pod.ingredientObjectBean.isRandomizable) this.spriteImageObject.setTexture('ingredient_7')
                break
            case ObjectAssetType.SpriteSheet:
                this.spriteSheetObject = this.scene.add.sprite(0, 0, bean.keyAsset)
                this.add([this.spriteSheetObject])

                this.setPlayer()
                this.setInteractiveObject()
                this.setSubscribe()
                this.debugInteract()
                break
        }
    }

    public getIngredientObjectBean(): IngredientObjectBean {
        return this.pod.ingredientObjectBean
    }
    private setPlayer(): void {
        let bean = this.pod.ingredientObjectBean

        switch (bean.typeAsset) {
            case ObjectAssetType.Spine:
                this.spineGameObject.setScale(bean.scaleX, bean.scaleY)

                break
            case ObjectAssetType.Sprite:
                this.spriteImageObject.setScale(bean.scaleX, bean.scaleY)

                break
            case ObjectAssetType.SpriteSheet:
                this.spriteSheetObject.setScale(bean.scaleX, bean.scaleY)
                break
        }

        this.interactZone = this.scene.add.rectangle(
            bean.interactX,
            bean.interactY,
            bean.interactWidth,
            bean.interactHeight,
            0xff0000,
            GameConfig.DEBUG_OBJECT ? 0.1 : 0
        )

        this.add(this.interactZone)

        this.setDepth(bean.depth)
    }

    public setPositionContainer(isInContainer: boolean = false, x: number = 0, y: number = 0) {
        let ingredientBean = this.pod.ingredientObjectBean

        this.isInContainer = isInContainer

        if (!this.isInContainer) {
            this.setPosition(
                this.scene.cameras.main.centerX + ingredientBean.positionX,
                this.scene.cameras.main.centerY + ingredientBean.positionY
            )
        } else {
            this.setPosition(x, y)
        }
    }

    private setSubscribe() {
        let animBean: ObjectAnimationBean
        let typeAnimation: ObjectAnimationType = this.pod.ingredientObjectBean.typeAnimation
        this.stateAnimationSubscription = this.pod.currentAnimationState.subscribe((state) => {
            switch (state) {
                case ObjectAnimationState.Idle:
                    animBean = this.pod.getObjectAnimationBeanWithIndex(0)
                    this.isCanToggle = true

                    this.playAnimation(animBean, ObjectAnimationState.Transition1)
                    break
                case ObjectAnimationState.Transition1:
                    this.isCanToggle = false
                    animBean = this.pod.getObjectAnimationBeanWithIndex(1)
                    this.playAnimation(animBean, ObjectAnimationState.End, () => {
                        this.doOnObjectActive()
                    })
                    break
                case ObjectAnimationState.End:
                    animBean = this.pod.getObjectAnimationBeanWithIndex(2)
                    this.isCanToggle =
                        typeAnimation == ObjectAnimationType.Toggle || typeAnimation == ObjectAnimationType.Repeat

                    this.playAnimation(
                        animBean,
                        ObjectAnimationState.Transition2,
                        typeAnimation == ObjectAnimationType.Repeat
                            ? () => {
                                  if (this.isReapet) this.pod.ChangeAnimationState(ObjectAnimationState.End)
                              }
                            : undefined
                    )
                    break
                case ObjectAnimationState.Transition2:
                    this.isCanToggle = typeAnimation == ObjectAnimationType.Repeat
                    animBean = this.pod.getObjectAnimationBeanWithIndex(3)
                    this.playAnimation(animBean, ObjectAnimationState.Idle)
                    break
            }
        })

        this.on('destroy', () => {
            this.stateAnimationSubscription?.unsubscribe()
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
                    if (this.pod.ingredientObjectBean.isDisableInteract) {
                        this.interactZone.disableInteractive().setAlpha(0)
                    }
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
                this.tweenWithID(objectAnimationBean)

                if (objectAnimationBean.animTime != -1) {
                    this.spriteSheetObject.play(objectAnimationBean.animKey)
                    this.timerAnimationSubscription?.unsubscribe()
                    this.timerAnimationSubscription = timer(objectAnimationBean.animTime).subscribe((_) => {
                        if (callBack != null || callBack != undefined) {
                            callBack()
                        }
                        this.pod.ChangeAnimationState(nextState)
                    })
                } else {
                    this.spriteSheetObject.play(objectAnimationBean.animKey)
                }

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

            if (!PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                if (this.pod.ingredientObjectBean.id == GameConfig.TUTORIAL_INGREDIENT_OBJECT_ID[0]) {
                    PodProvider.instance.tutorialManager.updateCurrentToNextTutorial()
                    PodProvider.instance.tutorialManager.setTutorialState(TutorialState.CountDown)
                }
            }
            this.townBuildingPod.interactObject(this.pod.ingredientID).subscribe((bean) => {
                //Remove when have backend api
                if (GameConfig.IS_MOCK_API) {
                    timer(200).subscribe((_) => {
                        console.log('random Result : ' + bean.id)
                        this.doOnPickupItem(bean)
                    })
                }
            })
        }
    }

    private setInteractiveObject() {
        this.setInteractionOnButtonPointer()
    }

    private setInteractionOnButtonPointer(): void {
        this.interactZone?.setInteractive().on('pointerdown', () => {
            this.isPointerDown = true
        })

        this.interactZone.setInteractive().on('pointerup', () => {
            if (!this.cameraPod.isMovingCamera.value) {
                if (this.isPointerDown) {
                    if (
                        PodProvider.instance.tutorialManager.isCompletedTutorial(true, TutorialStepState.Welcome) &&
                        this.pod.ingredientObjectBean.id == GameConfig.TUTORIAL_INGREDIENT_OBJECT_ID[0]
                    ) {
                        this.onOnPointerUp()
                    } else if (
                        PodProvider.instance.tutorialManager.isCompletedTutorial(
                            true,
                            TutorialStepState.CollectedFirstIngredient
                        )
                    ) {
                        this.onOnPointerUp()
                    } else if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                        this.onOnPointerUp()
                    }
                }
            }
        })
    }

    private onOnPointerUp() {
        let currentAnimationState = this.pod.currentAnimationState.value
        this.audioManager.playSFXSound('interact_ingredient_sfx')
        if (this.isCanToggle) {
            if (
                (currentAnimationState == ObjectAnimationState.End ||
                    currentAnimationState == ObjectAnimationState.Transition2) &&
                this.pod.ingredientObjectBean.typeAnimation == ObjectAnimationType.Repeat
            ) {
                this.isReapet = true
                if (currentAnimationState == ObjectAnimationState.Transition2) {
                    this.pod.ChangeAnimationState(ObjectAnimationState.End)
                }
                this.endRepeatTimerAnimationSubscription?.unsubscribe()
                this.endRepeatTimerAnimationSubscription = timer(
                    this.pod.getObjectAnimationBeanWithIndex(2).animTime
                ).subscribe((_) => {
                    this.isReapet = false
                })
            } else {
                if (currentAnimationState == ObjectAnimationState.Idle) {
                    this.pod.ChangeAnimationState(ObjectAnimationState.Transition1)
                }

                if (currentAnimationState == ObjectAnimationState.End) {
                    this.pod.ChangeAnimationState(ObjectAnimationState.Transition2)
                }
            }
        }

        this.isPointerDown = false
    }

    private doOnPickupItem(bean: IngredientBean) {
        let x: number = this.isInContainer
            ? this.scene.cameras.main.centerX + this.pod.ingredientObjectBean.positionX
            : this.x + this.interactZone.x
        let y: number = this.isInContainer
            ? this.scene.cameras.main.centerY + this.pod.ingredientObjectBean.positionY
            : this.y + this.interactZone.y
        let indicator = new SuccessIndicatorView(this.scene, x, y)
        //   bean.isFound = true //Change To Mutation API Update Bean To Server
        indicator.doInit(bean)
    }

    private debugInteract() {
        if (GameConfig.DEBUG_OBJECT) {
            if (this.isPickIngredient) {
                this.textStatusMock = TextAdapter.instance
                    .getVectorText(this.scene, 'FC_Lamoon_Bold')
                    .setText('NF' + `(D: ${this.pod.ingredientObjectBean.depth})`)
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

            this.add([textType])
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
            this.textStatusMock.setText('F : ' + `(D : ${this.pod.ingredientObjectBean.depth})`)

            this.textStatusMock.setStyle({
                fill: 'Green',
                fontSize: 20,
            })

            let idIngredientText = TextAdapter.instance
                .getVectorText(this.scene, 'FC_Lamoon_Bold')
                .setText(`ID Ingredient : ${this.pod.ingredientID}`)
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
