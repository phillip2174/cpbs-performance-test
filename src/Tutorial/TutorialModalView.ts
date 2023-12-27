import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { TutorialDataBean } from './TutorialDataBean'
import { AnimationController } from '../scripts/Town/AnimationController'
import { BoldText } from '../BoldText/BoldText'
import { TextAdapter } from '../scripts/text-adapter/TextAdapter'
import { Button } from '../scripts/button/Button'
import { TutorialButtonDataBean } from './TutorialButtonDataBean'
import { UserPod } from '../scripts/Town/Pod/UserPod'
import { PodProvider } from '../scripts/pod/PodProvider'
import { UserType } from '../scripts/User/UserType'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'
import { AudioManager } from '../scripts/Audio/AudioManager'

export class TutorialModalView extends GameObjects.Container {
    public static readonly OFFSET_X_CHARACTER_DESKTOP: number = 20
    public static readonly OFFSET_X_CHARACTER_MOBILE: number = 30
    public static readonly OFFSET_Y_CHARACTER_DESKTOP: number = 15
    public static readonly OFFSET_Y_CHARACTER_MOBILE: number = 15
    public static readonly MINSIZE_BG_MOBILE: number = 170
    public static readonly MINSIZE_BG_DESKTOP: number = 190
    public static readonly BUTTON_SPACE_MOBILE: number = 10
    public static readonly BUTTON_SPACE_DESKTOP: number = 15

    private tutorialDataBean: TutorialDataBean

    private background: GameObjects.NineSlice

    private contentTutorial: GameObjects.Container
    private headerText: GameObjects.Text
    private backgroundHeader: GameObjects.NineSlice
    private characterImage: GameObjects.Image
    private desc1Text: GameObjects.Text
    private desc2Text: GameObjects.Text
    private contentImage: GameObjects.Image

    private rectDesc1Position: GameObjects.Rectangle
    private rectDesc2Position: GameObjects.Rectangle
    private rectButtonPosition: GameObjects.Rectangle

    private currentTutorialButtonDataBeans: TutorialButtonDataBean[] = []

    private buttonID1: Button
    private buttonID2: Button

    private isDesktop: boolean
    private fontSizeDesc: number

    private onOpenTween: Tweens.Tween
    private onOpenTweenChain: Tweens.TweenChain
    private onCloseTween: Tweens.Tween
    private onCloseScaleTween: Tweens.TweenChain

    private audioManager: AudioManager

    private userPod: UserPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.userPod = PodProvider.instance.userPod
        this.audioManager = PodProvider.instance.audioManager
        this.createUI()
        this.createTween()

