import { GameObjects, Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { GuideLineUICellPod } from './GuideLineUICellPod'
import { GuideLineUICellState } from './GuideLineUICellState'
import { IngredientBean } from './IngredientBean'

export class GuideLineUICellView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`
    public static readonly INGREDIENT_IMAGE_NOTFOUND_KEY: string = `ingredient_bw_`
    public ingredientBean: IngredientBean
    private ingredientImage: GameObjects.Image
    private backgroundImage: GameObjects.Image

    private pod: GuideLineUICellPod
    private stateSubscription: Subscription

    constructor(scene: Scene, ingredientBean: IngredientBean) {
        super(scene)
        GameObjectConstructor(scene, this)
        this.ingredientBean = ingredientBean
        this.pod = new GuideLineUICellPod(this.scene)

        if (this.ingredientBean.isFound) this.pod.changeState(GuideLineUICellState.IdleFound)
        else this.pod.changeState(GuideLineUICellState.IdleNotFound)
    }

    public doInit(x: number, y: number) {
        this.ingredientImage = this.scene.add
            .image(x, y, GuideLineUICellView.INGREDIENT_IMAGE_NOTFOUND_KEY + this.ingredientBean.ingredientID)
            .setScale(0.35)
            .setDepth(1)

        this.stateSubscription = this.pod.guideLineUICellState.subscribe((state) => {
            switch (state) {
                case GuideLineUICellState.IdleFound:
                    this.ingredientImage
                        .setTexture(GuideLineUICellView.INGREDIENT_IMAGE_KEY + this.ingredientBean.ingredientID)
                        .clearTint()
                    break
                case GuideLineUICellState.IdleNotFound:
                    this.ingredientImage
                        .setTexture(
                            GuideLineUICellView.INGREDIENT_IMAGE_NOTFOUND_KEY + this.ingredientBean.ingredientID
                        )
                        .setTintFill(0x9496a9)
                    break
                case GuideLineUICellState.TweenToFound:
                    PodProvider.instance.guideLineUIManager.updateCurrentFoundIngredientCount()
                    this.tweenGuideLine()
                    break
            }
        })
        this.backgroundImage = this.scene.add.image(x, y, 'ingredient-slot')
    }

    private tweenGuideLine() {
        this.ingredientImage
            .setTexture(GuideLineUICellView.INGREDIENT_IMAGE_KEY + this.ingredientBean.ingredientID)
            .clearTint()

        this.scene.tweens.chain({
            targets: this.ingredientImage,
            tweens: [
                {
                    ease: 'Quart.easeInOut',
                    duration: 500,
                    props: {
                        scale: { from: 0.35, to: 0.5 },
                    },
                },
                {
                    ease: 'cubic.inout',
                    yoyo: true,
                    repeat: 1,
                    duration: 100,
                    props: {
                        rotation: { from: this.ingredientImage.rotation, to: this.ingredientImage.rotation - 0.2 },
                    },
                },
                {
                    ease: 'Quart.easeInOut',
                    duration: 300,
                    props: {
                        scale: { from: 0.5, to: 0.31 },
                    },
                },
                {
                    ease: 'Quart.easeInOut',
                    duration: 200,
                    props: {
                        scale: { from: 0.31, to: 0.35 },
                    },
                },
            ],
            onComplete: () => {
                this.ingredientImage.rotation = 0
                PodProvider.instance.guideLineUIManager.checkIsAllIngredientFound()
            },
        })
    }

    public updateCellView() {
        console.log('update cellview')
        this.pod.changeState(GuideLineUICellState.TweenToFound)
    }

    public addImagesToContainer(): void {
        this.add([this.backgroundImage, this.ingredientImage])
    }

    public destroy(fromScene?: boolean): void {
        if (!fromScene) {
            this.ingredientImage?.destroy()
            this.backgroundImage?.destroy()
        }
        this.stateSubscription?.unsubscribe()
        super.destroy(fromScene)
    }
}
