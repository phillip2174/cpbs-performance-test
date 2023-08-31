import { ObjectAnimationBean } from './Bean/ObjectAnimationBean'
import { ObjectAnimationState } from './Type/ObjectAnimationState'

export class AnimationController {
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
                    case ObjectAnimationState.Transition1:
                        return scene.add.tween({
                            targets: container,
                            ease: 'Cubic.easeInOut',
                            duration: objectAnimationBean.animTime,
                            props: {
                                scale: { from: container.scale, to: 0.75 },
                            },
                        })
                }
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
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
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

            default:
                break
        }
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
