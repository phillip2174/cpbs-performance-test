import { GameObjects, Scene, Tweens } from 'phaser'
import { MinigameCPGuessPod } from './MinigameCPGuessPod'
import { AnimationStarView } from '../../Town/AnimationStarView'
import { BoldText } from '../../../BoldText/BoldText'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { AnimationController } from '../../Town/AnimationController'

export class MinigameCPGuessRevealAnswerPanelView extends GameObjects.Container {
    private dimScreen: GameObjects.Rectangle

    private panelGroup: GameObjects.Container
    private background: GameObjects.NineSlice
    private headerImage: GameObjects.Image
    private headerText: GameObjects.Text
    private animationStarContainer: GameObjects.Container
    private animationStarView1: AnimationStarView
    private animationStarView2: AnimationStarView
    private animationStarView3: AnimationStarView
    private animationStarView4: AnimationStarView
    private animationStarView5: AnimationStarView
    private animationStarView6: AnimationStarView

    private productImage: GameObjects.Image
    private productBorder: GameObjects.Image

    private productNameBackground: GameObjects.NineSlice
    private emoji: GameObjects.Image
    private thisProductIsText: GameObjects.Text
    private productNameText: GameObjects.Text
    private rectPosition: GameObjects.Rectangle

    private visibleTween: Tweens.Tween
    private visibleTweenChain: Tweens.TweenChain
    private hideTween: Tweens.Tween
    private hideTweenChain: Tweens.TweenChain

    private isDesktop: Boolean
    private guessgamePod: MinigameCPGuessPod

    constructor(scene: Scene, guessgamePod: MinigameCPGuessPod, x: number, y: number) {
        super(scene, x, y)
        this.guessgamePod = guessgamePod
        GameObjectConstructor(scene, this)

        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.panelGroup = this.scene.add.container(0, -20)
        this.panelGroup.setDepth(0)
    }

    public doInit() {
        this.dimScreen = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        )
        this.background = this.scene.add.nineslice(
            0,
            0,
            'minigame-3-show-answer-background',
            '',
            444,
            500,
            28,
            28,
            24,
            24
        )
        this.headerImage = this.scene.add.image(0, this.isDesktop ? -250 : 0, '')
        this.headerText = new BoldText(this.scene, 0, this.isDesktop ? -265 : 0, '', this.isDesktop ? 36 : 36)
        this.setupAnimationStarContainer()
        this.productBorder = this.scene.add.image(0, this.isDesktop ? -50 : 0, '')
        this.productImage = this.scene.add.image(0, this.isDesktop ? -50 : 0, '')
        this.productNameBackground = this.scene.add
            .nineslice(0, this.isDesktop ? 160 : 0, 'header-bg-tutorial', '', 380, 108, 28, 28, 24, 24)
            .setTint(0xffe2a5)
            .setAlpha(0.4)
        this.rectPosition = this.scene.add.rectangle(
            50,
            this.isDesktop ? 160 : 0,
            this.productNameBackground.width / 1.6,
            100,
            0xff00ff,
            0
        )
        this.emoji = this.scene.add.image(this.isDesktop ? -145 : 0, this.isDesktop ? 135 : 0, '')
        this.thisProductIsText = new BoldText(
            this.scene,
            this.isDesktop ? -20 : 0,
            this.isDesktop ? 145 : 0,
            'ผลิตภัณฑ์นี้คือ',
            this.isDesktop ? 24 : 24,
            '#EE843C'
        ).setOrigin(0.5, 0)
        console.log(this.thisProductIsText.height)
        this.thisProductIsText.height = 24
        this.productNameText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setPosition(
                this.isDesktop ? -70 : 0,
                this.isDesktop ? this.productNameBackground.y + this.productNameBackground.height / 2 : 0
            )
            .setOrigin(0, 0)
            .setStyle({ fill: '#2B2B2B', fontSize: 18 })

