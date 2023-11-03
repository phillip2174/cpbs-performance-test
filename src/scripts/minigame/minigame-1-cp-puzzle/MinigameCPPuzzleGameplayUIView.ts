import { GameObjects, Scene } from 'phaser'
import { Subscription, delay, mergeMap } from 'rxjs'
import { Button } from '../../button/Button'
import { MinigameScenePod } from '../MinigameScenePod'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameCPPuzzleImageGroupView } from './MinigameCPPuzzleImageGroupView'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { MinigameState } from '../MinigameState'
import { TimeBarView } from '../../../time-bar/TimeBarView'
import { HeaderScoreView } from '../HeaderScroeView'

export class MinigameCPPuzzleGameplayUIView extends GameObjects.GameObject {
    private group: GameObjects.Container
    private groupBeforeStart: GameObjects.Container
    private dim: GameObjects.Rectangle
    private scenePod: MinigameScenePod
    private isDesktop: boolean
    subBg: GameObjects.Image
    logo: GameObjects.Image
    background: GameObjects.Image
    minigameCPPuzzlePreviewImage: MinigameCPPuzzleImageGroupView
    countdownText: GameObjects.Text

    private timeBarView: TimeBarView

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(pod: MinigameScenePod): void {
        this.scenePod = pod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        this.group = this.scene.add.container(centerX, centerY)
        this.group.setDepth(0);

        this.setUpImage()
        this.setUpButton()
        this.createTimeBar()

        if (!this.isDesktop) {
            this.group.setScale(0.7)
        } else {
            this.minigameCPPuzzlePreviewImage.setScale(1.2)
        }

        this.scenePod.sceneState.subscribe((state) => {
            switch (state) {
                case MinigameState.StartMenu:
                    this.hideUI()
                    break
                case MinigameState.BeforeStart:
                    this.showUI()
                    this.startGame()
                    break
                case MinigameState.GameStart:
                    this.setGameStart()
                    //this.showUI();
                    break
                case MinigameState.Completed:
                    this.setImageCanClick(false);
                    //this.showUI();
                    break
                case MinigameState.Setting:
                    break
                default:
                    break
            }
        })
    }

    public showUI() {
        console.log(this)
        this.group.setActive(true)
        this.group.setVisible(true)

        this.timeBarView.startTimeBar(60000)
        this.timeBarView.setActiveTimeBar(true)
        this.timeBarView.pauseTimebar()
    }

    public hideUI() {
        this.group.setActive(false)
        this.group.setVisible(false)

        this.timeBarView.setActiveTimeBar(false)
    }

    public setGameStart() {
        this.timeBarView.startTimeBar(60000, true)
    }

    private createTimeBar() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        if (this.isDesktop) {
            this.timeBarView = new TimeBarView(this.scene).setDepth(0)
            this.timeBarView.doInit(
                centerX + 65,
                centerY - this.subBg.height / 2 + 80,
                271,
                70,
                0,
                199,
                18,
                -10,
                16,
                10,
                48
            )
            this.timeBarView.createTextTime(-55, -12, '#2b2b2b', 24)
            let headerText = new HeaderScoreView(this.scene, -50, -14, 'TIME').setDepth(100)
            this.timeBarView.add(headerText)
        } else {
            this.timeBarView = new TimeBarView(this.scene).setDepth(0)
            this.timeBarView.doInit(centerX + 55, centerY - this.subBg.height / 2 + 140, 201, 58, 0, 145, 20, -5, 11)
            this.timeBarView.createTextTime(-5, -7, '#585858', 22)
        }

        this.timeBarView.addCallBack(() => {
            this.scenePod.score = 0;
            this.scenePod.textScore =  "00:00s";
            this.scenePod.sceneState.next(MinigameState.Completed)
        })
    }

    private setUpImage() {
        this.subBg = this.scene.add
            .image(0, this.isDesktop ? 20 : 30, `minigame-1-sub-bg`)
            .setScale(this.isDesktop ? 1 : 1.05, this.isDesktop ? 1 : 1.15)
        this.group.add(this.subBg)
        this.logo = this.scene.add.image(this.isDesktop ? -180 : -170, this.isDesktop ? -280 : -290, `minigame-1-logo`)
        this.logo.setScale(this.isDesktop ? 0.5 : 0.45)

        this.group.add(this.logo)

        this.background = this.scene.add
            .image(0, this.isDesktop ? 60 : 85, `minigame-1-background-image`)
            .setScale(this.isDesktop ? 1 : 1.13, this.isDesktop ? 1 : 1.15)
        this.group.add(this.background)

        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY

        this.groupBeforeStart = this.scene.add.container(centerX, centerY).setDepth(1)

        this.dim = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        )

        this.groupBeforeStart.add([this.dim])

        this.countdownText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('Start in : 03s')
            .setOrigin(0.5)
            .setPosition(0, this.isDesktop ? 330 : this.subBg.height / 2 - 0)
            .setStyle({
                fill: '#ffffff',
                fontSize: 28,
            })
        this.groupBeforeStart.add(this.countdownText)

        this.groupBeforeStart.setActive(false)
        this.groupBeforeStart.setVisible(false)

        this.minigameCPPuzzlePreviewImage = new MinigameCPPuzzleImageGroupView(
            this.scene,
            centerX,
            this.isDesktop ? centerY : centerY + 7.5
        )
        this.minigameCPPuzzlePreviewImage.doInit(this.scenePod)
        this.minigameCPPuzzlePreviewImage.setCallBackOnFinish(() => {
            this.timeBarView.pauseTimebar();
            this.scenePod.score = this.timeBarView.getCurrentTime()
            this.scenePod.textScore = this.convertMsToMinutesSeconds( this.timeBarView.getCurrentTime()) + "s";
            this.scenePod.sceneState.next(MinigameState.Completed);
        });
    }

    private setUpButton() {}

    private startGame() {
        this.groupBeforeStart.setVisible(true)
        this.scene.tweens
            .addCounter({
                from: 4,
                to: 0,
                duration: 4000,
                ease: 'liner',
                onStart: () => {
                    this.countdownText.setText(`Start in : 03s`)
                },
                onUpdate: (tween) => {
                    this.countdownText.setText(`Start in : 0${Math.floor(tween.getValue())}s`)
                },
                onComplete: () => {
                    this.countdownText.setText(`Start in : 00s`)
                },
                persist: true,
            })
            .play()
        this.minigameCPPuzzlePreviewImage
            .showPreview()
            .pipe(delay(3300))
            .pipe(mergeMap((_) => this.minigameCPPuzzlePreviewImage.shuffleImage(5)))
            .pipe(delay(500))
            .subscribe((_) => {
                this.groupBeforeStart.setVisible(false)
                console.log('Finish')
                this.scenePod.sceneState.next(MinigameState.GameStart)
            })
    }

    setImageCanClick(isCanClick : boolean)
    {
        this.minigameCPPuzzlePreviewImage.pod.canClick = isCanClick;
    }

    onUpdate() {
        this.minigameCPPuzzlePreviewImage.onUpdate()
    }

    private convertMsToMinutesSeconds(milliseconds: number): string {
        const minutes = Math.floor(milliseconds / 60000)
        const seconds = Math.round((milliseconds % 60000) / 1000)

        return seconds === 60
            ? `${this.padTo2Digits(minutes + 1)}:00`
            : `${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`
    }

    private padTo2Digits(num: number) {
        return num.toString().padStart(2, '0')
    }
}
