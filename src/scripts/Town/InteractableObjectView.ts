import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { InteractableObjectBean } from './InteractableObjectBean'
import { Observable, Subscription, tap, timer } from 'rxjs'
import { InteractableObjectPod } from './Pod/InteractableObjectPod'
import { InteractableObjectAnimationState } from './Type/InteractableObjectAnimationState'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { InteractableObjectType } from './Type/InteractableObjectType'
import { InteractableObjectPickupState } from './Type/InteractableObjectPickupState'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { PodProvider } from '../pod/PodProvider'
import { SuccessIndicatorView } from './SuccessIndicatorView'
import { SuccessIndicatorPod } from './SuccessIndicatorPod'
import { SuccessIndicatorState } from './Type/SuccessIndicatorState'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Guideline/IngredientBean'

export class InteractableObjectView extends GameObjects.Container {
    public static readonly SPINE_PATH: string = `assets/spines/`

    debugTextIsFoundIngredient: GameObjects.Text
    mockingColorBackground: GameObjects.Rectangle
    spineGameObject: SpineGameObject

    private isCanToggle: boolean
    private stateAnimationSubscription: Subscription
    private indicatorSubscription: Subscription
    private pod: InteractableObjectPod
    private townBuildingPod: TownBuildingPod

    constructor(scene: Scene, interactableObjectBean: InteractableObjectBean) {
        super(
            scene,
            scene.cameras.main.centerX + interactableObjectBean.positionX,
            scene.cameras.main.centerY + interactableObjectBean.positionY
        )
        GameObjectConstructor(scene, this)

        this.pod = new InteractableObjectPod(this.scene)
        this.pod.SetInteractableObjectBean(interactableObjectBean)
        this.townBuildingPod = PodProvider.instance.townbuildingPod
    }

    public doInit() {
        let spineConfig = {
            x: this.x,
            y: this.y,
            key: this.pod.interactableObjectBean.keyAsset,
            path: InteractableObjectView.SPINE_PATH,
            startAnimation: 'stand',
            isLooping: true,
        }

        ResourceManager.instance.loadSpine(this.scene, spineConfig).subscribe((spine) => {
            console.log(spine)
            this.spineGameObject = spine

            this.setPlayer()
            this.setInteractiveObject()
            this.mockingWidthAndHeightCanInteract()
            this.setSubscribe()
        })
    }

    private setSubscribe() {
        this.stateAnimationSubscription = this.pod.currentAnimationState.subscribe((state) => {
            switch (state) {
                case InteractableObjectAnimationState.Idle:
                    console.log('Idle state')
                    this.isCanToggle = true
                    this.playAnimation('gameover', true)
                    break
                case InteractableObjectAnimationState.StartToEnd:
                    console.log('StartToEnd state')
                    this.playAnimation('stand', true)
                    if (!this.pod.isActiveObject) {
                        this.pod.isActiveObject = true
                        if (this.pod.isFoundIngredient && !PodProvider.instance.guideLineUIManager.isAllFound.value) {
                            this.townBuildingPod.interactObject().subscribe((bean) => {
                                if (GameConfig.IS_MOCK_DATA) {
                                    timer(200).subscribe((_) => {
                                        console.log('random Result : ' + bean.ingredientID)
                                        this.doOnPickupItem(bean)
                                    })
                                }
                            })
                        }
                        if (this.pod.interactableObjectBean.type == InteractableObjectType.Toggle) {
                            timer(1000).subscribe((_) => {
                                // change timer value by animation time
                                this.isCanToggle = true
                            })
                        }
                    } else {
                        if (this.pod.interactableObjectBean.type == InteractableObjectType.Toggle) {
                            timer(1000).subscribe((_) => {
                                // change timer value by animation time
                                this.isCanToggle = true
                            })
                        }
                    }

                    break
                case InteractableObjectAnimationState.EndToStart:
                    console.log('EndToStart state')
                    this.playAnimation('gameover', true)
                    timer(1000).subscribe((_) => {
                        // change timer value by animation time
                        this.pod.ChangeAnimationState(InteractableObjectAnimationState.Idle)
                        this.isCanToggle = true
                    })
                    break
            }
        })
    }

    private setPlayer(): void {
        this.spineGameObject.setScale(this.pod.interactableObjectBean.scaleX, this.pod.interactableObjectBean.scaleY)
        this.spineGameObject.setDepth(1)

        this.setSize(this.spineGameObject.displayWidth, this.spineGameObject.displayHeight)
        //console.log(this.spineGameObject.displayWidth + ' : ' + this.spineGameObject.displayHeight)
    }

    private setInteractiveObject() {
        this.setInteractionOnButtonPointerUp()
    }

    private setInteractionOnButtonPointerUp(): void {
        this.setInteractive().on('pointerup', () => {
            if (this.isCanToggle) {
                this.isCanToggle = false
                if (this.pod.currentAnimationState.value == InteractableObjectAnimationState.Idle) {
                    this.pod.ChangeAnimationState(InteractableObjectAnimationState.StartToEnd)
                } else {
                    this.pod.ChangeAnimationState(InteractableObjectAnimationState.EndToStart)
                }
            }
        })
    }

    private playAnimation(animation: string, isLoop: boolean = false): void {
        this.spineGameObject.setAnimation(0, animation, isLoop)
    }

    private doOnPickupItem(bean: IngredientBean) {
        let indicator = new SuccessIndicatorView(this.scene)
        indicator.doInit(this.x, this.y, bean)
    }

    private mockingWidthAndHeightCanInteract() {
        this.mockingColorBackground = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0xff0000, 0.1)

        this.debugTextIsFoundIngredient = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText(this.pod.isFoundIngredient ? 'true' : 'false')
            .setPosition(this.x, this.y + 40)
            .setOrigin(0.5, 0.5)
            .setStyle({
                fill: this.pod.isFoundIngredient ? 'Green' : 'Red',
                fontSize: 30,
            })
            .setDepth(100)

        let textType = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText(this.pod.interactableObjectBean.type)
            .setPosition(this.x, this.y + 60)
            .setOrigin(0.5, 0.5)
            .setStyle({
                fill: 'Black',
                fontSize: 15,
            })
            .setDepth(100)
    }

    public setFoundIngredient(isFound: boolean) {
        this.pod.isFoundIngredient = isFound
    }
}