        this.panelGroup.add([
            this.background,
            this.headerImage,
            this.headerText,
            this.animationStarContainer,
            this.productBorder,
            this.productImage,
            this.productNameBackground,
            this.rectPosition,
            this.emoji,
            this.thisProductIsText,
            this.productNameText,
        ])
        this.add([this.dimScreen, this.panelGroup])
    }

    private setupAnimationStarContainer(): void {
        this.animationStarContainer = this.scene.add.container(this.headerImage.x, this.headerImage.y)

        this.animationStarView1 = new AnimationStarView(this.scene)
        this.animationStarView1.doInit(90 * this.headerImage.scale, -46 * this.headerImage.scale, 1.3, 1.5, 250, 80, 50)
        this.animationStarView2 = new AnimationStarView(this.scene)
        this.animationStarView2.doInit(
            -61 * this.headerImage.scale,
            -48 * this.headerImage.scale,
            0.8,
            0.9,
            150,
            80,
            200
        )
        this.animationStarView3 = new AnimationStarView(this.scene)
        this.animationStarView3.doInit(
            -95 * this.headerImage.scale,
            -8 * this.headerImage.scale,
            0.7,
            0.8,
            150,
            80,
            250
        )
        this.animationStarView4 = new AnimationStarView(this.scene)
        this.animationStarView4.doInit(
            -61 * this.headerImage.scale,
            40 * this.headerImage.scale,
            0.6,
            0.7,
            150,
            50,
            150
        )
        this.animationStarView5 = new AnimationStarView(this.scene)
        this.animationStarView5.doInit(
            35 * this.headerImage.scale,
            -53 * this.headerImage.scale,
            0.6,
            0.7,
            150,
            50,
            350
        )
        this.animationStarView6 = new AnimationStarView(this.scene)
        this.animationStarView6.doInit(85 * this.headerImage.scale, 25 * this.headerImage.scale, 0.6, 0.7, 150, 50, 450)

        this.playStarsTween()
        this.animationStarContainer.add([
            this.animationStarView1,
            this.animationStarView2,
            this.animationStarView3,
            this.animationStarView4,
            this.animationStarView5,
            this.animationStarView6,
        ])
        this.animationStarContainer.setVisible(false)

        this.createPanelTween()
    }

    public setPanelOnResult(isWin: boolean) {
        this.animationStarContainer.setVisible(isWin)
        this.playStarsTween()
        this.productImage.setTexture(this.guessgamePod.answerChoice.imageUrl)
        this.setProductNameText()

        if (isWin) {
            this.headerImage.setTexture('minigame-3-show-answer-header-win')
            this.headerText.setText('ยินดีด้วย!').setPosition(0, this.isDesktop ? -265 : 0)
            this.productBorder
                .setTexture('minigame-3-show-answer-product-border-win')
                .setDisplaySize(280, 280)
                .setSize(280, 280)
            this.emoji.setTexture('tutorial-character-2')
        } else {
            this.headerImage.setTexture('minigame-3-show-answer-header-lose')
            this.headerText.setText('เสียใจด้วย').setPosition(0, this.isDesktop ? -255 : 0)
            this.productBorder
                .setTexture('minigame-3-show-answer-product-border-lose')
                .setDisplaySize(250, 250)
                .setSize(250, 250)
            this.emoji.setTexture('tutorial-character-3')
        }
        this.emoji.setDisplaySize(115, 127.35).setSize(115, 127.35)
    }

    private setProductNameText() {
        const textEllipse = TextAdapter.splitThaiStringByLegth(
            this.guessgamePod.dataBean.productName,
            this.isDesktop ? 40 : 45
        )
        const resultDesc = textEllipse.slice(0, textEllipse.length > 3 ? 3 : textEllipse.length)
        if (textEllipse.length > 3) {
            resultDesc[resultDesc.length - 1] = resultDesc[resultDesc.length - 1] + '...'
        }
        this.productNameText.setText(resultDesc)
        this.productNameText.height = 18 * resultDesc.length
        this.setPointAndTagPosition()
    }

    private setPointAndTagPosition() {
        let spacing = 10
        let sumHeight = this.thisProductIsText.height + this.productNameText.height

        this.rectPosition.setSize(this.rectPosition.width, sumHeight)

        Phaser.Display.Align.To.TopLeft(this.thisProductIsText, this.rectPosition, 0, 0)
        Phaser.Display.Align.To.BottomLeft(this.productNameText, this.thisProductIsText, 0, spacing)
    }

    private createPanelTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.panelGroup)

        this.visibleTween = tweens.onOpenTween
        this.visibleTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this.panelGroup, () => {
            this.setVisible(false)
        })

        this.hideTween = tweensClose.onCloseTween
        this.hideTweenChain = tweensClose.onCloseTweenChain
    }

    public playVisiblePanelTween() {
        this.setVisible(true)
        this.hideTween?.pause()
        this.hideTweenChain?.pause()
        this.visibleTween?.restart()
        this.visibleTweenChain?.restart()
    }

    public playHidePanelTween() {
        this.hideTween?.restart()
        this.hideTweenChain?.restart()
        this.visibleTween?.pause()
        this.visibleTweenChain?.pause()
    }

    private playStarsTween() {
        this.animationStarView1.playTween()
        this.animationStarView2.playTween()
        this.animationStarView3.playTween()
        this.animationStarView4.playTween()
        this.animationStarView5.playTween()
        this.animationStarView6.playTween()
    }
}
