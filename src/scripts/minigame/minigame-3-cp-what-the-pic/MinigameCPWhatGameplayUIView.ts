import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameScenePod } from '../MinigameScenePod'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Subscription, timer } from 'rxjs'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameState } from '../MinigameState'
import { MinigameCPWhatGuessCellGroupView } from './MinigameCPWhatGuessCellGroupView'
import { MinigameCPWhatPod } from './MinigameCPWhatPod'
import { TimeBarView } from '../../../bar/TimeBarView'
import { HeaderScoreView } from '../HeaderScroeView'
import { MinigameCPWhatAnswerCellGroupView } from './MinigameCPWhatAnswerCellGroupView'
import { LifeCountView } from '../../../life-count/LifeCountView'
import { MinigameCountdownView } from '../MinigameCountdownView'
import { MinigameCPWhatRevealAnswerPanelView } from './MinigameCPWhatRevealAnswerPanelView'

export class MinigameCPWhatGameplayUIView extends GameObjects.GameObject {
    public static TIME_LIMIT: number = 15000
    public static TIME_SHOW_HINT_ANSWER: number = 4000
    public static TIME_REVEAL_ANSWER: number = 2000

    private mainGameplayGroup: GameObjects.Container
    private overlayCountDownGroup: GameObjects.Container

    private subBg: GameObjects.Image
    private background: GameObjects.Image
    private gameLogo: GameObjects.Image
    private dimGameplayScreen: GameObjects.Rectangle
    private minigameCPWhatGuessCellGroupView: MinigameCPWhatGuessCellGroupView
    private minigameCPWhatAnswerCellGroupView: MinigameCPWhatAnswerCellGroupView
    private countdownView: MinigameCountdownView
    private lifeCountView: LifeCountView
    private timeBarView: TimeBarView
    private minigameCPWhatShowAnswerPanelView: MinigameCPWhatRevealAnswerPanelView

    private sceneStateSubscription: Subscription
    private remainTimesSubscription: Subscription
    private gameResultIsWinSubscription: Subscription
    private countdownShowHintAnswer: Subscription
    private countdownShowRevealAnswerPanel: Subscription

    private isDesktop: boolean
    private scenePod: MinigameScenePod
    private guessgamePod: MinigameCPWhatPod

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.scenePod = PodProvider.instance.minigameScenePod
        this.isDesktop = DeviceChecker.instance.isDesktop()
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        this.mainGameplayGroup = this.scene.add.container(centerX, centerY)
        this.mainGameplayGroup.setDepth(0)
        this.overlayCountDownGroup = this.scene.add.container(centerX, centerY)
        this.overlayCountDownGroup.setDepth(1)

