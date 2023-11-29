import { GameObjects, Scene } from 'phaser'
import { Subscription, skip, timer } from 'rxjs'
import { LifeCountView } from '../../../life-count/LifeCountView'
import { TimeBarView } from '../../../bar/TimeBarView'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameState } from '../MinigameState'
import { MinigameCPOrderBubbleView } from './MinigameCPOrderBubbleView'
import { MinigameCPOrderCharacterView } from './MinigameCPOrderCharacterView'
import { MinigameCpOrderMenuCellGroupView } from './MinigameCPOrderMenuCellGroupView'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { MinigameCPOrderPod } from './MinigameCPOrderPod'
import { MinigameCPOrderCountdownView } from './MinigameCPOrderCountdownView'
import { BoldText } from '../../../BoldText/BoldText'
import { AudioManager } from '../../Audio/AudioManager'

export class MinigameCPOrderGameplayUIView extends GameObjects.GameObject {
    public static readonly MAX_LIFE_COUNT: number = 3
    public static readonly MAX_ORDER_COUNT: number = 10
    public static readonly ORDER_TIME_LIMIT: number = 3000

    private scenePod: MinigameScenePod
    private minigamePod: MinigameCPOrderPod

    private menuCellGroupView: MinigameCpOrderMenuCellGroupView
    private characterView: MinigameCPOrderCharacterView
    private countdownView: MinigameCPOrderCountdownView

    private orderTimer: TimeBarView
    private lifeCount: LifeCountView

    private subBg: GameObjects.Image
    private characterOrderBg: GameObjects.Image
    private gameLogo: GameObjects.Image
    private orderTextSeparateLine: GameObjects.Image

    private orderText: GameObjects.Text
    private orderCountText: GameObjects.Text

    private cameraCenterX: number
    private cameraCenterY: number

    private isDesktop: boolean
    private isNotifyTimeRunOut: boolean = false

    private gameplayUIContainer: GameObjects.Container
    private characterOrderContainer: GameObjects.Container

    private audioManager: AudioManager

    private sceneStateSubscription: Subscription
    private orderCountSubscription: Subscription
    private changeOrderSubscription: Subscription
    private timerDelaySubscription: Subscription
    private timerZeroSubscription: Subscription
    private lifeCountSubscription: Subscription
    private timerRunOutSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.isDesktop = this.scene.sys.game.device.os.desktop
        this.cameraCenterX = this.scene.cameras.main.centerX
        this.cameraCenterY = this.scene.cameras.main.centerY
        this.scenePod = PodProvider.instance.minigameScenePod
        this.minigamePod = PodProvider.instance.minigameCPOrderPod
        this.audioManager = PodProvider.instance.audioManager

        this.setupUIContainer()
        this.setupSubscribe()

