import { GameObjects, Tweens } from 'phaser'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { Action } from 'rxjs/internal/scheduler/Action'

export class CollectionDetailRecipeTweenView extends GameObjects.Container {
    public static readonly INGREDIENT_IMAGE_KEY: string = `ingredient_`

    //Container
    private collectionDetailRecipeTweenContainer: GameObjects.Container
    private collectionDetailIngredientTweenContainer: GameObjects.Container

    private ingredientCountText: GameObjects.Text

    //Plate, Lid, Recipe
    private plateImage: GameObjects.Image
    private lidImage: GameObjects.Image

    private recipeImage: GameObjects.Image

    private ingredientImage: GameObjects.Image

    //Effect Image
    private lightRayEffectImage: GameObjects.Image
    private ingredientLightRayEffectImage: GameObjects.Image
    private ingredientGlowEffectImage: GameObjects.Image

    private starEffect1Image: GameObjects.Image
    private starEffect2Image: GameObjects.Image
    private starEffect3Image: GameObjects.Image
    private starEffect4Image: GameObjects.Image
    private starEffect5Image: GameObjects.Image

    //Tween
    private onOpenDetailRecipeContainerScaleTweenChain: Tweens.TweenChain
    private onOpenDetailRecipeContainerFadeTween: Tweens.Tween

    private onOpenDetailRecipeLidOpenTweenChain: Tweens.TweenChain

    private onScaleRecipeTween: Tweens.Tween

    private onScaleEffectTweenChain: Tweens.TweenChain

    private onScaleStarEffect1TweenChain: Tweens.TweenChain
    private onScaleStarEffect2TweenChain: Tweens.TweenChain
    private onScaleStarEffect3TweenChain: Tweens.TweenChain
    private onScaleStarEffect4TweenChain: Tweens.TweenChain
    private onScaleStarEffect5TweenChain: Tweens.TweenChain

    private onTweenIngredientTweenChain: Tweens.TweenChain
    private onTweenIngredientFadeOutTween: Tweens.Tween

    //Action
    private onFinishTweenRecipeCallback: Function
    private onFinishTweenIngredientCallback: Function

    private isRecieveResource: boolean = true

    public doInit() {
        this.setupContainer()
        this.setupUI()

        this.createCollectionDetailTween()
        this.createOpenLidTween()
        this.createRecipeTween()
        this.createRecipeEffectTween()
        this.createTweenGetIngredient()
    }

    public playTween(
        isRecieveResource: boolean = false,
        onFinishTweenRecipeCallback: Function = null,
        onFinishTweenIngredientCallback: Function = null
    ) {
        this.isRecieveResource = isRecieveResource
        this.onFinishTweenRecipeCallback = onFinishTweenRecipeCallback
        this.onFinishTweenIngredientCallback = onFinishTweenIngredientCallback
        this.resetTween()

        this.startTweenRecipeContainer()
        this.startTweenRecipe()
    }

    public setRecipe(imageKey: string) {
        this.recipeImage.setTexture(imageKey)
    }

    public setIngredient(id: number, count: number) {
        this.ingredientCountText.setText('+' + count)
        this.ingredientImage.setTexture(CollectionDetailRecipeTweenView.INGREDIENT_IMAGE_KEY + id)
    }

    public setupCookedStateTween() {
        this.collectionDetailRecipeTweenContainer.setScale(0)
    }

    private resetTween() {
        this.collectionDetailRecipeTweenContainer.setScale(1)

        this.onOpenDetailRecipeContainerScaleTweenChain.pause()
        this.onOpenDetailRecipeContainerFadeTween.pause()
        this.onOpenDetailRecipeLidOpenTweenChain.pause()
        this.onScaleRecipeTween.pause()
        this.onScaleEffectTweenChain.pause()
        this.onScaleStarEffect1TweenChain.pause()
        this.onScaleStarEffect2TweenChain.pause()
        this.onScaleStarEffect3TweenChain.pause()
        this.onScaleStarEffect4TweenChain.pause()
        this.onScaleStarEffect5TweenChain.pause()
        this.onTweenIngredientTweenChain.pause()
        this.onTweenIngredientFadeOutTween.pause()

        this.plateImage.setPosition(0, 0)
        this.lidImage.setPosition(0, -15).setRotation(0)

        this.recipeImage.setScale(0)
        this.recipeImage.setAlpha(0)

        this.collectionDetailIngredientTweenContainer.setScale(0)
        this.collectionDetailIngredientTweenContainer.setPosition(0, 0)
        this.collectionDetailIngredientTweenContainer.setAlpha(1)

        this.lightRayEffectImage.setScale(0)
        this.lightRayEffectImage.setAlpha(0)

        this.starEffect1Image.setScale(0)
        this.starEffect2Image.setScale(0)
        this.starEffect3Image.setScale(0)
        this.starEffect4Image.setScale(0)
        this.starEffect5Image.setScale(0)
    }

