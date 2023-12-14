import { GameObjects, Scene, Tweens } from 'phaser'
import { BoldText } from '../../BoldText/BoldText'
import { Subscription, timer } from 'rxjs'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { AudioManager } from '../Audio/AudioManager'
import { PodProvider } from '../pod/PodProvider'

export class FlatMessageManager {
    private static _instance: FlatMessageManager
    private scene: Phaser.Scene

    private flatContainer: GameObjects.Container
    private iconMessage: GameObjects.Image
    private backgroundMessage: GameObjects.NineSlice
    private messagePositionRect: GameObjects.Rectangle
    private flatMessageText: GameObjects.Text

    private isDesktop: boolean

    private audioManager: AudioManager

    private moveTween: Tweens.Tween
    private alphaTween: Tweens.Tween
    private delayClose: Subscription

    private static getInstance() {
        if (!FlatMessageManager._instance) {
            FlatMessageManager._instance = new FlatMessageManager()
        }

        return FlatMessageManager._instance
    }

    static get instance(): FlatMessageManager {
        return this.getInstance()
    }

    public doInit(scene: Scene): void {
        this.scene = scene
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.audioManager = PodProvider.instance.audioManager

        this.createUI()

        this.flatContainer.setVisible(false)
    }
    public showFlatMessageManager(x: number, y: number, text: string[], timeShow: number = 3000) {
        this.flatContainer.setVisible(true)
        this.flatContainer.setPosition(x, y)

        this.flatMessageText.setText(text)

        this.handleSize(text.length)
        this.showTween()

        this.audioManager.playSFXSound('flat_message_alert_sfx')

        this.delayClose = timer(timeShow).subscribe((_) => {
            this.closeTween()
        })

        this.flatContainer.on('destroy', () => {
            this.delayClose?.unsubscribe()
            this.moveTween?.destroy()
            this.alphaTween?.destroy()
        })
    }

    private createUI() {
        this.flatContainer = this.scene.add.container(0, 0).setDepth(299)
        this.backgroundMessage = this.scene.add.nineslice(0, 0, 'flat-message-bg', '', 280, 70, 20, 20, 20, 20)
        this.iconMessage = this.scene.add.image(0, 0, 'alert-icon').setDisplaySize(32, 32).setSize(32, 32)
        const lineMessage = ['คุณออกจากเกมนานเกินไป', 'กรุณาลองใหม่อีกครั้ง']
        this.flatMessageText = new BoldText(this.scene, 0, 0, lineMessage, 22, '#A7A7A7')

        this.messagePositionRect = this.scene.add.rectangle(0, 0, 205, 44, 0x00ff00, 0)

        this.handleSize(lineMessage.length)

        this.flatContainer.add([
            this.backgroundMessage,
            this.messagePositionRect,
            this.flatMessageText,
            this.iconMessage,
        ])
    }

    private handleSize(lineCount: number) {
        this.flatContainer.setScale(1)
        this.messagePositionRect.setSize(205, 22 * lineCount)
        const heightBG = 26 + 22 * lineCount
        this.backgroundMessage.setSize(280, heightBG >= 70 ? heightBG : 70)

        Phaser.Display.Align.In.LeftCenter(this.iconMessage, this.backgroundMessage, -15)
        Phaser.Display.Align.In.RightCenter(this.messagePositionRect, this.backgroundMessage, -15)
        Phaser.Display.Align.In.LeftCenter(this.flatMessageText, this.messagePositionRect, 0, -3)

        this.flatContainer.setScale(this.isDesktop ? 1 : 0.85)
    }

    private showTween() {
        this.moveTween = this.scene.add.tween({
            targets: this.flatContainer,
            ease: 'Quad.easeOut',
            duration: 300,
            props: {
                y: { from: this.flatContainer.y - 30, to: this.flatContainer.y },
            },
        })

        this.alphaTween = this.scene.add.tween({
            targets: this.flatContainer,
            ease: 'linear',
            duration: 400,
            props: {
                alpha: { from: 0, to: 1 },
            },
        })
    }

    private closeTween() {
        this.moveTween = this.scene.add.tween({
            targets: this.flatContainer,
            ease: 'Quad.easeOut',
            duration: 300,
            props: {
                y: { from: this.flatContainer.y, to: this.flatContainer.y - 30 },
            },
        })

        this.alphaTween = this.scene.add.tween({
            targets: this.flatContainer,
            ease: 'linear',
            duration: 400,
            props: {
                alpha: { from: 1, to: 0 },
            },
        })
    }
}
