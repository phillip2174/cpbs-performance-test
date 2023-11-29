import { GameObjects, Scene } from 'phaser'
import { Observable, concat, concatAll, takeLast } from 'rxjs'
import { Button } from '../button/Button'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { MinigameResultBean } from './MinigameResultBean'
import { MinigameScenePod } from './MinigameScenePod'
import { MinigameState } from './MinigameState'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { MinigameResultBonusView } from './MinigameResultBonusView'
import { MinigameResultStarView } from './MinigameResultStarView'
import { MinigameResultUIView } from './MinigameResultUIView'
import { BoldText } from '../../BoldText/BoldText'

export class MinigameResultUIMiniView extends MinigameResultUIView {
    protected setSubscribe() {
        this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.Completed && !this.scenePod.isPlayOnline) this.showUI()
            else this.hideUI()
        })
    }

    protected onShowScore() {}

    protected setUpUI() {
        this.dim = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        )
        this.dim.setInteractive()
        //this.group.add(this.dim)

        this.bg = this.scene.add.image(0, 70, 'minigame-result-bg-mini')
        this.bg.setScale(this.isDesktop ? 1 : 0.75, this.isDesktop ? 1 : 0.9)
        this.group.add(this.bg)

        this.starGroup = this.scene.add.container(0, this.isDesktop ? -105 : -90)
        this.group.add(this.starGroup)
        this.starEffect = this.scene.add.image(0, -70, 'minigame-result-star-effect')
        this.group.add(this.starEffect)
        this.starEffect.setVisible(false)
        this.star1 = new MinigameResultStarView(this.scene)
        this.star1.doInit(-110, 15)
        this.star1.setScale(0.9)
        this.star2 = new MinigameResultStarView(this.scene)
        this.star2.doInit(0, 0)
        this.star3 = new MinigameResultStarView(this.scene)
        this.star3.doInit(110, 15)
        this.star3.setScale(0.9)

        this.group.add([this.star1, this.star2, this.star3])
        this.starGroup.add([this.starEffect, this.star1, this.star2, this.star3])
        this.starGroup.setScale(this.isDesktop ? 1 : 0.9)

        this.resultImage = this.scene.add.image(0, this.isDesktop ? -55 : -45, 'minigame-result-complete')
        this.group.add(this.resultImage)

        this.scoreHeaderText = new BoldText(this.scene, 0, this.isDesktop ? 5 : 10, this.textHeader, 28, '#2B2B2B')
        this.group.add(this.scoreHeaderText)
        this.scoreImage = this.scene.add.image(0, this.isDesktop ? 55 : 60, 'minigame-result-score')
        this.group.add(this.scoreImage)
        this.scoreText = new BoldText(this.scene, 0, this.isDesktop ? 51 : 57, '00:00s', 36, '#29CC6A')
        this.group.add(this.scoreText)

        this.backButton = new Button(
            this.scene,
            this.isDesktop ? -120 : -90,
            145,
            this.isDesktop ? 136 : 101,
            48,
            'minigame-result-back',
            0,
            ''
        )
        this.group.add(this.backButton)
        this.backButton.onClick(() => {
            this.scenePod.setSceneState(MinigameState.StartMenu)
        })

        this.playAgainButton = new Button(
            this.scene,
            this.isDesktop ? 80 : 60,
            145,
            this.isDesktop ? 216 : 178,
            48,
            'minigame-result-play-again',
            0,
            ''
        )
        this.playAgainButton.setTextPosition(20, 1)
        this.playAgainButton.setTextSize(24)
        this.group.add(this.playAgainButton)
        this.playAgainButton.onClick(() => {
            if (this.isPlay) return
            this.scenePod.startGame().subscribe((startResult) => {
                this.hideUI()
                this.scenePod.setSceneState(MinigameState.BeforeStart)
            })
        })
    }

    protected OnClickBackButton() {
        this.scenePod.setSceneState(MinigameState.StartMenu)
    }

    protected OnClickPlayAgainButton() {
        if (this.isPlay) return
        this.scenePod.startGame().subscribe((startResult) => {
            this.hideUI()
            this.scenePod.setSceneState(MinigameState.BeforeStart)
        })
    }
}