    private setupContainer() {
        this.collectionDetailRecipeTweenContainer = this.scene.add.container(0, 0)

        this.collectionDetailIngredientTweenContainer = this.scene.add.container(0, 0)
    }

    private setupUI() {
        this.plateImage = this.scene.add.image(0, 0, 'plate')
        this.lidImage = this.scene.add.image(0, -15, 'lid')

        this.recipeImage = this.scene.add.image(0, -15, 'recipe-1').setDisplaySize(120, 120).setSize(120, 120)
        this.ingredientImage = this.scene.add.image(0, -15, 'ingredient_16').setScale(1.3)

        this.lightRayEffectImage = this.scene.add.image(0, -15, 'effect-bg')

        this.starEffect1Image = this.scene.add.image(45, -55, 'star-effect')
        this.starEffect2Image = this.scene.add.image(65, -15, 'star-effect').setScale(0.7)
        this.starEffect3Image = this.scene.add.image(-25, -60, 'star-effect').setScale(0.6)
        this.starEffect4Image = this.scene.add.image(-50, -30, 'star-effect').setScale(0.6)
        this.starEffect5Image = this.scene.add.image(-20, 0, 'star-effect').setScale(0.6)

        this.ingredientLightRayEffectImage = this.scene.add.image(0, -15, 'circle-effect')
        this.ingredientGlowEffectImage = this.scene.add.image(0, -15, 'glow-effect')

        this.ingredientCountText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('+2')
            .setOrigin(0.5)
            .setPosition(0, -20)
            .setStroke('#ffffff', 16)
            .setStyle({
                fill: '#ed833d',
                fontSize: 80,
            })

        this.collectionDetailIngredientTweenContainer.add([
            this.ingredientImage,
            this.ingredientLightRayEffectImage,
            this.ingredientGlowEffectImage,
            this.ingredientCountText,
        ])

        this.collectionDetailRecipeTweenContainer.add([
            this.lightRayEffectImage,
            this.plateImage,
            this.recipeImage,
            this.starEffect1Image,
            this.starEffect2Image,
            this.starEffect3Image,
            this.starEffect4Image,
            this.starEffect5Image,
            this.collectionDetailIngredientTweenContainer,
            this.lidImage,
        ])

        this.add([this.collectionDetailRecipeTweenContainer])
    }

    private startTweenRecipeContainer() {
        this.onOpenDetailRecipeContainerScaleTweenChain?.restart()
    }

    private startTweenRecipe() {
        this.onOpenDetailRecipeContainerFadeTween?.restart()
    }

    private startTweenOpenLid() {
        this.onOpenDetailRecipeLidOpenTweenChain?.restart()
    }

    private startTweenGetIngredient() {
        if (this.isRecieveResource) {
            this.onTweenIngredientTweenChain?.restart()
            this.onTweenIngredientFadeOutTween?.restart()
        }
    }

    private startTweenRecipeEffect() {
        this.onScaleEffectTweenChain?.restart()

        this.onScaleStarEffect1TweenChain?.restart()
        this.onScaleStarEffect2TweenChain?.restart()
        this.onScaleStarEffect3TweenChain?.restart()
        this.onScaleStarEffect4TweenChain?.restart()
        this.onScaleStarEffect5TweenChain?.restart()
    }

