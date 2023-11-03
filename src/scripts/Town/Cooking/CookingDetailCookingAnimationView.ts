import { GameObjects, Scene } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CookingPod } from '../Pod/CookingPod'
import { CookingDetailState } from './CookingDetailState'

export class CookingDetailCookingAnimationView extends GameObjects.Container {
    private cookingAnimationBackground: GameObjects.NineSlice
    private cookingLoadingSprite: GameObjects.Sprite
    private cookingLoadingTextSprite: GameObjects.Sprite
    private cookingText: GameObjects.Text

    private isDesktop: boolean

    private stateSubscription: Subscription

    private cookingPod: CookingPod

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.cookingPod = PodProvider.instance.cookingPod
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        this.setupCookingAnimationUI()
        this.setupSubscribe()
    }

    private setupCookingAnimationUI(): void {
        this.cookingAnimationBackground = this.scene.add.nineslice(
            0,
            0,
            'collection-card',
            '',
            this.isDesktop ? 460 : 340,
            336,
            30,
            30,
            30,
            30
        )

        this.cookingLoadingSprite = this.scene.add.sprite(0, -30, 'loading-cooking-loop')

        this.cookingText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setOrigin(0.5)
            .setText('COOKING')
            .setStyle({ fill: '#585858', fontSize: 36 })
            .setPosition(-20, this.cookingAnimationBackground.height / 2 - 65)

        this.cookingLoadingTextSprite = this.scene.add.sprite(
            this.cookingText.width / 2,
            this.cookingAnimationBackground.height / 2 - 56,
            'loading-text-loop'
        )

        this.cookingAnimationBackground.setInteractive()
        this.add([
            this.cookingAnimationBackground,
            this.cookingLoadingSprite,
            this.cookingText,
            this.cookingLoadingTextSprite,
        ])
    }

    private setupSubscribe(): void {
        this.cookingPod.cookingDetailState.subscribe((state) => {
            if (state == CookingDetailState.CookingAnimation) {
                this.cookingLoadingSprite.play('loading-cooking-loop')
                this.cookingLoadingTextSprite.play('loading-text-loop')
            } else {
                this.cookingLoadingSprite?.stop()
                this.cookingLoadingTextSprite?.stop()
            }
        })
    }
}
