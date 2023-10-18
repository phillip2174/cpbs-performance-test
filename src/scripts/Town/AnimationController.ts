import { GameObjects, Tweens } from 'phaser'
import { ObjectAnimationBean } from './Bean/ObjectAnimationBean'
import { ObjectAnimationState } from './Type/ObjectAnimationState'

export class AnimationController {
    public static readonly BUTTON_ICON_DEFAULT_ANGLE: number = 0
    public static readonly BUTTON_ICON_MAX_ANGLE: number = -5

    private static _instance: AnimationController

    private static getInstance() {
        if (!AnimationController._instance) {
            AnimationController._instance = new AnimationController()
        }
        return AnimationController._instance
    }
    static get instance() {
        return this.getInstance()
    }

    tweenOpenContainer(
        scene: Phaser.Scene,
        container: GameObjects.Container,
        onCompleteCallBack: Function = undefined
    ): {
        onOpenTween: Phaser.Tweens.Tween
        onOpenTweenChain: Phaser.Tweens.TweenChain
    } {
        let onOpenTween: Phaser.Tweens.Tween
        let onOpenTweenChain: Phaser.Tweens.TweenChain

        onOpenTween = scene.add.tween({
            targets: container,
            duration: 450,
            props: {
                alpha: { from: 0, to: 1 },
            },
            ease: 'cubic.inout',
            paused: true,
            persist: true,
            onComplete: () => {},
        })

        onOpenTweenChain = scene.tweens.chain({
            tweens: [
                {
                    targets: container,
                    duration: 300,
                    props: { scale: { from: 0.5, to: 1.03 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: container,
                    duration: 130,
                    props: { scale: { from: 1.03, to: 1 } },
                    ease: 'linear',
                    onComplete: () => {
                        if (onCompleteCallBack != undefined || onCompleteCallBack != null) onCompleteCallBack()
                    },
                },
            ],
            paused: true,
            persist: true,
        })

        return {
            onOpenTween: onOpenTween,
            onOpenTweenChain: onOpenTweenChain,
        }
    }

    tweenCloseContainer(
        scene: Phaser.Scene,
        container: GameObjects.Container,
        onCompleteCallBack: Function
    ): {
        onCloseTween: Phaser.Tweens.Tween
        onCloseTweenChain: Phaser.Tweens.TweenChain
    } {
        let onCloseTween: Phaser.Tweens.Tween
        let onCloseTweenChain: Phaser.Tweens.TweenChain

        onCloseTween = scene.add.tween({
            targets: container,
            duration: 400,
            props: {
                alpha: { from: 1, to: 0 },
            },
            ease: 'cubic.inout',
            persist: true,
            paused: true,
            onComplete: () => {},
        })

        onCloseTweenChain = scene.tweens.chain({
            tweens: [
                {
                    targets: container,
                    duration: 200,
                    props: { scale: { from: 1, to: 1.03 } },
                    ease: 'cubic.inout',
                },
                {
                    targets: container,
                    duration: 130,
                    props: { scale: { from: 1.03, to: 0.5 } },
                    ease: 'linear',
                    onComplete: () => {
                        if (onCompleteCallBack != undefined || onCompleteCallBack != null) {
                            onCompleteCallBack()
                        }
                        container.setScale(1)
                    },
                },
            ],
            paused: true,
            persist: true,
        })

        return { onCloseTween: onCloseTween, onCloseTweenChain: onCloseTweenChain }
    }

    tweenHoverButton(
        scene: Phaser.Scene,
        image: GameObjects.Image,
        callbackOnHoverText: Function
    ): {
        onHoverButtonIconTween: Tweens.TweenChain
        onHoverRotateButtonIconTween: Tweens.TweenChain
        onHoverButtonTextTween: Tweens.Tween
    } {
        let onHoverButtonIconTween: Tweens.TweenChain
        let onHoverRotateButtonIconTween: Tweens.TweenChain
        let onHoverButtonTextTween: Tweens.Tween

        onHoverButtonIconTween = scene.tweens.chain({
            tweens: [
                {
                    targets: image,
                    duration: 300,
                    ease: 'Cubic.easeInOut',
                    props: {
                        scale: {
                            from: image.scale,
                            to: image.scale + 0.2,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        onHoverRotateButtonIconTween = scene.tweens.chain({
            tweens: [
                {
                    targets: image,
                    duration: 300,
                    ease: 'Cubic.easeInOut',
                    props: {
                        angle: {
                            from: image.angle,
                            to: AnimationController.BUTTON_ICON_MAX_ANGLE,
                        },
                    },
                },
            ],

            persist: true,
            paused: true,
        })

        onHoverButtonTextTween = scene.tweens.addCounter({
            duration: 300,
            ease: 'cubic.inout',
            onUpdate: (tween) => {
                if (callbackOnHoverText != undefined || callbackOnHoverText != null) callbackOnHoverText()
            },
            persist: true,
            paused: true,
        })

        return {
            onHoverButtonIconTween: onHoverButtonIconTween,
            onHoverRotateButtonIconTween: onHoverRotateButtonIconTween,
            onHoverButtonTextTween: onHoverButtonTextTween,
        }
    }

    tweenLeaveHoverButton(
        scene: Phaser.Scene,
        image: GameObjects.Image,
        callbackOnHoverText: Function
    ): {
        onLeaveHoverButtonIconTween: Tweens.TweenChain
        onLeaveHoverRotateButtonIconTween: Tweens.TweenChain
        onLeaveHoverButtonTextTween: Tweens.Tween
    } {
        let onLeaveHoverButtonIconTween: Tweens.TweenChain
        let onLeaveHoverRotateButtonIconTween: Tweens.TweenChain
        let onLeaveHoverButtonTextTween: Tweens.Tween

        onLeaveHoverButtonIconTween = scene.tweens.chain({
            tweens: [
                {
                    targets: image,
                    duration: 300,
                    ease: 'Cubic.easeInOut',
                    props: {
                        scale: {
                            from: image.scale + 0.2,
                            to: image.scale,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        onLeaveHoverRotateButtonIconTween = scene.tweens.chain({
            tweens: [
                {
                    targets: image,
                    duration: 200,
                    ease: 'Cubic.easeInOut',
                    props: {
                        scale: {
                            from: image.scale,
                            to: image.scale - 0.05,
                        },
                        angle: {
                            from: image.angle,
                            to: AnimationController.BUTTON_ICON_DEFAULT_ANGLE,
                        },
                    },
                },
                {
                    targets: image,
                    duration: 50,
                    ease: 'Cubic.easeInOut',
                    props: {
                        scale: {
                            from: image.scale - 0.05,
                            to: image.scale,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })

        onLeaveHoverButtonTextTween = scene.tweens.addCounter({
            duration: 300,
            ease: 'cubic.inout',
            onUpdate: (tween) => {
                if (callbackOnHoverText != undefined || callbackOnHoverText != null) callbackOnHoverText()
            },
            persist: true,
            paused: true,
        })

        return {
            onLeaveHoverButtonIconTween: onLeaveHoverButtonIconTween,
            onLeaveHoverRotateButtonIconTween: onLeaveHoverRotateButtonIconTween,
            onLeaveHoverButtonTextTween: onLeaveHoverButtonTextTween,
        }
    }

    createSpriteSheetAnimation(scene: Phaser.Scene) {
        scene.anims.create({
            key: 'idle-nong-som',
            frames: scene.anims.generateFrameNumbers('nong-som', { start: 0, end: 1 }),
            repeat: -1,
            repeatDelay: 2000,
            yoyo: true,
            frameRate: 5,
        })

        scene.anims.create({
            key: 'interact-vending',
            frames: scene.anims.generateFrameNumbers('vending-machine', { start: 0, end: 17 }),
            frameRate: 11,
        })

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('vending-machine', { start: 0, end: 0 }),
            frameRate: 1,
        })

        scene.anims.create({
            key: 'loading-cooking-loop',
            frames: scene.anims.generateFrameNumbers('loading-cooking', { start: 0, end: 52 }),
            frameRate: 14,
            repeat: -1,
        })

        scene.anims.create({
            key: 'loading-text-loop',
            frames: scene.anims.generateFrameNumbers('loading-text', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1,
        })
    }

    getTweenAnimationContainer(
        scene: Phaser.Scene,
        container: Phaser.GameObjects.Container,
        id: number,
        objectAnimationBean: ObjectAnimationBean
    ): Phaser.Tweens.Tween {
        switch (id) {
            case 1:
                switch (objectAnimationBean.stateType) {
                    case ObjectAnimationState.Idle:
                        return scene.add.tween({
                            targets: container,
                            ease: 'Cubic.easeInOut',
                            yoyo: true,
                            loop: -1,
                            delay: this.randomIntFromInterval(1000, 3000),
                            repeatDelay: this.randomIntFromInterval(600, 1500),
                            duration: 2000,
                            props: {
                                y: { from: container.y, to: container.y + 15 },
                            },
                        })
                }
                break
            case 104:
                switch (objectAnimationBean.stateType) {
                    case ObjectAnimationState.Transition1:
                        return scene.add.tween({
                            targets: container,
                            ease: 'Linear',
                            duration: objectAnimationBean.animTime,
                            props: {
                                x: { from: container.x, to: container.x + 60 },
                            },
                        })
                    default:
                        break
                }
                break
            case 2:
            case 3:
            case 4:
            case 5:
            case 14:
            case 99:
                switch (objectAnimationBean.stateType) {
                    case ObjectAnimationState.Transition1:
                        return scene.add.tween({
                            targets: container,
                            ease: 'Cubic.easeInOut',
                            duration: objectAnimationBean.animTime,
                            delay: 800,
                            props: {
                                scale: { from: container.scale, to: 0 },
                            },
                            onComplete: () => {
                                container.setVisible(false)
                                container.setActive(false)
                            },
                        })
                    default:
                        break
                }
                break
            case 22:
            case 23:
            case 24:
            case 25:
                switch (objectAnimationBean.stateType) {
                    case ObjectAnimationState.Transition1:
                        return scene.add.tween({
                            targets: container,
                            ease: 'Cubic.easeInOut',
                            duration: 500,
                            delay: 400,
                            props: {
                                scale: { from: container.scale, to: 0 },
                            },
                            onComplete: () => {
                                container.setVisible(false)
                                container.setActive(false)
                            },
                        })
                    default:
                        break
                }
                break
            default:
                break
        }
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
