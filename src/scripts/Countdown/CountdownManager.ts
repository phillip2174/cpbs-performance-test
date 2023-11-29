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
import { BoldText } from '../../BoldText/BoldText'
import { TownUIPod } from '../Town/Pod/TownUIPod'
import { TownUIState } from '../Town/Type/TownUIState'

export class CountdownManager extends GameObjects.Container {
    private static readonly TIMER_BACKGROUND_KEY: string = 'timer-'
    private static readonly TIMER_ICON_KEY: string = '-icon'

    private countdownTimerText: GameObjects.Text
    private timeText: GameObjects.Text

    private countdownTimerBackground: GameObjects.Image
    private countdownTimerIcon: GameObjects.Image

    private countdownTimerEvent: Time.TimerEvent

    private isDesktop: boolean

    private townUIPod: TownUIPod
    private townDayNightPod: TownDayNightPod
    private countdownTimerPod: CountdownTimerPod

    private uiStateSubscription: Subscription
    private timeStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.townUIPod = PodProvider.instance.townUIPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.countdownTimerPod = PodProvider.instance.countdownTimerPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

        this.setPosition(x, y)
        this.setupTimerBackgroundAndIcon()
        this.setupCountdownTimerText()
        this.setupSubscribe()

        this.countdownTimerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: -1,
            callback: () => {
                this.OnCountdownFinish()
                this.updateCountdownTimerText()
            },
        })
    }

    private setupSubscribe(): void {
        this.uiStateSubscription = this.townUIPod.townUIState.subscribe((state) => {
            if (this.countdownTimerPod.checkIsCountdownFinish() && state == TownUIState.MainMenu) {
                this.countdownTimerPod.setIsCountdownFinish(true)
            }
        })

        this.timeStateSubscription = this.townDayNightPod.townTimeState.subscribe((state) => {
            this.updateTimerBgAndIcon(state)
        })

        this.on('destroy', () => {
            this.uiStateSubscription?.unsubscribe()
            this.timeStateSubscription?.unsubscribe()
        })
    }

    private setupTimerBackgroundAndIcon(): void {
        this.countdownTimerBackground?.destroy()
        this.countdownTimerIcon?.destroy()

        this.countdownTimerBackground = this.scene.add
            .image(0, 0, CountdownManager.TIMER_BACKGROUND_KEY + 'day')
            .setOrigin(0.5)
            .setScale(1)

        this.countdownTimerIcon = this.scene.add
            .image(this.countdownTimerBackground.x - 48, -12, 'day' + CountdownManager.TIMER_ICON_KEY)
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

        this.countdownTimerText = new BoldText(
            this.scene,
            this.countdownTimerBackground.x + 32,
            this.countdownTimerIcon.y + 4.25,
            '00:00:00',
            18,
            '#ffffff'
        )
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

        this.countdownTimerText = new BoldText(
            this.scene,
            this.countdownTimerBackground.x + 36,
            this.countdownTimerIcon.y + 4.25,
            '00:00:00',
            22,
            '#ffffff'
        )
    }

    private updateTimerBgAndIcon(state: TownTimeState): void {
        this.countdownTimerBackground.setTexture(CountdownManager.TIMER_BACKGROUND_KEY + state.toLowerCase())
        this.countdownTimerIcon.setTexture(state.toLowerCase() + CountdownManager.TIMER_ICON_KEY)
    }

    private OnCountdownFinish(): void {
        this.countdownTimerPod.updateTimeDiffTimeStamp()
        if (this.countdownTimerPod.checkIsCountdownFinish()) {
            this.countdownTimerPod.setIsCountdownFinish(true)
            this.countdownTimerEvent.destroy()
        }
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
