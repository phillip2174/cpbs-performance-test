import { GameObjects, Scene, Time } from 'phaser'
import { Subscription } from 'rxjs'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { CountdownTimerPod } from '../pod/CountdownTimerPod'
import { PodProvider } from '../pod/PodProvider'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { CameraControlPod } from '../camera/CameraControlPod'

export class CountdownManager extends GameObjects.Container {
    private static readonly TIMER_BACKGROUND_KEY: string = 'timer-'
    private static readonly TIMER_ICON_KEY: string = '-icon'

    private countdownTimerText: GameObjects.Text
    private timeText: GameObjects.Text

    private countdownTimerBackground: GameObjects.Image
    private countdownTimerIcon: GameObjects.Image

    private countdownTimerEvent: Time.TimerEvent

    private isDay: boolean = false
    private isDesktop: boolean

    private townDayNightPod: TownDayNightPod
    private countdownTimerPod: CountdownTimerPod
    private cameraPod: CameraControlPod
    private isAllFoundSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.cameraPod = PodProvider.instance.cameraControlPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.countdownTimerPod = PodProvider.instance.countdownTimerPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.setPosition(x, y)

        this.setupSubscribe()
        this.countdownTimerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: -1,
            callback: () => {
                this.ShowReloadPopupWhenCountdownFinish()
                this.updateCountdownTimerText()
            },
        })
    }

    private setupSubscribe(): void {
        this.townDayNightPod.townTimeState.subscribe((state) => {
            this.setupTimerBackgroundAndIcon(state)
            this.setupCountdownTimerText()
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
        this.countdownTimerText.setPosition(this.x, this.y + 100)

        let text = TextAdapter.instance
            .getVectorText(this.scene, 'FC_Lamoon_Bold')
            .setText('Coming in : ')
            .setPosition(0, 30)
            .setOrigin(0.5, 0.5)
            .setStyle({
                fill: '#ff0000',
                fontSize: 30,
            })

        this.add([text])
        this.bringToTop(text)
    }

    private setupTimerBackgroundAndIcon(state: TownTimeState): void {
        this.countdownTimerBackground?.destroy()
        this.countdownTimerIcon?.destroy()

        this.countdownTimerBackground = this.scene.add
            .image(0, 0, CountdownManager.TIMER_BACKGROUND_KEY + state.toLowerCase())
            .setOrigin(0.5)
            .setScale(1)

        this.countdownTimerIcon = this.scene.add
            .image(this.countdownTimerBackground.x - 48, -12, state.toLowerCase() + CountdownManager.TIMER_ICON_KEY)
            .setOrigin(0.5)

        this.add([this.countdownTimerBackground, this.countdownTimerIcon])
    }

    private setupCountdownTimerText(): void {
        this.isDesktop ? this.setupTimerTextDesktop() : this.setupTimerTextMobile()
        this.add([this.timeText, this.countdownTimerText])
    }

    private setupTimerTextDesktop(): void {
        this.timeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('เวลา')
            .setOrigin(0.5)
            .setPosition(this.countdownTimerBackground.x - 12, this.countdownTimerIcon.y + 4)
            .setStyle({
                fill: '#ffffff',
                fontSize: 18,
            })

        this.countdownTimerText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('00:00:00')
            .setOrigin(0.5)
            .setPosition(this.countdownTimerBackground.x + 32, this.countdownTimerIcon.y + 4.25)
            .setStyle({
                fill: '#ffffff',
                fontSize: 18,
            })
    }

    private setupTimerTextMobile(): void {
        this.timeText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('เวลา')
            .setOrigin(0.5)
            .setPosition(this.countdownTimerBackground.x - 12, this.countdownTimerIcon.y + 4)
            .setStyle({
                fill: '#ffffff',
                fontSize: 22,
            })

        this.countdownTimerText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('00:00:00')
            .setOrigin(0.5)
            .setPosition(this.countdownTimerBackground.x + 36, this.countdownTimerIcon.y + 4.25)
            .setStyle({
                fill: '#ffffff',
                fontSize: 22,
            })
    }

    private ShowReloadPopupWhenCountdownFinish(): void {
        this.countdownTimerPod.updateTimeDiffTimeStamp()
        if (this.countdownTimerPod.checkIsCountdownFinish()) {
            this.countdownTimerEvent.destroy()
            this.ShowReloadPopup()
        }
    }

    private ShowReloadPopup(): void {
        this.cameraPod.setInteractCamera(false)
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
            this.countdownTimerPod.timeDiffhours.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            }) +
                ':' +
                this.countdownTimerPod.timeDiffminutes.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                }) +
                ':' +
                this.countdownTimerPod.timeDiffseconds.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })
        )
    }
}