        this.createTimer()
        this.setupImage()
        this.setupSubscribeSceneState()
        this.on('destroy', () => {
            this.sceneStateSubscription?.unsubscribe()
            this.remainTimesSubscription?.unsubscribe()
            this.gameResultIsWinSubscription?.unsubscribe()
            this.countdownShowHintAnswer?.unsubscribe()
            this.countdownShowRevealAnswerPanel?.unsubscribe()
        })
    }

    private setupImage() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY

        this.subBg = this.scene.add
            .image(0, this.isDesktop ? 40 : 30, 'minigame-3-sub-bg')
            .setDisplaySize(this.isDesktop ? 480 : 343, this.isDesktop ? 680 : 540)

        this.guessgamePod = PodProvider.instance.minigameCPWhatPod
        this.gameLogo = this.scene.add
            .image(this.isDesktop ? -176 : -120, this.isDesktop ? -260 : -183, 'minigame-3-logo')
            .setDisplaySize(this.isDesktop ? 242 : 149, this.isDesktop ? 194 : 120)

        this.minigameCPWhatGuessCellGroupView = new MinigameCPWhatGuessCellGroupView(
            this.scene,
            this.guessgamePod,
            0,
            this.isDesktop ? 10 : 10
        )
        this.minigameCPWhatAnswerCellGroupView = new MinigameCPWhatAnswerCellGroupView(
            this.scene,
            this.guessgamePod,
            this.isDesktop ? -135 : -97,
            this.isDesktop ? 278 : 216
        )
        this.lifeCountView = new LifeCountView(
            this.scene,
            this.isDesktop ? centerX + 144 : centerX + 105,
            this.isDesktop ? centerY - 241 : centerY - 187
        )
        this.countdownView = new MinigameCountdownView(this.scene)

        this.dimGameplayScreen = this.scene.add
            .rectangle(0, this.isDesktop ? 36 : 30, this.isDesktop ? 430 : 308, this.isDesktop ? 630 : 500, 0x000000)
            .setAlpha(0.4)
            .setVisible(false)

        this.minigameCPWhatShowAnswerPanelView = new MinigameCPWhatRevealAnswerPanelView(
            this.scene,
            this.guessgamePod,
            centerX + 0,
            centerY - 0
        )

        this.minigameCPWhatGuessCellGroupView.doInit()
        this.minigameCPWhatAnswerCellGroupView.doInit()
        this.lifeCountView.doInit(3, this.isDesktop ? 1 : 0.75, false)
        this.countdownView.doInit(0, this.minigameCPWhatGuessCellGroupView.y + (this.isDesktop ? 0 : 0))
        this.minigameCPWhatShowAnswerPanelView.doInit()

        this.mainGameplayGroup.add([
            this.subBg,
            this.gameLogo,
            this.minigameCPWhatGuessCellGroupView,
            this.minigameCPWhatAnswerCellGroupView,
        ])
        this.overlayCountDownGroup.add([this.dimGameplayScreen, this.countdownView])
        this.minigameCPWhatShowAnswerPanelView.setDepth(1).setVisible(false)
        this.setupSubscribeRemainTimes()
    }

    private setupSubscribeSceneState() {
        this.sceneStateSubscription = this.scenePod.sceneState.subscribe((state) => {
            console.log('MinigameState: ' + state)
            switch (state) {
                case MinigameState.StartMenu:
                    this.setUIVisible(false)
                    break
                case MinigameState.BeforeStart:
                    this.startGame()
                    break
                case MinigameState.FinishCountdown:
                    this.setToGameStart()
                    break
                case MinigameState.GameStart:
                    this.timeBarView.setTimebarProperties('clock_ticking_fast_sfx', 1000, 2, false)
                    this.timeBarView.startTimeBar(MinigameCPWhatGameplayUIView.TIME_LIMIT, true, true)
                    break
                case MinigameState.Completed:
                    this.gameResultIsWinSubscription?.unsubscribe()
                    break
                case MinigameState.Setting:
                    break
            }
        })
    }

    private setupSubscribeRemainTimes() {
        this.remainTimesSubscription = this.guessgamePod.remainingClickTimes.subscribe((value) => {
            if (value != 3) {
                this.lifeCountView.decreaseLifeCount()
            }
        })
    }

    private setupSubscribeGameResultIsWin() {
        this.gameResultIsWinSubscription = this.guessgamePod.gameResultIsWin.subscribe((value) => {
            this.timeBarView.pauseTimebar()
            this.minigameCPWhatAnswerCellGroupView.setCanInteractButton(false)
            this.minigameCPWhatShowAnswerPanelView.setPanelOnResult(value)
            this.showAnswer()
            if (value) {
                this.checkScoreWin()
            } else {
                this.scenePod.score = 0
                this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' CARD'
            }
            this.gameResultIsWinSubscription?.unsubscribe()
        })
    }

    private startGame() {
        console.log('startgame')
        this.setUIVisible(true)
        this.guessgamePod.resetPod()
        this.lifeCountView.resetAllLifeCount()
        this.timeBarView.startTimeBar(MinigameCPWhatGameplayUIView.TIME_LIMIT, true, false)
        this.minigameCPWhatGuessCellGroupView.setBorderAndBackGround()
        this.guessgamePod.getMinigameGuessData().subscribe(() => {
            this.minigameCPWhatGuessCellGroupView.setCellImage().subscribe()
            this.minigameCPWhatAnswerCellGroupView.setCellBeforeStart()
            this.countdownView.startCountdown(() => {})
        })
    }

    private setToGameStart() {
        this.minigameCPWhatGuessCellGroupView.setActiveButtonAllCell()
        this.minigameCPWhatAnswerCellGroupView.setActiveButtonAllCell()
        this.setupSubscribeGameResultIsWin()
        this.scenePod.setSceneState(MinigameState.GameStart)
    }

    private setUIVisible(value: boolean) {
        this.subBg?.setVisible(value)
        this.mainGameplayGroup.setVisible(value)
    }

    private createTimer() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        if (this.isDesktop) {
            this.timeBarView = new TimeBarView(this.scene).setDepth(0)
            this.timeBarView.doInit(centerX + 55, centerY - 230, 271, 70, 0, 199, 18, -10, 16, 10, 48)
            this.timeBarView.createTextTime(-55, -12, '#2b2b2b', 24)
            let headerText = new HeaderScoreView(this.scene, -50, -14, 'TIME').setDepth(100)
            this.timeBarView.add(headerText)
        } else {
            this.timeBarView = new TimeBarView(this.scene).setDepth(0)
            this.timeBarView.doInit(centerX + 45, centerY - 175, 201, 58, 0, 145, 20, -5, 11)
            this.timeBarView.createTextTime(-5, -7, '#585858', 22)
        }

        this.timeBarView.addCallBack(() => {
            this.minigameCPWhatShowAnswerPanelView.setPanelOnResult(false)
            this.scenePod.score = 0
            this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' CARD'
            this.showAnswer()
        })
    }

    private checkScoreWin() {
        let score: number
        switch (this.guessgamePod.remainingClickTimes.value) {
            case 3:
            case 2:
                score = 3
                break
            case 1:
                score = 2
                break
            case 0:
                score = 1
                break
        }
        this.scenePod.score = score
        this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' CARD'
    }

    private showAnswer() {
        this.minigameCPWhatGuessCellGroupView.disableCellButton()
        this.minigameCPWhatAnswerCellGroupView.setCanInteractButton(false)
        this.minigameCPWhatGuessCellGroupView.flipAllCell()
        this.countdownShowHintAnswer = timer(MinigameCPWhatGameplayUIView.TIME_SHOW_HINT_ANSWER).subscribe((_) => {
            this.minigameCPWhatShowAnswerPanelView.playVisiblePanelTween()
            this.countdownShowRevealAnswerPanel = timer(MinigameCPWhatGameplayUIView.TIME_REVEAL_ANSWER).subscribe(
                () => {
                    this.scenePod.setSceneState(MinigameState.Completed)
                    this.scenePod.callBackOnOpenResult = () => {
                        this.minigameCPWhatShowAnswerPanelView.playHidePanelTween()
                    }
                    this.countdownShowRevealAnswerPanel?.unsubscribe()
                }
            )
            this.countdownShowHintAnswer?.unsubscribe()
        })
    }
}
