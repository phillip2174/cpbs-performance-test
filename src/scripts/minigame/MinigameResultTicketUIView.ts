import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { MinigameScenePod } from './MinigameScenePod'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { PodProvider } from '../pod/PodProvider'
import { AudioManager } from '../Audio/AudioManager'
import { MinigameCountdownTimerPod } from '../pod/MinigameCountdownTimerPod'
import { DeviceChecker } from '../plugins/DeviceChecker'
import { Subscription, interval } from 'rxjs'
import { BoldText } from '../../BoldText/BoldText'

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
    pod: MinigameCountdownTimerPod
    callback: Function

    private inveterSubscription: Subscription

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
    }

    createIntervalCountDown() {
        this.inveterSubscription = interval(100).subscribe((_) => {
            this.checkUpdateTime()
            this.updateCountdownTimerText()
        })

        this.on('destroy', () => {
            this.inveterSubscription?.unsubscribe()
        })
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

        this.countdownText = new BoldText(this.scene, 35, -5, '00:00:00', 28, '#EE843C')
        this.add(this.countdownText)
        this.alertImage = this.scene.add.image(-140, this.isDesktop ? 48 : 43, 'minigame-result-alert')
        this.add(this.alertImage)

        this.alertText = new BoldText(
            this.scene,
            15,
            this.isDesktop ? 45 : 40,
            'การเล่นแบบ Free Play จะไม่ได้รับ Rewards',
            22,
            '#E8AE37'
        ).setAlign('center')
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
        this.pod.getCurrentTimeStamp().subscribe((_) => {
            this.stopCountDown()
            this.createIntervalCountDown()
        })
    }

    stopCountDown() {
        this.inveterSubscription?.unsubscribe()
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
            this.stopCountDown()
            if (this.callback != undefined) {
                this.callback()
            }
        }
    }

    setCallBack(callback: () => void) {
        this.callback = callback
    }
}
