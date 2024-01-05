import { GameObjects, Scene } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { BoldText } from '../../BoldText/BoldText'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { AudioManager } from '../Audio/AudioManager'
import { PodProvider } from '../pod/PodProvider'
import { ButtonSoundType } from '../button/ButtonSoundType'
import { UIDepthConfig } from '../UIDepthConfig'

export class AlertDialogueView extends GameObjects.GameObject {
    container: GameObjects.Container
    contentContainer: GameObjects.Container
    iconAlert: GameObjects.Image
    headerText: GameObjects.Text
    descriptionText: GameObjects.Text
    descriptionPositionRect: GameObjects.Rectangle
    mockSizeContent: GameObjects.Rectangle
    yesButton: Button
    noButton: Button
    confirmButton: Button
    sprite: GameObjects.Sprite
    background: GameObjects.NineSlice
    dim: GameObjects.Rectangle
    private isDesktop: boolean
    private spacingButton: number
    private isPointerDown: boolean
    exitButton: Button

    private audioManager: AudioManager

    callBackOnShow: Function = undefined
    callBackOnHide: Function = undefined

    constructor(scene: Scene, callBackOnShow: Function, callBackOnHide: Function) {
        super(scene, 'gameobject')
        GameObjectConstructor(scene, this)

        this.audioManager = PodProvider.instance.audioManager

        this.callBackOnShow = callBackOnShow
        this.callBackOnHide = callBackOnHide

        this.container = this.scene.add.container(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)
        this.container.setDepth(UIDepthConfig.ALERT_DIALOGUE)

        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.dim = this.scene.add
            .rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.3)
            .setOrigin(0.5, 0.5)
        this.container.add(this.dim)

        this.background = this.scene.add
            .nineslice(0, 0, 'ui-notice-bg', '', this.isDesktop ? 380 : 320, 1, 31, 31, 32, 32)
            .setOrigin(0.5)

        this.dim.setInteractive()

        this.contentContainer = this.scene.add.container(0, 0)
        this.container.add(this.contentContainer)
        this.contentContainer.add(this.background)

        this.mockSizeContent = this.scene.add.rectangle(0, 0, 10, 10, 0x0000ff, 0).setOrigin(0.5, 0.5)
        this.container.add(this.mockSizeContent)

