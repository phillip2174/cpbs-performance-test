import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { MinigameCPOrderBubbleView } from './MinigameCPOrderBubbleView'

export class MinigameCPOrderCharacterView extends GameObjects.Container {
    private characterImage: GameObjects.Image
    private bubbleView: MinigameCPOrderBubbleView

    private originPosX: number
    private originPosY: number

    private isBubbleInit: boolean = false

    private characterMovingTween: Tweens.Tween

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number) {
        this.bubbleView = new MinigameCPOrderBubbleView(this.scene)
        this.characterImage = this.scene.add.image(0, 0, 'minigame-2-character-idle')
        this.setPosition(x, y)
        this.originPosX = this.characterImage.x
        this.originPosY = this.characterImage.y
        this.add([this.characterImage, this.bubbleView])
        this.createCharacterTween()
    }

    public playCharacterMoveTween(): void {
        this.characterMovingTween?.restart()
    }

    public onStartGame(): void {
        this.characterImage.setTexture('minigame-2-character-idle')
        this.characterImage.setPosition(this.originPosX, this.originPosY)
        this.bubbleView.onStartGame()
    }

    private createCharacterTween(): void {
        this.characterMovingTween = this.scene.add.tween({
            targets: this.characterImage,
            duration: 300,
            ease: 'cubic.inout',
            props: { x: { from: this.characterImage.x, to: this.characterImage.x - 95 } },
            persist: true,
            paused: true,
            onComplete: () => {
                this.characterImage.setTexture('minigame-2-character-think')
                if (!this.isBubbleInit) {
                    this.bubbleView.doInit(35, -30)
                    this.isBubbleInit = true
                } else {
                    this.bubbleView.playBubblesTween()
                }
            },
        })
    }
}
