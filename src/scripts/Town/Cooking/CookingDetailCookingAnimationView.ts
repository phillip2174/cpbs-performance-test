import { GameObjects, Scene } from 'phaser'
import { Subscription, timer } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { CookingPod } from '../Pod/CookingPod'
import { CookingDetailState } from './CookingDetailState'
import { AudioManager } from '../../Audio/AudioManager'
import { BoldText } from '../../../BoldText/BoldText'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class CookingDetailCookingAnimationView extends GameObjects.Container {
    private cookingAnimationBackground: GameObjects.NineSlice
    private cookingLoadingSprite: GameObjects.Sprite
    private cookingLoadingTextSprite: GameObjects.Sprite
    private cookingText: GameObjects.Text

    private cookingSFX: Phaser.Sound.BaseSound

    private isDesktop: boolean

    private stateSubscription: Subscription

    private audioManager: AudioManager

    private cookingPod: CookingPod
    cookingDetailStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(): void {
        this.audioManager = PodProvider.instance.audioManager
        this.cookingPod = PodProvider.instance.cookingPod
        this.isDesktop = DeviceChecker.instance.isDesktop()

        this.cookingSFX = this.audioManager.createSFXSoundObject('cooking_sound_effect', true)
        this.cookingSFX.stop()

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

        this.cookingText = new BoldText(
            this.scene,
            -20,
            this.cookingAnimationBackground.height / 2 - 65,
            'COOKING',
            36,
            '#585858'
        )

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
        this.cookingDetailStateSubscription = this.cookingPod.cookingDetailState.subscribe((state) => {
            if (state == CookingDetailState.CookingAnimation) {
                this.cookingSFX.play()

                this.cookingLoadingSprite.play('loading-cooking-loop')
                this.cookingLoadingTextSprite.play('loading-text-loop')
            } else {
                this.cookingSFX.stop()

                this.cookingLoadingSprite?.stop()
                this.cookingLoadingTextSprite?.stop()
            }
        })

        this.on('destroy', () => {
            this.cookingDetailStateSubscription?.unsubscribe()
        })
    }
}
