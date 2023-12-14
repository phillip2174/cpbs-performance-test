import { GameObjects, Scene, Tweens } from 'phaser'
import { BoldText } from '../../BoldText/BoldText'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { IngredientPreviewView } from './../Town/Recipe/IngredientPreviewView'
import { DimButton } from './../button/DimButton'
import { GuideLineUIManager } from './GuideLineUIManager'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownUIState } from '../Town/Type/TownUIState'
import { Subscription, timer } from 'rxjs'
import { AnimationController } from '../Town/AnimationController'
import { AnimationStarView } from './../Town/AnimationStarView'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { AudioManager } from '../Audio/AudioManager'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { FlatMessageManager } from '../flat-message/FlatMessageManager'

export class CompleteIngredientsPanelView extends GameObjects.Container {
    private dimButton: DimButton
    private ingredientPreviewView: IngredientPreviewView
    private ingredientBeans: IngredientBean[] = []

    private uiPanelContainer: GameObjects.Container
    private animationStarContainer: GameObjects.Container

    private uiPanelHeader: GameObjects.Image
    private lightRayEffectImage: GameObjects.Image

    private uiPanelBg: GameObjects.NineSlice

    private startDescText: GameObjects.Text
    private endDescText: GameObjects.Text

    private confirmButton: Button

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain
    private lightRayEffectTweenChain: Tweens.TweenChain

    private animationStarView1: AnimationStarView
    private animationStarView2: AnimationStarView
    private animationStarView3: AnimationStarView
    private animationStarView4: AnimationStarView
    private animationStarView5: AnimationStarView
    private animationStarView6: AnimationStarView

    private townUIPod: TownUIPod
    private guidelineUIManager: GuideLineUIManager

    private audioManager: AudioManager

    private uiStateSubscription: Subscription

