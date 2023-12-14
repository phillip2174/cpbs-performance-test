import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { RecipeType } from '../Collection/type/RecipeType'
import { CookState } from '../Collection/type/CookState'
import { RecipeBean } from '../Collection/RecipeBean'
import { AnimationController } from '../AnimationController'
import { DeviceChecker } from '../../plugins/DeviceChecker'

export class RecipePreviewView extends GameObjects.Container {
    public static readonly RECIPE_KEY_IMAGE: string = 'recipe-'

    private recipeImage: GameObjects.Image
    private effectThumbnailImage: GameObjects.Image

    private onHoverButtonIconTween: Tweens.TweenChain
    private onLeaveButtonIconTween: Tweens.TweenChain
    private onHoverRotateButtonIconTween: Tweens.TweenChain
    private onLeaveRotateButtonIconTween: Tweens.TweenChain
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.createUI()
        this.createTween()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setRecipePreviewMaster(recipeId: number) {
        this.recipeImage.setTexture(RecipePreviewView.RECIPE_KEY_IMAGE + recipeId).setTintFill(0xaeaec1)
        this.effectThumbnailImage.setVisible(false)
    }

    public setSecretRecipe(effectTineColorCode: number, isActiveEffect: boolean = true) {
        this.recipeImage.setTexture('secret-recipe').clearTint()
        this.effectThumbnailImage.setTint(effectTineColorCode)
        this.effectThumbnailImage.setVisible(isActiveEffect)
    }

    public setSizeRecipe(width: number, height: number) {
        this.recipeImage.setDisplaySize(width, height)

        this.recipeImage.width = this.recipeImage.getBounds().width
        this.recipeImage.height = this.recipeImage.getBounds().height

        this.createTween()
    }

    public setSizeEffect(width: number, height: number) {
        this.effectThumbnailImage.setDisplaySize(width, height)

        this.effectThumbnailImage.width = this.recipeImage.getBounds().width
        this.effectThumbnailImage.height = this.recipeImage.getBounds().height
    }

    public setCellWithRecipeType(recipeType: RecipeType) {
        switch (recipeType) {
            case RecipeType.Easy:
                this.effectThumbnailImage.setTint(0x9aee99)
                break
            case RecipeType.Normal:
                this.effectThumbnailImage.setTint(0xffe37e)
                break
            case RecipeType.Hard:
                this.effectThumbnailImage.setTint(0xffceaa)
                break
            case RecipeType.Challenge:
                this.effectThumbnailImage.setTint(0xccd4ff)
                break
        }
        this.recipeImage.clearTint()
        this.effectThumbnailImage.setVisible(true)
    }

    public onHover() {
        this.onHoverButtonIconTween?.restart()
        this.onHoverRotateButtonIconTween?.restart()
    }

    public onLeave() {
        this.onLeaveButtonIconTween?.restart()
        this.onLeaveRotateButtonIconTween?.restart()
    }

    private createUI() {
        this.recipeImage = this.scene.add.image(0, 0, RecipePreviewView.RECIPE_KEY_IMAGE + '1')
        this.effectThumbnailImage = this.scene.add.image(0, -5, 'effect-recipe').setScale(0.9)

        this.add([this.effectThumbnailImage, this.recipeImage])
    }

    private createTween() {
        if (DeviceChecker.instance.isDesktop()) {
            let tweenOnHover = AnimationController.instance.tweenHoverButton(this.scene, this.recipeImage, () => {})
            let tweenOnLeaveHover = AnimationController.instance.tweenLeaveHoverButton(
                this.scene,
                this.recipeImage,
                () => {}
            )

            this.onHoverButtonIconTween = tweenOnHover.onHoverButtonIconTween
            this.onHoverRotateButtonIconTween = tweenOnHover.onHoverRotateButtonIconTween

            this.onLeaveButtonIconTween = tweenOnLeaveHover.onLeaveHoverButtonIconTween
            this.onLeaveRotateButtonIconTween = tweenOnLeaveHover.onLeaveHoverRotateButtonIconTween
        }
    }

    destroy(fromScene?: boolean): void {
        this.onHoverButtonIconTween?.destroy()
        this.onLeaveButtonIconTween?.destroy()
        this.onHoverRotateButtonIconTween?.destroy()
        this.onLeaveRotateButtonIconTween?.destroy()
        super.destroy(fromScene)
    }
}