    private createCollectionDetailTween() {
        this.onOpenDetailRecipeContainerScaleTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.collectionDetailRecipeTweenContainer,
                    duration: 250,
                    props: { scale: { from: 0, to: 1.3 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.collectionDetailRecipeTweenContainer,
                    duration: 80,
                    props: { scale: { from: 1.3, to: 1 } },
                    ease: 'linear',
                },
            ],
            onComplete: () => {
                this.startTweenOpenLid()
            },
            persist: true,
            paused: true,
        })
    }

    private createOpenLidTween() {
        this.onOpenDetailRecipeLidOpenTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.lidImage,
                    duration: 200,
                    props: {
                        x: -40,
                        y: -100,
                        angle: -40,
                    },
                    ease: 'cubic.in',
                },
                {
                    targets: this.lidImage,
                    duration: 250,
                    props: {
                        x: -80,
                        y: -70,
                        angle: -60,
                    },
                    ease: 'cubic.out',
                },
            ],
            onActive: () => {
                this.onScaleRecipeTween?.restart()
            },
            onComplete: () => {},
            persist: true,
            paused: true,
        })
    }

    private createRecipeTween() {
        //Tween Recipe
        this.onOpenDetailRecipeContainerFadeTween = this.scene.add.tween({
            targets: this.collectionDetailRecipeTweenContainer,
            duration: 250,
            ease: 'Sine.easeInOut',
            props: {
                alpha: {
                    from: 0,
                    to: 1,
                },
            },
            persist: true,
            paused: true,
        })

        this.onScaleRecipeTween = this.scene.add.tween({
            targets: this.recipeImage,
            duration: 150,
            ease: 'cubic.inout',
            props: {
                alpha: {
                    from: 0,
                    to: 1,
                },
                scale: {
                    from: 0,
                    to: this.recipeImage.scale + 0.2,
                },
            },
            delay: 100,
            onComplete: () => {
                this.startTweenGetIngredient()
                this.startTweenRecipeEffect()

                if (this.onFinishTweenRecipeCallback != undefined) this.onFinishTweenRecipeCallback()
            },
            persist: true,
            paused: true,
        })
    }

    private createRecipeEffectTween() {
        //Light ray effect tween
        this.onScaleEffectTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.lightRayEffectImage,
                    duration: 250,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 1.1,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.lightRayEffectImage,
                    duration: 80,
                    props: {
                        scale: {
                            from: 1.1,
                            to: 1,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        //Star Tween
        this.onScaleStarEffect1TweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffect1Image,
                    duration: 250,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 1.3,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: 50,
                },
                {
                    targets: this.starEffect1Image,
                    duration: 80,
                    props: {
                        scale: {
                            from: 1.3,
                            to: 1,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.onScaleStarEffect2TweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffect2Image,
                    duration: 150,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 0.7,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: 200,
                },
                {
                    targets: this.starEffect2Image,
                    duration: 80,
                    props: {
                        scale: {
                            from: 0.7,
                            to: 0.6,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.onScaleStarEffect3TweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffect3Image,
                    duration: 150,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 0.8,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: 250,
                },
                {
                    targets: this.starEffect3Image,
                    duration: 80,
                    props: {
                        scale: {
                            from: 0.8,
                            to: 0.6,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.onScaleStarEffect4TweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffect4Image,
                    duration: 150,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 0.8,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: 150,
                },
                {
                    targets: this.starEffect4Image,
                    duration: 50,
                    props: {
                        scale: {
                            from: 0.8,
                            to: 0.6,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.onScaleStarEffect5TweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.starEffect5Image,
                    duration: 150,
                    props: {
                        alpha: {
                            from: 0,
                            to: 1,
                        },
                        scale: {
                            from: 0,
                            to: 0.8,
                        },
                    },
                    ease: 'cubic.inout',
                    delay: 350,
                },
                {
                    targets: this.starEffect5Image,
                    duration: 50,
                    props: {
                        scale: {
                            from: 0.8,
                            to: 0.6,
                        },
                    },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })
    }

    private createTweenGetIngredient() {
        //Tween Ingredient
        this.onTweenIngredientTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.collectionDetailIngredientTweenContainer,
                    duration: 250,
                    props: { scale: { from: 0, to: 1.3 } },
                    ease: 'cubic.inout',
                    delay: 600,
                    onStart: () => {
                        this.collectionDetailIngredientTweenContainer.setAlpha(1)
                    },
                },
                {
                    targets: this.collectionDetailIngredientTweenContainer,
                    duration: 80,
                    props: { scale: { from: 1.3, to: 0.7 } },
                    ease: 'linear',
                },
                {
                    targets: this.collectionDetailIngredientTweenContainer,
                    duration: 100,
                    props: {
                        y: 15,
                    },
                    ease: 'linear',
                    delay: 200,
                },
                {
                    targets: this.collectionDetailIngredientTweenContainer,
                    duration: 400,
                    props: {
                        y: -100,
                    },
                    ease: 'cubic.inout',
                    onComplete: () => {
                        if (
                            this.onFinishTweenIngredientCallback != undefined ||
                            this.onFinishTweenIngredientCallback != null
                        )
                            this.onFinishTweenIngredientCallback()
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        this.onTweenIngredientFadeOutTween = this.scene.add.tween({
            targets: this.collectionDetailIngredientTweenContainer,
            duration: 200,
            ease: 'linear',
            props: {
                alpha: {
                    from: 1,
                    to: 0,
                },
            },
            persist: true,
            paused: true,
            delay: 1400,
        })
    }
}