    private isDesktop: boolean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.townUIPod = PodProvider.instance.townUIPod
        this.audioManager = PodProvider.instance.audioManager
        this.guidelineUIManager = PodProvider.instance.guideLineUIManager
        this.dimButton = new DimButton(this.scene)
        this.setupIngredientBeans()
        this.setupUIPanelContainer()
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.setupButtonsAction()
        this.createTweens()
        this.setupSubscribe()
        this.setDepth(203)
        this.add([this.dimButton, this.uiPanelContainer])
    }

    private setupIngredientBeans(): void {
        this.guidelineUIManager.guideLineUICellViewList.forEach((cellView) => {
            this.ingredientBeans.push(cellView.ingredientBean)
        })
    }

    private setupUIPanelContainer(): void {
        this.ingredientPreviewView = new IngredientPreviewView(this.scene, 0, 0)
        this.ingredientPreviewView.doInit()

        this.uiPanelContainer = this.scene.add.container()

        this.uiPanelBg = this.scene.add
            .nineslice(0, 0, 'complete-ingredients-bg', '', 444, 348, 38, 38, 24, 42)
            .setOrigin(0.5)
        this.uiPanelHeader = this.scene.add.image(0, 0, 'complete-ingredients-header').setOrigin(0.5)

        this.isDesktop ? this.setupUIDesktop() : this.setupUIMobile()

        this.lightRayEffectImage = this.scene.add
            .image(0, (this.uiPanelHeader.y + 45) / this.uiPanelHeader.scale, 'ui-panel-bg-effect')
            .setOrigin(0.5)
            .setScale(0)
        this.setupAnimationStarContainer()

        this.uiPanelContainer.add([
            this.lightRayEffectImage,
            this.uiPanelBg,
            this.uiPanelHeader,
            this.animationStarContainer,
            this.startDescText,
            this.endDescText,
            this.ingredientPreviewView,
            this.confirmButton,
        ])
    }

    private setupUIDesktop(): void {
        if (this.checkIsGuidelineCellOverMax()) {
            this.uiPanelBg.setSize(444, 392)
        }

        this.uiPanelHeader.setPosition(0, -this.uiPanelBg.height / 2 + 5)
        this.ingredientPreviewView.setCompleteNextPreviewView(
            this.ingredientBeans,
            1,
            this.checkIsGuidelineCellOverMax() ? 15 : 10,
            this.checkIsGuidelineCellOverMax()
        )
        this.ingredientPreviewView.setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsGuidelineCellOverMax() ? 170 : 160)
        )
        this.setupTextsDesktop()
        this.confirmButton = this.createButton(150, 48, 'button-white-bg', 'OK', 0x29cc6a).setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsGuidelineCellOverMax() ? 45 : 60)
        )
    }

    private setupUIMobile(): void {
        if (this.checkIsGuidelineCellOverMax()) {
            this.uiPanelBg.setSize(343, 320)
        } else {
            this.uiPanelBg.setSize(343, 284)
        }

        this.uiPanelHeader.setPosition(0, -this.uiPanelBg.height / 2 + 5).setScale(0.85)
        this.ingredientPreviewView.setCompleteNextPreviewView(
            this.ingredientBeans,
            0.7,
            10,
            this.checkIsGuidelineCellOverMax()
        )
        this.ingredientPreviewView.setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsGuidelineCellOverMax() ? 145 : 130)
        )
        this.setupTextsMobile()
        this.confirmButton = this.createButton(102, 48, 'button-white-bg', 'OK', 0x29cc6a).setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsGuidelineCellOverMax() ? 45 : 50)
        )
    }

    private setupTextsDesktop(): void {
        if (DeviceChecker.instance.isMacOS()) {
            this.startDescText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                .setText('สำเร็จ! คุณเก็บวัตถุดิบในช่วงกลางวันครบแล้ว')
                .setPosition(0, -this.uiPanelBg.height / 2 + 80)
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: 22 })

            this.endDescText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                .setText('วัตถุดิบจะกลับมาอีกครั้งในช่วงกลางคืนของวันนี้ อย่าลืมล่ะ')
                .setPosition(0, this.startDescText.y + 28)
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: 22 })
        } else {
            this.startDescText = new BoldText(
                this.scene,
                0,
                -this.uiPanelBg.height / 2 + 80,
                'สำเร็จ! คุณเก็บวัตถุดิบในช่วงกลางวันครบแล้ว',
                22,
                '#585858'
            )

            this.endDescText = new BoldText(
                this.scene,
                0,
                this.startDescText.y + 28,
                'วัตถุดิบจะกลับมาอีกครั้งในช่วงกลางคืนของวันนี้ อย่าลืมล่ะ',
                22,
                '#585858'
            )
        }
    }

    private setupTextsMobile(): void {
        this.startDescText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('สำเร็จ! คุณเก็บวัตถุดิบในช่วงกลางวันครบแล้ว')
            .setPosition(0, -this.uiPanelBg.height / 2 + 70)
            .setOrigin(0.5)
            .setStyle({ fill: '#585858', fontSize: 18 })

        this.endDescText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('วัตถุดิบจะกลับมาอีกครั้งในช่วงกลางคืนของวันนี้ อย่าลืมล่ะ')
            .setPosition(0, this.startDescText.y + 20)
            .setOrigin(0.5)
            .setStyle({ fill: '#585858', fontSize: 18 })
    }

    private setupAnimationStarContainer(): void {
        this.animationStarContainer = this.scene.add.container(this.uiPanelHeader.x, this.uiPanelHeader.y)

        this.animationStarView1 = new AnimationStarView(this.scene)
        this.animationStarView1.doInit(
            90 * this.uiPanelHeader.scale,
            -46 * this.uiPanelHeader.scale,
            1,
            1.3,
            250,
            80,
            50
        )
        this.animationStarView2 = new AnimationStarView(this.scene)
        this.animationStarView2.doInit(
            -61 * this.uiPanelHeader.scale,
            -48 * this.uiPanelHeader.scale,
            0.8,
            0.9,
            150,
            80,
            200
        )
        this.animationStarView3 = new AnimationStarView(this.scene)
        this.animationStarView3.doInit(
            -95 * this.uiPanelHeader.scale,
            -8 * this.uiPanelHeader.scale,
            0.7,
            0.8,
            150,
            80,
            250
        )
        this.animationStarView4 = new AnimationStarView(this.scene)
        this.animationStarView4.doInit(
            -61 * this.uiPanelHeader.scale,
            40 * this.uiPanelHeader.scale,
            0.6,
            0.7,
            150,
            50,
            150
        )
        this.animationStarView5 = new AnimationStarView(this.scene)
        this.animationStarView5.doInit(
            35 * this.uiPanelHeader.scale,
            -53 * this.uiPanelHeader.scale,
            0.6,
            0.7,
            150,
            50,
            350
        )
        this.animationStarView6 = new AnimationStarView(this.scene)
        this.animationStarView6.doInit(
            85 * this.uiPanelHeader.scale,
            25 * this.uiPanelHeader.scale,
            0.6,
            0.7,
            150,
            50,
            450
        )

        this.animationStarContainer.add([
            this.animationStarView1,
            this.animationStarView2,
            this.animationStarView3,
            this.animationStarView4,
            this.animationStarView5,
            this.animationStarView6,
        ])
    }

    private setupButtonsAction(): void {
        this.dimButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.NextIngredients)
        })

        this.confirmButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.NextIngredients)
        })
    }

    private setupSubscribe(): void {
        this.uiStateSubscription = this.townUIPod.townUIState.subscribe((state) => {
            if (state == TownUIState.CompleteIngredients) {
                this.setActiveContainer(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.setActiveContainer(this.townUIPod.townUIState.getValue() == TownUIState.CompleteIngredients, false)

        this.on('destroy', () => {
            this.uiStateSubscription?.unsubscribe()
        })
    }

    private checkIsGuidelineCellOverMax(): boolean {
        return this.guidelineUIManager.guideLineUICellViewList.length > 5
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()

                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

                this.audioManager.playSFXSound('complete_ingredients_alert_sfx')

                this.setActive(true)
                this.setVisible(true)
            } else {
                this.onOpenTween?.pause()
                this.onOpenTweenChain?.pause()

                this.onCloseTween?.restart()
                this.onCloseTweenChain?.restart()
                this.dimButton.setActiveDim(false)
            }
        } else {
            this.setActive(isActive)
            this.setVisible(isActive)
            this.dimButton.setActiveDim(isActive, false)
        }
    }

    private createButton(
        width: number,
        height: number,
        imageKey: string,
        txt: string,
        colorBG: number,
        iconKey?: string
    ): Button {
        let button = new Button(this.scene, 0, 0, width, height, '', 1000, txt)
        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: imageKey,
            leftWidth: 20,
            rightWidth: 20,
            topHeight: 21,
            bottomHeight: 23,
            safeAreaOffset: 0,
        })

        button.setTextStyle(
            {
                fontFamily: 'DB_HeaventRounded_Bd',
                fill: 'white',
                fontSize: 22,
            },
            !DeviceChecker.instance.isAppleOS()
        )

        button.setTextPosition(0, 3)

        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }

    private createTweens(): void {
        let openTweens = AnimationController.instance.tweenOpenContainer(this.scene, this.uiPanelContainer, () => {
            this.playAnimationStarTweens()
        })
        this.onOpenTween = openTweens.onOpenTween
        this.onOpenTweenChain = openTweens.onOpenTweenChain

        let closeTweens = AnimationController.instance.tweenCloseContainer(this.scene, this.uiPanelContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = closeTweens.onCloseTween
        this.onCloseTweenChain = closeTweens.onCloseTweenChain

        this.lightRayEffectTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.lightRayEffectImage,
                    duration: 250,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: this.isDesktop ? 1.1 : 0.85,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.lightRayEffectImage,
                    ease: `Sine.easeInOut`,
                    duration: 800,
                    yoyo: true,
                    loop: -1,
                    props: {
                        scale: { from: this.isDesktop ? 1.1 : 0.85, to: this.isDesktop ? 1 : 0.75 },
                        alpha: { from: 1, to: 0.8 },
                    },
                },
            ],
            persist: true,
            paused: true,
        })
    }

    private playAnimationStarTweens(): void {
        this.lightRayEffectTweenChain?.pause()
        this.lightRayEffectTweenChain?.restart()
        this.animationStarView1.playTween()
        this.animationStarView2.playTween()
        this.animationStarView3.playTween()
        this.animationStarView4.playTween()
        this.animationStarView5.playTween()
        this.animationStarView6.playTween()
    }
}
