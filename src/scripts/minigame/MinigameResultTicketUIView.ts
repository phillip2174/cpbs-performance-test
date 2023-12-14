import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { MinigameScenePod } from './MinigameScenePod'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { PodProvider } from '../pod/PodProvider'
import { AudioManager } from '../Audio/AudioManager'
import { MinigameCountdownTimerPod } from '../pod/MinigameCountdownTimerPod'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class MinigameResultTicketUIView extends GameObjects.Container {
    private audioManager: AudioManager
    ticketImage: GameObjects.Image
    ticketText: GameObjects.Text
    ticketAnimateImage: GameObjects.Image
    scenePod: MinigameScenePod
    isDesktop: boolean
    alertImage: GameObjects.Image
    alertText: GameObjects.Text
    countdownText: GameObjects.Text
    ticketGroup: GameObjects.Group
    countdownGroup: GameObjects.Group
    countdownTimerEvent: Phaser.Time.TimerEvent
    pod: MinigameCountdownTimerPod
    callback: Function

    constructor(scene: Scene, x: number, y: number, pod: MinigameScenePod) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)

        this.scenePod = pod
        this.pod = new MinigameCountdownTimerPod()
        this.audioManager = PodProvider.instance.audioManager
        this.isDesktop = DeviceChecker.instance.isDesktop()
        this.setUpUI()

        this.pod.setupTimeStamps()
        this.pod.getCurrentTimeStamp().subscribe()

        this.countdownTimerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: -1,
            callback: () => {
                this.checkUpdateTime()
                this.updateCountdownTimerText()
            },
        })
        this.countdownTimerEvent.paused = true
    }

    setUpUI() {
        this.ticketGroup = this.scene.add.group()
        this.countdownGroup = this.scene.add.group()
        this.ticketImage = this.scene.add.image(-60, 0, 'ticket')
        this.setScale(this.isDesktop ? 1 : 0.8)
        this.ticketAnimateImage = this.scene.add.image(-60, 0, 'ticket-use-effect').setScale(1.2)
        this.add([this.ticketImage, this.ticketAnimateImage])
        this.ticketAnimateImage.setVisible(false)
        this.ticketText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('TICKET : 2')
            .setOrigin(0.5)
            .setPosition(35, -5)
            .setStyle({
                fill: '#FFFFFF',
                fontSize: 28,
            })
            .setStroke('#EE843C', 5)
        this.add(this.ticketText)
        this.ticketGroup.add(this.ticketText)

        this.countdownText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('00:00:00')
            .setOrigin(0.5)
            .setPosition(35, -5)
            .setStyle({
                fill: '#EE843C',
                fontSize: 28,
            })
        this.add(this.countdownText)
        this.alertImage = this.scene.add.image(-140, this.isDesktop ? 48 : 43, 'minigame-result-alert')
        this.add(this.alertImage)
        this.alertText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('การเล่นแบบ Free Play จะไม่ได้รับ Rewards')
            .setOrigin(0.5)
            .setPosition(15, this.isDesktop ? 45 : 40)
            .setStyle({
                fill: '#E8AE37',
                fontSize: 22,
            })
            .setAlign('center')
        this.add(this.alertText)
        this.countdownGroup.addMultiple([this.countdownText, this.alertText, this.alertImage])
    }

    setUITicket() {
        this.ticketGroup.setVisible(true)
        this.countdownGroup.setVisible(false)
        this.stopCountDown()
    }

    setUICountdown() {
        this.ticketGroup.setVisible(false)
        this.countdownGroup.setVisible(true)
        this.startCountDown()
    }

    setTextTicket(ticket: number, isAnimate: boolean, callback: Function = () => {}) {
        this.ticketText.setText(`TICKET : ${ticket}`)
        if (!isAnimate) {
            callback()
        } else {
            this.ticketAnimateImage.setVisible(true)
            this.ticketAnimateImage.setAlpha(1)
            this.scene.tweens
                .add({
                    targets: this.ticketAnimateImage,
                    duration: 500,
                    props: {
                        scaleX: { from: 0.6, to: 1.2, duration: 300, ease: `Quad.easeOut` },
                        scaleY: { from: 0.6, to: 1.2, duration: 300, ease: `Cubic.easeOut` },
                        y: { from: 0, to: -150, ease: `Cubic.easeOut` },
                        alpha: { from: 1, to: 0.7 },
                    },
                    onStart: () => {
                        this.audioManager.playSFXSound('ticket_tearing')
                    },
                    onComplete: () => {
                        this.scene.tweens
                            .add({
                                targets: this.ticketAnimateImage,
                                ease: `Back.easeOut`,
                                duration: 300,
                                alpha: 0,
                                onComplete: () => {
                                    this.ticketAnimateImage.setVisible(false)
                                    callback()
                                },
                            })
                            .play()
                    },
                })
                .play()
        }
    }

    startCountDown() {
        this.pod.setupTimeStamps()
        this.pod.getCurrentTimeStamp().subscribe((_) => (this.countdownTimerEvent.paused = false))
    }

    stopCountDown() {
        this.countdownTimerEvent.paused = true
    }

    private updateCountdownTimerText(): void {
        this.pod.setTimeDiffTimes()
        this.countdownText.setText(
            this.pod.timeDiffhours.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            }) +
                ':' +
                this.pod.timeDiffminutes.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                }) +
                ':' +
                this.pod.timeDiffseconds.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })
        )
    }

    private checkUpdateTime(): void {
        this.pod.updateTimeDiffTimeStamp()
        if (this.pod.checkIsCountdownFinish()) {
            this.countdownTimerEvent.paused = true
            if (this.callback != undefined) {
                this.callback()
            }
        }
    }

    setCallBack(callback: () => void) {
        this.callback = callback
    }
}
