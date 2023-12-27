import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameScenePod } from '../MinigameScenePod'
import { DeviceChecker } from '../../plugins/DeviceChecker'
import { Subscription, timer } from 'rxjs'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameState } from '../MinigameState'
import { MinigameCPGuessGuessCellGroupView } from './MinigameCPGuessGuessCellGroupView'
import { MinigameCPGuessPod } from './MinigameCPGuessPod'
import { TimeBarView } from '../../../bar/TimeBarView'
import { HeaderScoreView } from '../HeaderScroeView'
import { MinigameCPGuessAnswerCellGroupView } from './MinigameCPGuessAnswerCellGroupView'
import { LifeCountView } from '../../../life-count/LifeCountView'
import { MinigameCountdownView } from '../MinigameCountdownView'
import { MinigameCPGuessRevealAnswerPanelView } from './MinigameCPGuessRevealAnswerPanelView'

export class MinigameCPGuessGameplayUIView extends GameObjects.GameObject {
    public static TIME_LIMIT: number = 15000
    public static TIME_SHOW_HINT_ANSWER: number = 4000
    public static TIME_REVEAL_ANSWER: number = 1000
    private mainGameplayGroup: GameObjects.Container
    private overlayCountDownGroup: GameObjects.Container

    private subBg: GameObjects.Image
    private background: GameObjects.Image
    private gameLogo: GameObjects.Image
    private dimGameplayScreen: GameObjects.Rectangle
    private minigameCPGuessCellGroupView: MinigameCPGuessGuessCellGroupView
    private minigameCPGuessAnswerCellGroupView: MinigameCPGuessAnswerCellGroupView
    private countdownView: MinigameCountdownView
    private lifeCountView: LifeCountView
    private timeBarView: TimeBarView
    private minigameCPGuessShowAnswerPanelView: MinigameCPGuessRevealAnswerPanelView

    private sceneStateSubscription: Subscription
    private remainTimesSubscription: Subscription
    private gameResultIsWinSubscription: Subscription
    private countdownShowHintAnswer: Subscription
    private countdownShowRevealAnswerPanel: Subscription

    private isDesktop: boolean
    private scenePod: MinigameScenePod
    private guessgamePod: MinigameCPGuessPod

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
        })
    }

    private setupImage() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY

        this.subBg = this.scene.add.image(0, this.isDesktop ? 35 : 110, 'minigame-3-sub-bg')

        this.guessgamePod = PodProvider.instance.minigameCPGuessThisPicturePod
        this.gameLogo = this.scene.add
            .image(this.isDesktop ? -176 : 110, this.isDesktop ? -260 : 110, 'minigame-3-logo')
            .setDisplaySize(242, 194)

        this.minigameCPGuessCellGroupView = new MinigameCPGuessGuessCellGroupView(
            this.scene,
            this.guessgamePod,
            0,
            this.isDesktop ? 10 : -15
        )
        this.minigameCPGuessAnswerCellGroupView = new MinigameCPGuessAnswerCellGroupView(
            this.scene,
            this.guessgamePod,
            this.isDesktop ? -135 : -97,
            this.isDesktop ? 278 : 188
        )
        this.lifeCountView = new LifeCountView(this.scene, centerX + 144, centerY - 241)
        this.countdownView = new MinigameCountdownView(this.scene)

        this.dimGameplayScreen = this.scene.add
            .rectangle(0, this.isDesktop ? 36 : 0, this.isDesktop ? 430 : 0, this.isDesktop ? 630 : 0, 0x000000)
            .setAlpha(0.4)

        this.minigameCPGuessShowAnswerPanelView = new MinigameCPGuessRevealAnswerPanelView(
            this.scene,
            this.guessgamePod,
            centerX + 0,
            centerY - 0
        )

        this.minigameCPGuessCellGroupView.doInit()
        this.minigameCPGuessAnswerCellGroupView.doInit()
        this.lifeCountView.doInit(3, 1, false)
        this.countdownView.doInit(0, this.minigameCPGuessCellGroupView.y + (this.isDesktop ? 0 : 75))
        this.minigameCPGuessShowAnswerPanelView.doInit()

        this.mainGameplayGroup.add([
            this.subBg,
            this.gameLogo,
            this.minigameCPGuessCellGroupView,
            this.minigameCPGuessAnswerCellGroupView,
        ])
        this.overlayCountDownGroup.add([this.dimGameplayScreen, this.countdownView])
        this.minigameCPGuessShowAnswerPanelView.setDepth(1).setVisible(false)
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
                    this.timeBarView.startTimeBar(MinigameCPGuessGameplayUIView.TIME_LIMIT, true, true)
                    break
                case MinigameState.Completed:
                    this.minigameCPGuessAnswerCellGroupView.setCanInteractButton(false)
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
            this.minigameCPGuessAnswerCellGroupView.setCanInteractButton(false)
            this.minigameCPGuessShowAnswerPanelView.setPanelOnResult(value)
            this.showAnswer()
            if (value) {
                this.checkScoreWin()
            } else {
                this.scenePod.score = 0
                this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' card'
            }
            this.gameResultIsWinSubscription?.unsubscribe()
        })
    }

    private startGame() {
        console.log('startgame')
        this.setUIVisible(true)
        this.guessgamePod.resetPod()
        this.lifeCountView.resetAllLifeCount()
        this.dimGameplayScreen.setVisible(true)
        this.minigameCPGuessCellGroupView.setCellBeforeStart()
        this.minigameCPGuessAnswerCellGroupView.setCellBeforeStart()
        this.timeBarView.startTimeBar(MinigameCPGuessGameplayUIView.TIME_LIMIT, true, false)
        this.countdownView.startCountdown(() => {})
    }

    private setToGameStart() {
        this.guessgamePod.getMinigameGuessData().subscribe(() => {
            this.dimGameplayScreen.setVisible(false)
            this.minigameCPGuessCellGroupView.setNewGameCellGroup()
            this.minigameCPGuessAnswerCellGroupView.setNewGameAllCell()
        })
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
            this.timeBarView.doInit(centerX + 55, centerY - 195, 201, 58, 0, 145, 20, -5, 11)
            this.timeBarView.createTextTime(-5, -7, '#585858', 22)
        }

        this.timeBarView.addCallBack(() => {
            this.minigameCPGuessShowAnswerPanelView.setPanelOnResult(false)
            this.scenePod.score = 0
            this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' card'
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
        this.scenePod.textScore = Math.abs(this.guessgamePod.remainingClickTimes.value - 3) + ' card'
    }

    private showAnswer() {
        this.minigameCPGuessCellGroupView.randomHideAllCell()
        this.countdownShowHintAnswer = timer(MinigameCPGuessGameplayUIView.TIME_SHOW_HINT_ANSWER).subscribe((_) => {
            this.minigameCPGuessShowAnswerPanelView.playVisiblePanelTween()
            this.countdownShowRevealAnswerPanel = timer(MinigameCPGuessGameplayUIView.TIME_REVEAL_ANSWER).subscribe(
                () => {
                    this.scenePod.setSceneState(MinigameState.Completed)
                    this.scenePod.callBackOnOpenResult = () => {
                        this.minigameCPGuessShowAnswerPanelView.playHidePanelTween()
                    }
                    this.countdownShowRevealAnswerPanel?.unsubscribe()
                }
            )
            this.countdownShowHintAnswer?.unsubscribe()
        })
    }
}
