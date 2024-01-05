import { GameObjects, Scene, Tweens } from 'phaser'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { AnimationController } from '../Town/AnimationController'
import { DimButton } from '../button/DimButton'
import { CookieConsentManager } from '../Manager/CookieConsentManager'
import { PodProvider } from '../pod/PodProvider'
import { UIDepthConfig } from '../UIDepthConfig'

export class CookieConsentUIPanelView extends GameObjects.Container {
    private dimButton: DimButton
    private panelGroup: GameObjects.Container
    private backgroundPanel: GameObjects.NineSlice
    private emojiCookie: GameObjects.Image
    private text: GameObjects.Text
    private highlightText: GameObjects.Text
    private underlineHighLightText: GameObjects.Rectangle
    private buttonOnHighLightText: Button
    private acceptButtonImage: GameObjects.NineSlice
    private acceptButtonText: GameObjects.Text
    private acceptButton: Button

    private visibleTween: Tweens.Tween
    private visibleTweenChain: Tweens.TweenChain
    private closeTween: Tweens.Tween
    private closeTweenChain: Tweens.TweenChain

    private cookieConsentManager: CookieConsentManager
    private isDesktop: boolean

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
        this.cookieConsentManager = PodProvider.instance.cookieConsentManager
        this.isDesktop = DeviceChecker.instance.isDesktop()
    }

    public doInit() {
        console.log('Init CookieConsentUIPanelView CookieConsentUIPanelView')
        this.setVisible(false)
        this.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY)

        this.dimButton = new DimButton(this.scene, 0.5, false)
        this.dimButton.setCanInteract(false)
        this.panelGroup = this.scene.add.container(
            0,
            this.isDesktop ? this.scene.cameras.main.height / 2 - 65 : this.scene.cameras.main.height / 2 - 85
        )
        this.add([this.dimButton, this.panelGroup]).setDepth(UIDepthConfig.COOKIE_CONSENT_PANEL)

        this.backgroundPanel = this.scene.add
            .nineslice(
                0,
                0,
                'cookie-consent-bg',
                '',
                this.isDesktop ? 997 : 343,
                this.isDesktop ? 88 : 132,
                31,
                31,
                32,
                32
            )
            .setOrigin(0.5)
        const emojiWidth = this.isDesktop ? 137 : 109
        const emojiHeight = this.isDesktop ? 126 : 105
        ;(this.emojiCookie = this.scene.add
            .image(
                this.isDesktop ? -this.backgroundPanel.width / 2 + 85 : -this.backgroundPanel.width / 2 + 58,
                this.isDesktop ? -29 : -38,
                'character-cookie'
            )
            .setDisplaySize(emojiWidth, emojiHeight)),
            this.setSize(emojiWidth, emojiHeight)
        this.text = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(
                this.isDesktop
                    ? 'cpbrandsite.com ใช้คุกกี้บนเว็บไซต์นี้เพื่อการบริหารเว็บไซต์ และเพิ่มประสิทธิภาพการใช้งานของท่าน'
                    : 'cpbrandsite.com ใช้คุกกี้บนเว็บไซต์นี้\nเพื่อการบริหารเว็บไซต์ และเพิ่ม\nประสิทธิภาพการใช้งานของท่าน'
            )
            .setStyle({ fill: '#585858', fontSize: this.isDesktop ? 22 : 20 })
            .setOrigin(0.5)
            .setPosition(this.isDesktop ? -50 : 50, this.isDesktop ? -2 : -25)
        this.highlightText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('เรียนรู้เพิ่มเติม')
            .setStyle({ fill: '#CE0E2D', fontSize: 22 })
            .setOrigin(0.5)
            .setPosition(this.isDesktop ? 300 : -110, this.isDesktop ? -2 : 33)
        this.highlightText.height = 22
        this.underlineHighLightText = this.scene.add.rectangle(
            this.highlightText.x,
            this.highlightText.y + this.highlightText.height / 2,
            this.highlightText.width,
            1,
            0xce0e2d
        )
        this.buttonOnHighLightText = new Button(
            this.scene,
            this.highlightText.x,
            this.highlightText.y + 2,
            this.highlightText.width,
            this.highlightText.height,
            '',
            0,
            ''
        ).setAlpha(0.01)

        this.acceptButtonImage = this.scene.add.nineslice(
            this.isDesktop ? this.backgroundPanel.width / 2 - 80 : this.backgroundPanel.width / 2 - 80,
            this.isDesktop ? 0 : 35,
            'cookie-consent-button',
            '',
            this.isDesktop ? 108 : 124,
            this.isDesktop ? 40 : 40,
            31,
            31,
            32,
            32
        )
        this.acceptButtonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('ACCEPT')
            .setStyle({ fill: '#FFFFFF', fontSize: 22 })
            .setOrigin(0.5)
            .setPosition(this.acceptButtonImage.x + 2, this.acceptButtonImage.y - 3)
        this.acceptButton = new Button(
            this.scene,
            this.acceptButtonImage.x,
            this.acceptButtonImage.y,
            this.acceptButtonImage.width,
            this.acceptButtonImage.height,
            '',
            0,
            ''
        ).setAlpha(0.01)

        this.panelGroup.add([
            this.backgroundPanel,
            this.emojiCookie,
            this.text,
            this.highlightText,
            this.underlineHighLightText,
            this.buttonOnHighLightText,
            this.acceptButtonImage,
            this.acceptButtonText,
            this.acceptButton,
        ])

        this.createPanelTween()
        this.setupButton()

        this.playVisiblePanelTween()
    }

    private createPanelTween() {
        let tweens = AnimationController.instance.tweenOpenContainer(this.scene, this.panelGroup)

        this.visibleTween = tweens.onOpenTween
        this.visibleTweenChain = tweens.onOpenTweenChain

        let tweensClose = AnimationController.instance.tweenCloseContainer(this.scene, this.panelGroup, () => {
            this.setVisible(false)
        })

        this.closeTween = tweensClose.onCloseTween
        this.closeTweenChain = tweensClose.onCloseTweenChain
    }

    public playVisiblePanelTween() {
        this.setVisible(true)
        this.buttonOnHighLightText.setCanInteract(true, false)
        this.acceptButton.setCanInteract(true, false)
        this.closeTween?.pause()
        this.closeTweenChain?.pause()
        this.visibleTween?.restart()
        this.visibleTweenChain?.restart()
    }

    public playHidePanelTween() {
        this.buttonOnHighLightText.setCanInteract(false, false)
        this.acceptButton.setCanInteract(false, false)
        this.closeTween?.restart()
        this.closeTweenChain?.restart()
        this.visibleTween?.pause()
        this.visibleTweenChain?.pause()
    }

    private setupButton() {
        this.acceptButton.onClick(() => {
            this.cookieConsentManager.saveCookieConsentData(true)
            this.playHidePanelTween()
        })

        this.buttonOnHighLightText.onClick(() => {
            window.open('https://www.cpbrandsite.com/cookies')
        })
    }
}
