import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { DimButton } from './../button/DimButton'
import { Button } from './../button/Button'
import { IngredientPreviewView } from '../Town/Recipe/IngredientPreviewView'
import { BoldText } from '../../BoldText/BoldText'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownBuildingPod } from './../Town/Pod/TownBuildingPod'
import { PodProvider } from '../pod/PodProvider'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { AnimationController } from '../Town/AnimationController'
import { Subscription } from 'rxjs'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownUIState } from '../Town/Type/TownUIState'
import { IngredientBean } from './../Ingredient/IngredientBean'

export class NextIngredientsPanelView extends GameObjects.Container {
    private dimButton: DimButton
    private ingredientPreviewView: IngredientPreviewView

    private uiPanelContainer: GameObjects.Container

    private uiPanelBg: GameObjects.NineSlice

    private headerText: GameObjects.Text
    private descText: GameObjects.Text
    private nextTimeText: GameObjects.Text

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseTweenChain: Tweens.TweenChain

    private confirmButton: Button
    private closeButton: Button

    private townUIPod: TownUIPod
    private townBuildingPod: TownBuildingPod

    private nextIngredientBeans: IngredientBean[] = []

    private isDesktop: boolean

    private uiStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.isDesktop = this.scene.sys.game.device.os.desktop
        this.dimButton = new DimButton(this.scene)
        this.setNextIngredientBeans()
        this.setupUIPanelContainer()
        this.setDepth(203)
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.add([this.dimButton, this.uiPanelContainer])
        this.createTweens()
        this.setupButtonOnClick()
        this.setupSubscribe()
    }

    private setupSubscribe(): void {
        this.uiStateSubscription = this.townUIPod.townUIState.subscribe((state) => {
            if (state == TownUIState.NextIngredients) {
                this.setActiveContainer(true)
            } else {
                this.setActiveContainer(false)
            }
        })

        this.setActiveContainer(this.townUIPod.townUIState.getValue() == TownUIState.NextIngredients, false)
    }

    private setNextIngredientBeans(): void {
        this.townBuildingPod
            .getNextHiddenIngredientData()
            .subscribe((ingredients) => (this.nextIngredientBeans = ingredients))
    }

    private setupUIPanelContainer(): void {
        this.ingredientPreviewView = new IngredientPreviewView(this.scene, 0, 0)
        this.ingredientPreviewView.doInit()

        this.uiPanelContainer = this.scene.add.container()

        this.uiPanelBg = this.scene.add
            .nineslice(0, 0, 'ui-button-group-bg', '', 460, 400, 23, 23, 23, 28)
            .setOrigin(0.5)

        this.isDesktop ? this.setupUIDesktop() : this.setupUIMobile()
        this.setupTexts()

        this.confirmButton = this.createButton(150, 48, 'button-white-bg', 'OK', 0x29cc6a).setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsNextIngredientsOverMax() ? 45 : 60)
        )

        this.closeButton = new Button(
            this.scene,
            this.uiPanelBg.width / 2 - (this.isDesktop ? 35 : 30),
            -this.uiPanelBg.height / 2 + (this.isDesktop ? 35 : 30),
            40,
            40,
            'close-button'
        )

        this.uiPanelContainer.add([
            this.uiPanelBg,
            this.headerText,
            this.descText,
            this.nextTimeText,
            this.ingredientPreviewView,
            this.confirmButton,
            this.closeButton,
        ])
    }

    private setupUIDesktop(): void {
        if (this.checkIsNextIngredientsOverMax()) {
            this.uiPanelBg.setSize(460, 444)
        }

        this.ingredientPreviewView.setCompleteNextPreviewView(
            this.nextIngredientBeans,
            1,
            this.checkIsNextIngredientsOverMax() ? 15 : 10,
            this.checkIsNextIngredientsOverMax(),
            true
        )

        this.ingredientPreviewView.setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsNextIngredientsOverMax() ? 165 : 150)
        )
    }

    private setupUIMobile(): void {
        if (this.checkIsNextIngredientsOverMax()) {
            this.uiPanelBg.setSize(328, 414)
        } else {
            this.uiPanelBg.setSize(328, 370)
        }

        this.ingredientPreviewView.setCompleteNextPreviewView(
            this.nextIngredientBeans,
            this.checkIsNextIngredientsOverMax() ? 0.85 : 0.7,
            10,
            this.checkIsNextIngredientsOverMax(),
            true
        )

        this.ingredientPreviewView.setPosition(
            0,
            this.uiPanelBg.height / 2 - (this.checkIsNextIngredientsOverMax() ? 150 : 140)
        )
    }

    private setupTexts(): void {
        this.headerText = new BoldText(
            this.scene,
            0,
            -this.uiPanelBg.height / 2 + 65,
            'วัตถุดิบในรอบถัดไป มีอะไรบ้างนะ??',
            28,
            '#EE843C'
        )

        if (this.scene.sys.game.device.os.macOS || this.scene.sys.game.device.os.iOS) {
            this.descText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                .setOrigin(0.5)
                .setStyle({ fill: '#585858', fontSize: this.isDesktop ? 24 : 22 })
                .setText(['อาจมีวัตถุดิบที่คุณกำลังตามหาอยู่', 'แล้วเข้ามาเก็บกันนะ! ในเวลา'])
                .setAlign('center')
        } else {
            this.descText = new BoldText(
                this.scene,
                0,
                0,
                ['อาจมีวัตถุดิบที่คุณกำลังตามหาอยู่', 'แล้วเข้ามาเก็บกันนะ! ในเวลา'],
                this.isDesktop ? 24 : 22,
                '#585858'
            ).setAlign('center')
        }

        this.nextTimeText = new BoldText(
            this.scene,
            0,
            0,
            PodProvider.instance.townDayNightPod.getTownTimeState() == TownTimeState.Day ? '18:00 น.' : '06:00 น.',
            this.isDesktop ? 36 : 34,
            '#0099FF'
        )

        this.descText.setPosition(0, this.headerText.y + 50)
        this.nextTimeText.setPosition(0, this.descText.y + 50)
    }

    private setupButtonOnClick(): void {
        this.dimButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })

        this.confirmButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })

        this.closeButton.onClick(() => {
            this.townUIPod.changeUIState(TownUIState.MainMenu)
        })
    }

    private checkIsNextIngredientsOverMax(): boolean {
        return this.nextIngredientBeans.length > 5
    }

    private setActiveContainer(isActive: boolean, isTween: boolean = true) {
        if (isTween) {
            if (isActive) {
                this.dimButton.setActiveDim(true)
                this.onCloseTween?.pause()
                this.onCloseTweenChain?.pause()

                this.onOpenTween.restart()
                this.onOpenTweenChain?.restart()

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
            !(this.scene.sys.game.device.os.macOS || this.scene.sys.game.device.os.iOS)
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
        let openTweens = AnimationController.instance.tweenOpenContainer(this.scene, this.uiPanelContainer, () => {})
        this.onOpenTween = openTweens.onOpenTween
        this.onOpenTweenChain = openTweens.onOpenTweenChain

        let closeTweens = AnimationController.instance.tweenCloseContainer(this.scene, this.uiPanelContainer, () => {
            this.setActive(false)
            this.setVisible(false)
        })
        this.onCloseTween = closeTweens.onCloseTween
        this.onCloseTweenChain = closeTweens.onCloseTweenChain
    }
}
