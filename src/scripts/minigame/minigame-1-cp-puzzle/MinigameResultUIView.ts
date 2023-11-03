import { GameObjects, Scene } from 'phaser'
import { Observable, concat, concatAll, takeLast } from 'rxjs'
import { Button } from '../../button/Button'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameResultBean } from '../MinigameResultBean'
import { MinigameScenePod } from '../MinigameScenePod'
import { MinigameState } from '../MinigameState'
import { TextAdapter } from './../../text-adapter/TextAdapter'
import { MinigameResultBonusView } from './MinigameResultBonusView'
import { MinigameResultStarView } from './MinigameResultStarView'

export class MinigameResultUIView extends GameObjects.GameObject {
    private group: GameObjects.Container
    private scenePod: MinigameScenePod
    private isDesktop: boolean
    private dim: GameObjects.Rectangle
    private score: number
    bg: GameObjects.Image
    backButton: Button
    playAgainButton: Button
    resultImage: GameObjects.Image
    scoreImage: GameObjects.Image
    scoreHeaderText: GameObjects.Text
    scoreText: GameObjects.Text
    star1: MinigameResultStarView
    star2: MinigameResultStarView
    star3: MinigameResultStarView
    starEffect: GameObjects.Image
    failImage: GameObjects.Image
    bonus: MinigameResultBonusView
    result: MinigameResultBean

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(pod: MinigameScenePod): void {
        this.scenePod = pod
        this.group = this.scene.add.container()
        this.setUpImage()
        this.setUpButton()
        this.group.setDepth(2)
        this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.Completed) this.showUI()
            else this.hideUI()
        })
    }

    public showUI() {
        console.log(this)
        this.group.setActive(true)
        this.group.setVisible(true)
        this.scenePod.resultMinigame().subscribe((result) => {
            this.result = result
            this.scoreText.setText(this.scenePod.textScore)
            this.showScore(result.star)
            this.bonus.updateView(this.result)
        })
    }

    public hideUI() {
        this.group.setActive(false)
        this.group.setVisible(false)
    }

    private setUpImage() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY
        this.dim = this.scene.add.rectangle(
            centerX,
            centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        )
        this.dim.setInteractive()
        this.group.add(this.dim)

        this.bg = this.scene.add.image(centerX, centerY + 90, 'minigame-result-bg')
        this.group.add(this.bg)

        this.resultImage = this.scene.add.image(centerX, centerY - 100, 'minigame-result-complete')
        this.group.add(this.resultImage)

        this.scoreHeaderText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('TIME')
            .setOrigin(0.5)
            .setPosition(centerX, centerY - 40)
            .setStyle({
                fill: '#2B2B2B',
                fontSize: 28,
            })
        this.group.add(this.scoreHeaderText)
        this.scoreImage = this.scene.add.image(centerX, centerY + 10, 'minigame-result-time')
        this.group.add(this.scoreImage)
        this.scoreText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('00:00s')
            .setOrigin(0.5)
            .setPosition(centerX, centerY + 7)
            .setStyle({
                fill: '#29CC6A',
                fontSize: 36,
            })
        this.group.add(this.scoreText)

        this.starEffect = this.scene.add.image(centerX, centerY - 225, 'minigame-result-star-effect')
        this.group.add(this.starEffect)
        this.starEffect.setVisible(false)
        this.star1 = new MinigameResultStarView(this.scene)
        this.star1.doInit(centerX - 110, centerY - 130)
        this.star1.setScale(0.9)
        this.star2 = new MinigameResultStarView(this.scene)
        this.star2.doInit(centerX, centerY - 145)
        this.star3 = new MinigameResultStarView(this.scene)
        this.star3.doInit(centerX + 110, centerY - 130)
        this.star3.setScale(0.9)

        this.group.add([this.star1, this.star2, this.star3])

        this.failImage = this.scene.add.image(centerX, centerY + 130, 'minigame-result-no-reward')
        this.failImage.setVisible(false)
        this.group.add(this.failImage)
        this.bonus = new MinigameResultBonusView(this.scene)
        this.bonus.doInit(centerX, centerY + 140)
        this.group.add(this.bonus)
    }

    private setUpButton() {
        var centerX = this.scene.cameras.main.centerX
        var centerY = this.scene.cameras.main.centerY

        this.backButton = new Button(this.scene, centerX - 120, centerY + 270, 136, 48, 'minigame-result-back', 0, '')
        this.group.add(this.backButton)
        this.backButton.onClick(() => {})

        this.playAgainButton = new Button(
            this.scene,
            centerX + 80,
            centerY + 270,
            216,
            48,
            'minigame-result-play-again',
            0,
            'Play Game (1/3)'
        )
        this.playAgainButton.setTextPosition(20, 1)
        this.playAgainButton.setTextSize(24)
        this.group.add(this.playAgainButton)
        this.playAgainButton.onClick(() => {})
    }

    private showScore(score: number) {
        if (score == 0) {
            this.resultImage.setTexture('minigame-result-fail')
            this.failImage.setVisible(true)
            this.bonus.setVisible(false)
            this.scoreText.setStyle({
                fill: '#FC5555',
            })
            return
        }
        this.scoreText.setStyle({
            fill: '#2B2B2B',
        })
        this.resultImage.setTexture('minigame-result-complete')
        this.failImage.setVisible(false)
        this.bonus.setVisible(true)

        let observableList: Observable<any>[] = []
        if (score >= 1) {
            observableList.push(this.star1.showStar())
        }
        if (score >= 2) {
            observableList.push(this.star2.showStar())
        }
        if (score >= 3) {
            observableList.push(this.star3.showStar())
        }

        concat(observableList)
            .pipe(concatAll(), takeLast(1))
            .subscribe(() => {
                console.log('Complete')
                if (score >= 3) {
                    this.scene.tweens.add({
                        targets: this.starEffect,
                        ease: `Sine.easeInOut`,
                        duration: 400,
                        props: {
                            scale: { from: 0, to: 1 },
                        },
                        onStart: () => {
                            this.starEffect.setVisible(true)
                        },
                    })
                }
            })
    }
}
