import { GameObjects, Scene, Time } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { PodProvider } from '../pod/PodProvider'
import { TownTimeState } from '../Town/TownTimeState'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { CountdownTimerPod } from '../pod/CountdownTimerPod'
import { CameraControlView } from '../camera/CameraControlView'
import { Subscription } from 'rxjs'
import { TextAdapter } from '../text-adapter/TextAdapter'

export class CountdownManager extends GameObjects.GameObject {
    private countdownTimerText: GameObjects.Text
    private countdownTimerEvent: Time.TimerEvent
    private isDay: boolean = false
    private townDayNightPod: TownDayNightPod
    private countdownTimerPod: CountdownTimerPod
    private cameraControlView: CameraControlView
    private isAllFoundSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    private setupSubscribe(): void {
        this.townDayNightPod.townTimeState.subscribe((state) => {
            switch (state) {
                case TownTimeState.Day:
                    this.isDay = true
                    break
                case TownTimeState.Night:
                    this.isDay = false
                    break
            }
        })

        this.isAllFoundSubscription = PodProvider.instance.guideLineUIManager.isAllFound.subscribe((isFound) => {
            if (isFound) {
                this.doOnIsAllFound()
            }
        })
    }

    private doOnIsAllFound() {
        this.countdownTimerText.setPosition(UIUtil.getCanvasWidth() / 2, UIUtil.getCanvasHeight() - 40)

        let text = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText('Coming in : ')
            .setPosition(UIUtil.getCanvasWidth() / 2, UIUtil.getCanvasHeight() - 65)
            .setOrigin(0.5, 0.5)
            .setStyle({
                fill: '#ff0000',
                fontSize: 30,
            })
            .setDepth(3)
    }

    private setupCountdownTimerText(): void {
        this.countdownTimerText = this.scene.add
            .text(UIUtil.getCanvasWidth() / 2, UIUtil.getCanvasHeight() - 90, '00:00:00', {
                font: 'Arial',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 2,
            })
            .setFontSize(30)
            .setColor('#ff0000')
            .setDepth(3)
            .setOrigin(0.5)
    }

    private ShowReloadPopuWhenCountdownFinish(): void {
        this.countdownTimerPod.updateTimeDiffTimeStamp()
        if (this.countdownTimerPod.checkIsCoundownFinish()) {
            this.countdownTimerEvent.destroy()
            this.ShowReloadPopup()
        }
    }

    private ShowReloadPopup(): void {
        this.cameraControlView.disableCameraMovements()
        AlertDialogue.showConfirmPopup(
            this.scene,
            'Reminder',
            "Time's up!\n Another set of ingredients\n is coming!",
            () => {
                if (this.isDay) {
                    this.townDayNightPod.setTownTimeState(TownTimeState.Night)
                } else {
                    this.townDayNightPod.setTownTimeState(TownTimeState.Day)
                }
                location.reload()
            },
            'OK'
        )
    }

    private updateCountdownTimerText(): void {
        this.countdownTimerPod.setTimeDiffTimes()
        this.countdownTimerText.setText(
            this.countdownTimerPod.timeDiffhours +
                ':' +
                this.countdownTimerPod.timeDiffminutes +
                ':' +
                this.countdownTimerPod.timeDiffseconds
        )
    }

    public doInit(camera: CameraControlView): void {
        this.cameraControlView = camera
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.countdownTimerPod = PodProvider.instance.countdownTimerPod
        this.setupSubscribe()
        this.setupCountdownTimerText()
        this.countdownTimerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: -1,
            callback: () => {
                this.ShowReloadPopuWhenCountdownFinish()
                this.updateCountdownTimerText()
            },
        })
    }
}
