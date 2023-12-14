import { GameObjects, Scene } from 'phaser'
import { Observable, Subscription, concat, concatAll, delay, takeLast } from 'rxjs'
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
import { MinigameResultTicketUIView } from './MinigameResultTicketUIView'
import { APILoadingManager } from '../api-loading/APILoadingManager'
import { GameConfig } from '../GameConfig'

export class MinigameResultUIMiniView extends MinigameResultUIView {
    protected setSubscribe() {
        this.sceneStateSubscription =   this.scenePod.sceneState.subscribe((state) => {
            if (state == MinigameState.Completed && !this.scenePod.isPlayOnline) this.showUI()
            else this.hideUI()
        })
        
        this.ticketSubscription = this.scenePod.ticket.subscribe((ticket) => {

            this.minigameResultTicketUIView.setTextTicket(ticket, false)

            if (ticket == 0) {
                this.playAgainButton.background.setTexture('minigame-result-free-play').setSize(this.isDesktop ?  190 : 168,48)
                this.minigameResultTicketUIView.setUICountdown()
                this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 1 : 0.90)
            } else {
                this.playAgainButton.background.setTexture('minigame-result-play-again').setSize(this.isDesktop ?  202 : 178,48)
                this.minigameResultTicketUIView.setUITicket()
                this.bg.setScale(this.isDesktop ? 1 : 0.8, this.isDesktop ? 0.93 : 0.85)
            }
        })

        this.minigameResultTicketUIView.setCallBack( () => 
            this.scenePod.getTicket(true).subscribe()
        );


        this.on('destroy', () => {
            this.ticketSubscription?.unsubscribe()
            this.sceneStateSubscription?.unsubscribe()
        })
    }

    protected onShowScore() {

    }

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

        this.bg = this.scene.add.image(0, this.isDesktop ? -170 : -150, 'minigame-result-bg-mini').setOrigin(0.5,0)
        this.bg.setScale(this.isDesktop ? 1 : 0.75, this.isDesktop ? 1 : 0.8 )
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
            this.OnClickBackButton()
        })

        this.playAgainButton = new Button(
            this.scene,
            this.isDesktop ? 80 : 60,
            145,
            this.isDesktop ?   190 : 168,
            48,
            'minigame-result-free-play',
            0,
            ''
        )
        this.playAgainButton.setTextPosition(20, 1)
        this.playAgainButton.setTextSize(24)
        this.group.add(this.playAgainButton)
        this.playAgainButton.onClick(() => {
            this.OnClickPlayAgainButton()
        })

        this.minigameResultTicketUIView = new MinigameResultTicketUIView(this.scene, 0, this.isDesktop ? 220 : 210, this.scenePod)
        this.group.add(this.minigameResultTicketUIView)
        this.minigameResultTicketUIView.setUICountdown()
    }


    protected OnClickBackButton() {
        if (this.isClickButton) return
        this.isClickButton = true
        this.scenePod.setSceneState(MinigameState.StartMenu)
    }

    protected OnClickPlayAgainButton() {
        if (this.isPlay || this.isClickButton) return
        this.isClickButton = true
        APILoadingManager.instance.showMiniLoading()
        this.scenePod
            .startGame()
            .pipe(delay(GameConfig.IS_MOCK_API ? 1500 : 0))
            .subscribe((startResult) => {
                APILoadingManager.instance.hideMiniLoading()
                this.hideUI()
                this.scenePod.setSceneState(MinigameState.BeforeStart)
            })
    }
}
