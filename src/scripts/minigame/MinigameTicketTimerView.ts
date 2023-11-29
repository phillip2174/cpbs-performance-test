import { MinigameScenePod } from './MinigameScenePod'
import { MinigameBonusBean } from './MinigameBonusBean'
import { MinigameResultBean } from './MinigameResultBean'
import { MinigameResultUIView } from './MinigameResultUIView'
import { ResourceLoader } from '../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameCPPuzzleImageGroupPod } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupPod'
import { Observable, Observer, tap } from 'rxjs'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameResultBonusCellView } from './MinigameResultBonusCellView'
import { MinigameCountdownTimerPod } from '../pod/MinigameCountdownTimerPod'
import { BoldText } from '../../BoldText/BoldText'

export class MinigameTicketTimerView extends GameObjects.Container {
    private bg: GameObjects.Image
    private textHeader: GameObjects.Text
    private textTimer: GameObjects.Text
    countdownTimerEvent: Phaser.Time.TimerEvent
    pod: MinigameCountdownTimerPod
    callback: Function

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)
        this.pod = new MinigameCountdownTimerPod()
        this.pod.setupTimeStamps()
        this.pod.getCurrentTimeStamp().subscribe()

        this.bg = this.scene.add.image(0, 0, 'minigame-background-countdown-ticket', '')

        this.textHeader = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('Ticket จะกลับมาในอีก')
            .setOrigin(0.5)
            .setPosition(0, -26)
            .setStyle({
                fill: '#2B2B2B',
                fontSize: 18,
            })
        this.textTimer = new BoldText(this.scene, 0, -6, '10:00:00', 28, '#EE843C')
        this.add([this.bg, this.textHeader, this.textTimer])

        this.width = this.getBounds().width
        this.height = this.getBounds().height

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

    startCountDown() {
        this.pod.setupTimeStamps()
        this.pod.getCurrentTimeStamp().subscribe((_) => (this.countdownTimerEvent.paused = false))
    }

    stopCountDown() {
        this.countdownTimerEvent.paused = true
    }

    private updateCountdownTimerText(): void {
        this.pod.setTimeDiffTimes()
        this.textTimer.setText(
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
            this.callback()
        }
    }

    setCallBack(callback: () => void) {
        this.callback = callback
    }
}
