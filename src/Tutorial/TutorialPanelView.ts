import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { TutorialManager } from '../scripts/Manager/TutorialManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { Subscription } from 'rxjs'
import { TutorialState } from './TutorialState'
import { TutorialModalView } from './TutorialModalView'
import { UserIngredientBean } from '../scripts/Ingredient/UserIngredientBean'

export class TutorialPanelView extends GameObjects.Container {
    private dimBackground: GameObjects.Rectangle
    private tutorialManager: TutorialManager

    private modalTutorial: TutorialModalView

    private isPointerDown: boolean = false
    private isCanInteract: boolean = true

    private onBGOpenTween: Tweens.Tween
    private onBGCloseTween: Tweens.Tween

    private idStepSubscription: Subscription
    private stateSubscription: Subscription

    constructor(scene: Scene, xPosition: number, yPosition: number) {
        super(scene, xPosition, yPosition)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.tutorialManager = PodProvider.instance.tutorialManager

        this.createUI()
        this.createTween()
        this.setActionPanel()

        this.idStepSubscription = this.tutorialManager.tutorialStepID.subscribe((step) => {
            this.modalTutorial.updateData(this.tutorialManager.getTutorialDataWithID(step))

            switch (step) {
                case 0:
                    this.modalTutorial.setActionButton(
                        () => {
                            this.tutorialManager.setTutorialState(TutorialState.CloseUI)
                        },
                        () => {
                            this.tutorialManager.setTutorialState(TutorialState.CloseUI)
                        }
                    )
                    break
                default:
                    this.modalTutorial.setActionButton(() => {
                        this.tutorialManager.setTutorialState(TutorialState.CloseUI)
                    })
                    break
            }
        })
        this.stateSubscription = this.tutorialManager.tutorialState.subscribe((state) => {
            switch (state) {
                case TutorialState.CountDown:
                    this.setVisible(true)
                    this.isCanInteract = true
                    break
                case TutorialState.ShowUI:
                    this.onBGOpenTween.restart()
                    this.modalTutorial.setActiveModal(true)

                    const updatedStep = this.tutorialManager.tutorialStepID.value
                    this.tutorialManager.saveCheckPointTutorialAndCompleted(
                        updatedStep,
                        updatedStep >= this.tutorialManager.maxTutorialStep
                    )

                    this.doOnActivePanel()

                    break
                case TutorialState.CloseUI:
                    this.onBGCloseTween.restart()
                    this.modalTutorial.setActiveModal(false)

                    break
            }
        })

        this.on('destroy', () => {
            this.idStepSubscription?.unsubscribe()
            this.stateSubscription?.unsubscribe()
        })
    }

    private doOnActivePanel() {
        switch (this.tutorialManager.tutorialStepID.value) {
            case 1:
                this.saveUserIngredientBeansData(0)
                break
            case 2:
                this.saveUserIngredientBeansData(1)
                break
        }
    }

    private saveUserIngredientBeansData(index: number) {
        const saveID = PodProvider.instance.townbuildingPod.currentHiddenIngredientBeans[index].id
        this.tutorialManager.saveUserIngredientBeansData(new UserIngredientBean(saveID, saveID))
    }

    private createUI() {
        this.dimBackground = this.scene.add
            .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.01)
            .setOrigin(0.5)
        this.add(this.dimBackground)

        this.modalTutorial = new TutorialModalView(this.scene)
        this.modalTutorial.doInit()

        this.add([this.dimBackground, this.modalTutorial])
    }

    private setActionPanel() {
        this.dimBackground?.setInteractive().on('pointerdown', () => {
            if (!this.isCanInteract) return
            this.isPointerDown = true
        })

        this.dimBackground?.setInteractive().on('pointerup', () => {
            if (!this.isCanInteract) return
            if (this.isPointerDown) {
                if (this.tutorialManager.tutorialState.value == TutorialState.CountDown)
                    this.tutorialManager.setTutorialState(TutorialState.ShowUI)

                this.isPointerDown = false
            }
        })
    }

    private createTween() {
        this.onBGOpenTween = this.scene.add.tween({
            targets: this.dimBackground,
            duration: 300,
            props: {
                fillAlpha: {
                    from: this.dimBackground.fillAlpha,
                    to: 0.3,
                },
            },
            ease: 'Sine.easeInOut',
            persist: true,
            paused: true,
            onComplete: () => {},
        })

        this.onBGCloseTween = this.scene.add.tween({
            targets: this.dimBackground,
            duration: 300,
            props: {
                fillAlpha: {
                    from: 0.3,
                    to: this.dimBackground.fillAlpha,
                },
            },
            ease: 'Sine.easeInOut',
            persist: true,
            paused: true,
            onComplete: () => {
                this.setVisible(false)
            },
        })
    }
}
