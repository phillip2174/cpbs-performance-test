import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { TutorialManager } from '../scripts/Manager/TutorialManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { TutorialPanelView } from './TutorialPanelView'
import { Subscription, timer } from 'rxjs'
import { TutorialState } from './TutorialState'
import { GameConfig } from '../scripts/GameConfig'

export class TutorialView extends GameObjects.GameObject {
    private tutorialPanel: TutorialPanelView
    private tutorialManager: TutorialManager

    private stateSubscription: Subscription
    private timerCountDown: Subscription
    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.tutorialManager = PodProvider.instance.tutorialManager

        console.log('[][][] welcome to tutorial [][][]')

        this.tutorialPanel = new TutorialPanelView(
            this.scene,
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        ).setDepth(300)
        this.tutorialPanel.doInit()

        this.stateSubscription = this.tutorialManager.tutorialState.subscribe((state) => {
            switch (state) {
                case TutorialState.CountDown:
                    this.timerCountDown = timer(GameConfig.TIME_DURATION_TUTORIAL).subscribe((_) => {
                        this.tutorialManager.setTutorialState(TutorialState.ShowUI)
                    })
                    break
                case TutorialState.ShowUI:
                    this.timerCountDown?.unsubscribe()
                    break
            }
        })

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.timerCountDown?.unsubscribe()
        })
    }
}