        this.setVisible(false)
    }

    public setActiveModal(isActive) {
        if (isActive) {
            this.onCloseTween?.pause()
            this.onCloseScaleTween?.pause()
            this.onOpenTween.restart()
            this.onOpenTweenChain?.restart()

            this.audioManager.playSFXSound('tutorial_modal_open_sfx')

            this.setActive(true)
            this.setVisible(true)
        } else {
            this.onOpenTween?.pause()
            this.onOpenTweenChain?.pause()
            this.onCloseTween?.restart()
            this.onCloseScaleTween?.restart()
        }
    }

    public updateData(tutorialDataBean: TutorialDataBean) {
        this.setScale(1)

        this.tutorialDataBean = tutorialDataBean
        this.characterImage.setTexture(this.tutorialDataBean.characterImageKey)
        this.headerText.setText(this.tutorialDataBean.headerText)
        this.desc1Text.setText(this.tutorialDataBean.desc1Text)
        this.contentImage.setTexture(this.tutorialDataBean.contentImageKey)
        this.desc2Text.setText(this.tutorialDataBean.desc2Text)

        if (this.tutorialDataBean.tutorialButtonGuestDataBean) {
            this.currentTutorialButtonDataBeans =
                this.userPod.userLoginType == UserType.Login
                    ? this.tutorialDataBean.tutorialButtonDataBean
                    : this.tutorialDataBean.tutorialButtonGuestDataBean
            this.updateButtonArray()
        } else {
            this.currentTutorialButtonDataBeans = this.tutorialDataBean.tutorialButtonDataBean
            this.updateButtonArray()
        }

        this.updateView()

        this.setScale(0)
    }

    public setActionButton(button1: Function, button2: Function = undefined) {
        this.buttonID1.onClick(() => {
            button1()
        })

        this.buttonID2.onClick(() => {
            button2()
        })
    }

    private updateButtonArray() {
        const buttonArray = [this.buttonID1, this.buttonID2]
        this.currentTutorialButtonDataBeans.forEach((bean, index) => {
            this.updateButton(buttonArray[index], bean)
        })
    }

    private createUI() {
        this.background = this.scene.add.nineslice(
            0,
            0,
            'modal-background-small-size',
            '',
            this.isDesktop ? 504 : 322,
            this.isDesktop ? 400 : 328,
            29,
            41,
            27,
            28
        )

        this.contentTutorial = this.scene.add.container(0, 0)

        this.backgroundHeader = this.scene.add
            .nineslice(
                this.isDesktop ? 25 : 15,
                0,
                'header-bg-tutorial',
                '',
                this.isDesktop ? 420 : 269,
                this.isDesktop ? 88 : 73,
                28,
                28,
                24,
                24
            )
            .setTint(0xffe2a5)

        this.characterImage = this.scene.add.image(0, 0, 'tutorial-character-1').setScale(this.isDesktop ? 1 : 0.8)

        this.headerText = new BoldText(
            this.scene,
            0,
            0,
            'ยินดีต้อนรับสู่ CP CITY',
            this.isDesktop ? 28 : 24,
            '#EE843C',
            0,
            0
        )
            .setOrigin(0.5, 0.5)
            .setAlign('left')

        this.fontSizeDesc = this.isDesktop ? 24 : 22

        this.desc1Text = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(['มาค้นวัตถุดิบที่ซ่อนอยู่ในจุดต่างๆ กันเถอะ'])
            .setOrigin(0.5)
            .setPosition(0, 0)
            .setStyle({
                fill: '#585858',
                fontSize: this.fontSizeDesc,
            })
            .setAlign('center')

        this.rectDesc1Position = this.scene.add
            .rectangle(0, 0, this.desc1Text.width, this.fontSizeDesc, 0xff00ff, 0)
            .setOrigin(0.5, 0)

        this.contentImage = this.scene.add.image(0, 0, 'content-panel-0').setScale(this.isDesktop ? 1 : 0.75)

        this.desc2Text = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(['สามารถดูได้ตรงนี้ ว่ายังเหลือวัตถุดิบที่ต้องเก็บอีกกี่ชิ้น'])
            .setOrigin(0.5)
            .setPosition(0, 0)
            .setStyle({
                fill: '#585858',
                fontSize: this.fontSizeDesc,
            })
            .setAlign('center')

        this.rectDesc2Position = this.scene.add
            .rectangle(0, 0, this.desc1Text.width, this.fontSizeDesc, 0xff00ff, 0)
            .setOrigin(0.5, 0)

        this.rectButtonPosition = this.scene.add
            .rectangle(0, 0, this.background.width / 1.3, 48, 0xff00ff, 0)
            .setOrigin(0.5, 0.5)

        this.buttonID1 = this.createButton(150, 48, 'button-white-bg', 'ทดลองเล่น', 0xffffff)
        this.buttonID2 = this.createButton(150, 48, 'button-white-bg', 'เข้าสู่ระบบ', 0xffffff)

        this.contentTutorial.add([
            this.backgroundHeader,
            this.characterImage,
            this.headerText,
            this.desc1Text,
            this.rectDesc1Position,
            this.contentImage,
            this.desc2Text,
            this.rectDesc2Position,
            this.rectButtonPosition,
            this.buttonID1,
            this.buttonID2,
        ])

        this.add([this.background, this.contentTutorial])

        this.updateView()
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
            leftWidth: 24,
            rightWidth: 24,
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

        button.setTextPosition(0, this.isDesktop ? 3 : 1)
        if (iconKey != undefined || iconKey != '') {
            let icon = this.scene.add.image(0, 0, iconKey)
            icon.setPosition(-button.width / 2 + icon.width, 0)
            button.add(icon)
        }

        button.setTintColorBackground(colorBG)

        return button
    }

    private updateButton(button: Button, buttonData: TutorialButtonDataBean) {
        button.setButtonSize(buttonData.buttonWidth, 48)
        button.setText(buttonData.buttonText)

        const color = Phaser.Display.Color.HexStringToColor(buttonData.buttonColorCode)

        button.setTintColorBackground(color.color)
    }

    private updateView() {
        const minSizeBG = this.isDesktop ? TutorialModalView.MINSIZE_BG_DESKTOP : TutorialModalView.MINSIZE_BG_MOBILE
        this.background.setSize(this.background.width, minSizeBG)

        const widthBackground = this.background.getBounds().width

        this.characterImage.setPosition(
            -widthBackground / 2 +
                this.characterImage.width / 2 -
                (this.isDesktop
                    ? TutorialModalView.OFFSET_X_CHARACTER_DESKTOP
                    : TutorialModalView.OFFSET_X_CHARACTER_MOBILE),
            this.backgroundHeader.y -
                this.backgroundHeader.height / 2 +
                (this.isDesktop
                    ? TutorialModalView.OFFSET_Y_CHARACTER_DESKTOP
                    : TutorialModalView.OFFSET_Y_CHARACTER_MOBILE)
        )

        Phaser.Display.Align.In.Center(this.headerText, this.backgroundHeader, 32, -2)

        this.alignText(
            this.desc1Text,
            this.rectDesc1Position,
            this.backgroundHeader.y + this.backgroundHeader.height / 2 + 20,
            this.fontSizeDesc * (this.tutorialDataBean ? this.tutorialDataBean.desc1Text.length : 1)
        )

        const heightImage = this.contentImage.getBounds().height
        this.contentImage.y = this.rectDesc1Position.y + this.rectDesc1Position.height + heightImage / 2 + 15

        this.alignText(
            this.desc2Text,
            this.rectDesc2Position,
            this.contentImage.y + this.contentImage.getBounds().height / 2 + 20,
            this.fontSizeDesc * (this.tutorialDataBean ? this.tutorialDataBean.desc2Text.length : 1)
        )

        this.alignButton()

        const sizeContent =
            this.rectDesc1Position.height +
            heightImage +
            this.rectDesc2Position.height +
            this.rectButtonPosition.height +
            (this.rectDesc2Position.height <= 0 ? 0 : 15)
        this.background.setSize(this.background.width, minSizeBG + sizeContent)
        const heightBackground = this.background.getBounds().height

        this.contentTutorial.setPosition(0, -heightBackground / 2 + this.backgroundHeader.height / 2 + 15)
    }

    private alignButton() {
        if (this.currentTutorialButtonDataBeans != undefined || this.currentTutorialButtonDataBeans.length != 0) {
            if (this.currentTutorialButtonDataBeans.length == 2) {
                this.buttonID1.setVisible(true)
                this.buttonID2.setVisible(true)

                this.buttonID1.width = this.buttonID1.getBounds().width
                this.buttonID2.width = this.buttonID2.getBounds().width

                const widthSumButton =
                    this.buttonID1.width +
                    this.buttonID2.width +
                    (this.isDesktop ? TutorialModalView.BUTTON_SPACE_DESKTOP : TutorialModalView.BUTTON_SPACE_MOBILE)

                this.rectButtonPosition.setSize(widthSumButton, 48)

                this.setPositionButton(
                    -this.rectButtonPosition.width / 2 + this.buttonID1.width / 2,
                    this.rectButtonPosition.width / 2 - this.buttonID2.width / 2
                )
            } else {
                this.buttonID1.setVisible(true)
                this.buttonID2.setVisible(false)

                this.buttonID1.width = this.buttonID1.getBounds().width

                const widthSumButton = this.buttonID1.width
                this.rectButtonPosition.setSize(widthSumButton, 48)

                this.setPositionButton(0, 0)
            }
        }
    }

    private setPositionButton(xPositionButton1: number, xPositionButton2: number) {
        this.rectButtonPosition.width = this.rectButtonPosition.getBounds().width
        this.rectButtonPosition.height = this.rectButtonPosition.getBounds().height

        const yPositionButton = this.rectDesc2Position.y + this.rectButtonPosition.height / 2
        this.rectButtonPosition.y =
            this.rectDesc2Position.height <= 0 ? yPositionButton : yPositionButton + this.rectDesc2Position.height + 15

        this.buttonID1.setPosition(xPositionButton1, this.rectButtonPosition.y)
        this.buttonID2.setPosition(xPositionButton2, this.rectButtonPosition.y)
    }

    private alignText(
        textObject: GameObjects.Text,
        positionTextRect: GameObjects.Rectangle,
        yPositionRect: number,
        heightTextRect: number
    ) {
        textObject.width = textObject.getBounds().width
        textObject.height = textObject.getBounds().height
        positionTextRect.y = yPositionRect

        positionTextRect.setSize(textObject.width, heightTextRect)
        positionTextRect.width = positionTextRect.getBounds().width
        positionTextRect.height = positionTextRect.getBounds().height

        Phaser.Display.Align.In.Center(textObject, positionTextRect, 0, -2.5)
    }

    private createTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this)

        this.onOpenTween = tweens.onOpenTween
        this.onOpenTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this, () => {
            this.setActive(false)
            this.setVisible(false)
        })

        this.onCloseTween = tweensClose.onCloseTween
        this.onCloseScaleTween = tweensClose.onCloseTweenChain
    }
}