        this.orderTimer.addCallBack(() => {
            this.minigamePod.setIsTimerZero(true)
        })
    }

    public onUpdate(): void {
        if (this.orderTimer?.getIsTimeRunningOut() && !this.isNotifyTimeRunOut) {
            this.minigamePod.setIsTimeRunningOut(this.orderTimer?.getIsTimeRunningOut())
            this.isNotifyTimeRunOut = true
        }
    }

    private setupUIContainer(): void {
        this.gameplayUIContainer = this.scene.add.container(this.cameraCenterX, this.cameraCenterY)
        this.characterOrderContainer = this.scene.add.container()

        this.menuCellGroupView = new MinigameCpOrderMenuCellGroupView(this.scene)
        this.characterView = new MinigameCPOrderCharacterView(this.scene)
        this.orderTimer = new TimeBarView(this.scene)
        this.countdownView = new MinigameCPOrderCountdownView(this.scene)

        this.subBg = this.scene.add.image(0, 0, 'minigame-2-sub-bg')
        this.characterOrderBg = this.scene.add.image(0, 0, 'minigame-2-character-order-bg')
        this.gameLogo = this.scene.add.image(0, 0, 'minigame-2-logo')

        this.isDesktop ? this.setupUIDesktop() : this.setupUIMobile()
        this.characterView.doInit(0, this.characterOrderBg.y + 5)
        this.lifeCount.doInit(MinigameCPOrderGameplayUIView.MAX_LIFE_COUNT, this.isDesktop ? 1 : 0.75)
        this.countdownView.doInit(0, this.menuCellGroupView.y + (this.isDesktop ? 100 : 75))

        this.characterOrderContainer.add([this.characterOrderBg, this.characterView])
        this.gameplayUIContainer.add([
            this.subBg,
            this.gameLogo,
            this.characterOrderContainer,
            this.menuCellGroupView,
            this.countdownView,
        ])
    }

    private setupUIDesktop(): void {
        this.subBg.setSize(489, 680).setDisplaySize(489, 680)

        this.characterOrderBg
            .setPosition(-3, -this.subBg.height / 2 + 230)
            .setSize(400, 220)
            .setDisplaySize(400, 220)

        this.gameLogo
            .setPosition(-this.subBg.width / 2 + 65, -this.subBg.height / 2 + 45)
            .setSize(232, 184)
            .setDisplaySize(232, 184)

        this.menuCellGroupView.doInit(0, 60, this.orderTimer)
        this.orderTimer.doInit(this.cameraCenterX + 65, this.cameraCenterY - 265, 271, 70, 0, 199, 18, -10, 18, 8, 48)
        this.lifeCount = new LifeCountView(this.scene, this.orderTimer.x + 85, this.orderTimer.y - 10)
        this.orderText = new BoldText(this.scene, this.orderTimer.x - 42, this.lifeCount.y - 1, 'ORDER', 24, '#EE843C')

        this.orderTextSeparateLine = this.scene.add
            .image(this.orderText.x + this.orderText.width / 2 + 5, this.orderText.y + 2.5, 'line-completed')
            .setScale(1.5)

        this.orderCountText = new BoldText(
            this.scene,
            this.orderText.x + 38,
            this.orderText.y,
            '',
            24,
            '#2B2B2B'
        ).setOrigin(0, 0.5)
    }

    private setupUIMobile(): void {
        this.gameplayUIContainer.setPosition(this.cameraCenterX, this.cameraCenterY + 30)
        this.subBg.setSize(360, 540).setDisplaySize(360, 540)

        this.characterOrderBg
            .setPosition(-3, -this.subBg.height / 2 + 190)
            .setSize(308, 170)
            .setDisplaySize(308, 170)

        this.gameLogo
            .setPosition(-this.subBg.width / 2 + 60, -this.subBg.height / 2 + 55)
            .setSize(153, 121)
            .setDisplaySize(153, 121)

        this.menuCellGroupView.doInit(0, 55, this.orderTimer)
        this.orderTimer.doInit(this.cameraCenterX + 50, this.cameraCenterY - 175, 201, 58, 0, 145, 20, -5, 10, 3, 40)
        this.lifeCount = new LifeCountView(this.scene, this.orderTimer.x + 58, this.orderTimer.y - 13)
        this.characterView.setScale(0.76)

        this.orderCountText = new BoldText(
            this.scene,
            this.orderTimer.x - 42,
            this.lifeCount.y,
            '',
            22,
            '#2B2B2B'
        ).setOrigin(0, 0.5)
    }

    private setupSubscribe(): void {
        this.sceneStateSubscription = this.scenePod.sceneState.subscribe((state) => {
            switch (state) {
                case MinigameState.StartMenu:
                    this.setUIVisible(false)
                    break
                case MinigameState.BeforeStart:
                    this.startGame()
                    break
                case MinigameState.FinishCountdown:
                    this.characterView.playCharacterMoveTween()
                    break
                case MinigameState.GameStart:
                    this.orderTimer.startTimeBar(MinigameCPOrderGameplayUIView.ORDER_TIME_LIMIT, true, true)
                    break
                case MinigameState.Completed:
                    this.orderTimer.pauseTimebar()
                    this.timerDelaySubscription?.unsubscribe()
                    break
                case MinigameState.Setting:
                    break
            }
        })

        this.orderCountSubscription = this.minigamePod.currentOrderCount.subscribe((orderCount) => {
            if (orderCount >= 11) {
                this.scenePod.setTextScore(this.minigamePod.servedOrderCount + ` ORDERS`)
                this.OnGameComplete()
                this.audioManager.playSFXSound('win_sfx')
            } else {
                if (this.lifeCount.getCurrentLifeCount() > 0) {
                    this.orderCountText.setText(`${orderCount}/${MinigameCPOrderGameplayUIView.MAX_ORDER_COUNT}`)
                }
            }
        })

        this.lifeCountSubscription = this.minigamePod.isDecreaseLifeCount.subscribe((isDecrease) => {
            if (isDecrease) {
                this.lifeCount.decreaseLifeCount()
            }

            if (this.lifeCount.getCurrentLifeCount() <= 0) {
                this.scenePod.setTextScore(this.minigamePod.servedOrderCount + ` ORDERS`)
                this.OnGameComplete()
                this.audioManager.playSFXSound('lose_sfx')
            }
        })

        this.timerZeroSubscription = this.minigamePod.isTimerZero.pipe(skip(1)).subscribe((isZero) => {
            if (isZero) {
                this.minigamePod.setOrderFailMark()
                this.audioManager.playSFXSound('order_incorrect_sfx')
            }
        })

        this.changeOrderSubscription = this.minigamePod.isChangeOrder.subscribe((isChange) => {
            if (isChange && this.lifeCount.getCurrentLifeCount() > 0) {
                this.orderTimer.pauseTimebar()
                this.timerDelaySubscription = timer(950).subscribe((_) => {
                    this.orderTimer.startTimeBar(MinigameCPOrderGameplayUIView.ORDER_TIME_LIMIT, true, true)
                    this.isNotifyTimeRunOut = false
                    this.timerDelaySubscription?.unsubscribe()
                })
            }
        })

        this.on('destroy', () => {
            this.changeOrderSubscription?.unsubscribe()
            this.timerZeroSubscription?.unsubscribe()
            this.lifeCountSubscription?.unsubscribe()
            this.sceneStateSubscription?.unsubscribe()
            this.orderCountSubscription?.unsubscribe()
            this.orderCountSubscription?.unsubscribe()
        })
    }

    private startGame(): void {
        this.isNotifyTimeRunOut = false
        this.setUIVisible(true)
        this.menuCellGroupView.showStartPreview()
        this.characterView.onStartGame()
        this.orderTimer.startTimeBar(MinigameCPOrderGameplayUIView.ORDER_TIME_LIMIT, false, false)
        this.orderTimer.pauseTimebar()
        this.lifeCount.resetAllLifeCount()
        this.minigamePod.currentOrderCount.next(0)
        this.minigamePod.servedOrderCount = 0
        this.countdownView.startCountdown(() => this.menuCellGroupView.updateCells())
    }

    private setUIVisible(isVisible: boolean): void {
        this.orderTimer?.setVisible(isVisible)
        this.orderText?.setVisible(isVisible)
        this.orderTextSeparateLine?.setVisible(isVisible)
        this.orderCountText?.setVisible(isVisible)
        this.lifeCount?.setVisible(isVisible)
        this.gameplayUIContainer?.setVisible(isVisible)
    }

    private OnGameComplete(): void {
        this.scenePod.score = this.lifeCount.getCurrentLifeCount()
        this.scenePod.setSceneState(MinigameState.Completed)
    }
}