        this.spacingButton = this.isDesktop ? 40 : 27
    }

    createButton(
        button: Button,
        xPositionButton: number,
        yPositionButton: number,
        widthSize: number,
        textInButton: string,
        color: number,
        buttonSoundType: ButtonSoundType = ButtonSoundType.Positive
    ) {
        button = new Button(
            this.scene,
            xPositionButton,
            yPositionButton,
            widthSize,
            48,
            '',
            1000,
            textInButton,
            buttonSoundType
        )

        button.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'button-white-bg',
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 21,
            bottomHeight: 23,
            safeAreaOffset: 0,
        })

        button.setTintColorBackground(color)

        button.setTextStyle(
            {
                fontFamily: 'DB_HeaventRounded_Bd',
                fill: 'white',
                fontSize: 22,
            },
            !DeviceChecker.instance.isAppleOS()
        )

        return button
    }

    createYesButton(onClickCallback: () => any, textInButton: string): void {
        this.yesButton = this.createButton(
            this.yesButton,
            this.isDesktop
                ? this.background.width / 2 - 88 - this.spacingButton
                : this.background.width / 2 - 80 - this.spacingButton,
            this.descriptionPositionRect.y + this.descriptionPositionRect.height + (this.isDesktop ? 40 : 40),
            this.isDesktop ? 167 : 151,
            textInButton,
            0x29cc6a
        )

        //this.yesButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'confirm_button.png')

        this.yesButton.setTextPosition(2.5, 2)

        this.yesButton.onClick(() => {
            this.hide()
            onClickCallback?.()
            this.yesButton.setCanInteract(false)
            this.noButton.setCanInteract(false)
        })
        this.contentContainer.add(this.yesButton)
    }

    createNoButton(onClickCallback: () => any, textInButton: string): void {
        this.noButton = this.createButton(
            this.noButton,
            this.isDesktop
                ? -this.background.width / 2 + 57 + this.spacingButton
                : -this.background.width / 2 + 49 + this.spacingButton,
            this.descriptionPositionRect.y + this.descriptionPositionRect.height + (this.isDesktop ? 40 : 40),
            this.isDesktop ? 125 : 109,
            textInButton,
            0xee843c,
            ButtonSoundType.Negative
        )

        //this.noButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'cancel_button.png')

        this.noButton.setTextPosition(0, 2)

        this.noButton.onClick(() => {
            this.hide(() => {
                this.noButton.setCanInteract(true)
            })
            onClickCallback?.()
            this.yesButton.setCanInteract(false)
            this.noButton.setCanInteract(false)
        })
        this.contentContainer.add(this.noButton)
    }

    createConfirmButton(onClickCallback: () => any, textInButton: string): void {
        this.confirmButton = this.createButton(
            this.confirmButton,
            0,
            this.descriptionPositionRect.y + this.descriptionPositionRect.height + (this.isDesktop ? 40 : 40),
            177,
            textInButton,
            0x29cc6a
        )

        //this.confirmButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'confirm_button.png')

        this.confirmButton.setTextPosition(2.5, 2)

        this.confirmButton.onClick(() => {
            onClickCallback?.()
            this.hide()
            this.confirmButton.setCanInteract(false)
        })
        this.contentContainer.add(this.confirmButton)
    }

    handleContentPosition() {
        this.contentContainer.width = this.contentContainer.getBounds().width
        this.contentContainer.height = this.contentContainer.getBounds().height

        this.mockSizeContent.setSize(this.background.width, this.contentContainer.height)

        this.mockSizeContent.width = this.mockSizeContent.getBounds().width
        this.mockSizeContent.height = this.mockSizeContent.getBounds().height

        this.background.setSize(
            this.background.width,
            this.isDesktop
                ? this.mockSizeContent.height + (this.iconAlert == undefined ? 20 : 50)
                : this.mockSizeContent.height + (this.iconAlert == undefined ? 20 : 45)
        )

        this.contentContainer.y =
            -this.mockSizeContent.height / 2 + (this.iconAlert == undefined ? 15 : this.isDesktop ? 25 : 20)

        this.background.y =
            this.mockSizeContent.y +
            this.mockSizeContent.height / 2 -
            (this.iconAlert == undefined ? 15 : this.isDesktop ? 25 : 20)
    }

    addActionDimButton(onClickCallback: () => any) {
        this.dim?.setInteractive().on('pointerdown', () => {
            this.isPointerDown = true
        })

        this.dim?.setInteractive().on('pointerup', () => {
            if (this.isPointerDown) {
                onClickCallback?.()
                this.hide()

                this.isPointerDown = false
            }
        })
    }

    createExitButton(onClickCallback: () => any): void {
        this.exitButton = new Button(this.scene, 305, -298, 90, 90, 'button_exit', 1000)
        this.exitButton.setBackgroundButtonTexture('guideline-bg')
        //this.exitButton.setBackgroundButtonTextureWithAtlas('boot_ui_1', 'exit_button.png')
        this.exitButton.setButtonSize(90, 90)

        this.exitButton.onClick(() => {
            onClickCallback?.()
            this.hide()
            this.exitButton.setCanInteract(false)
        })
        this.contentContainer.add(this.exitButton)
    }

    createHeaderText(headerText: string): void {
        this.headerText = new BoldText(this.scene, 0, 0, headerText, 22, '2B2B2B')

        if (this.iconAlert != undefined) {
            this.headerText.setPosition(0, this.iconAlert.y + this.iconAlert.height / 2 + (this.isDesktop ? 30 : 30))
        } else {
            this.headerText.setPosition(0, 0)
        }

        this.headerText.setOrigin(0.5, 0.5)
        this.contentContainer.add(this.headerText)
    }

    createIconAlert() {
        this.iconAlert = this.scene.add
            .image(0, 0, 'alert-icon')
            .setDisplaySize(this.isDesktop ? 48 : 40, this.isDesktop ? 48 : 40)
            .setSize(this.isDesktop ? 48 : 40, this.isDesktop ? 48 : 40)
        this.contentContainer.add(this.iconAlert)
    }

    getIcon() {
        return this.iconAlert
    }

    getHeader() {
        return this.headerText
    }

    createDescriptionText(decriptionText: string): void {
        const textEllipse = TextAdapter.splitThaiStringByLegth(decriptionText, this.isDesktop ? 50 : 45)

        this.descriptionPositionRect = this.scene.add
            .rectangle(
                0,
                this.headerText.y + this.headerText.height / 2 - 5,
                this.background.width / 1.2,
                textEllipse.length > 3 ? 54 : 18 * textEllipse.length,
                0xff00ff,
                0
            )
            .setOrigin(0.5, 0)
        const resultDesc = textEllipse.slice(0, textEllipse.length > 3 ? 3 : textEllipse.length)
        if (textEllipse.length > 3) {
            resultDesc[resultDesc.length - 1] = resultDesc[resultDesc.length - 1] + '...'
        }

        this.descriptionText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(resultDesc)
            .setPosition(0, 0)
            .setOrigin(0.5)
            .setStyle({ fill: '#2B2B2B', fontSize: 18 })
            .setAlign('center')

        this.descriptionText.setOrigin(0.5, 0.5)
        this.contentContainer.add([this.descriptionPositionRect, this.descriptionText])

        this.descriptionPositionRect.width = this.descriptionPositionRect.getBounds().width
        this.descriptionPositionRect.height = this.descriptionPositionRect.getBounds().height
        this.descriptionText.height = 18 * resultDesc.length

        Phaser.Display.Align.In.Center(this.descriptionText, this.descriptionPositionRect, 0, -12)
    }

    show(onShowFinishCallback?: () => any) {
        if (this.callBackOnShow != undefined) this.callBackOnShow()

        this.scene.tweens.add({
            targets: this.container,
            duration: 300,
            props: {
                alpha: { from: 0, to: 1 },
            },
            ease: 'cubic.inout',
            onStart: () => {
                this.container.setActive(true)
            },
            onComplete: () => {
                onShowFinishCallback?.()
            },
        })

        this.scene.tweens.add({
            targets: this.contentContainer,
            duration: 400,
            props: {
                alpha: { from: 0, to: 1 },
            },
            ease: 'cubic.inout',
        })

        this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.contentContainer,
                    duration: 300,
                    props: { scale: { from: 0.5, to: 1.03 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.contentContainer,
                    duration: 130,
                    props: { scale: { from: 1.03, to: this.contentContainer.scale } },
                    ease: 'linear',
                    onComplete: () => {},
                },
            ],
        })

        this.audioManager.playSFXSound('alert_dialogue_open_sfx')
    }

    hide(onHideFinishCallback?: () => any) {
        if (this.callBackOnHide != undefined) this.callBackOnHide()

        this.scene.tweens.add({
            targets: this.container,
            ease: `Quad.easeIn`,
            duration: 300,
            alpha: 0,
            onComplete: () => {
                onHideFinishCallback?.()
                this.container.setActive(false)
                this.destroy(true)
            },
        })

        this.scene.tweens.add({
            targets: this.contentContainer,
            duration: 400,
            props: {
                alpha: { from: 1, to: 0 },
            },
            ease: 'cubic.inout',
        })

        this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.contentContainer,
                    duration: 200,
                    props: { scale: { from: 1, to: 1.03 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.contentContainer,
                    duration: 130,
                    props: { scale: { from: 1.03, to: 0.5 } },
                    ease: 'linear',
                    onComplete: () => {},
                },
            ],
        })
    }

    setDepth(depth: number) {
        this.container.setDepth(depth)
    }

    doDestroy() {
        this.container.destroy()
        this.dim.destroy()
    }
}
