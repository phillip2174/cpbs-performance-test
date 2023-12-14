import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { DeviceChecker } from '../plugins/DeviceChecker'

export class ButtonNotificationView extends GameObjects.Container {
    public static readonly ICON_TWEEN_EASE: string = 'linear'
    private notificationBg: GameObjects.Image
    private notificationIcon: GameObjects.Image

    private onHoverIconTween: Tweens.TweenChain
    private onHoverBgTween: Tweens.Tween
    private onLeaveIconTween: Tweens.TweenChain
    private onLeaveBgTween: Tweens.Tween

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.notificationBg = this.scene.add.image(0, 0, 'button-notification-bg')
        this.notificationIcon = this.scene.add.image(0, 0, 'button-notification-icon')
        this.add([this.notificationBg, this.notificationIcon])
        this.setPosition(x, y)
        if (DeviceChecker.instance.isDesktop()) {
            this.createOnHoverTweens()
            this.createOnLeaveTweens()
        }
    }

    public setNotificationActive(isActive: boolean): void {
        this.setActive(isActive)
        this.setVisible(isActive)
    }

    public playOnHoverTweens(): void {
        this.onLeaveBgTween?.pause()
        this.onLeaveIconTween?.pause()
        this.onHoverBgTween?.restart()
        this.onHoverIconTween?.restart()
    }

    public playOnLeaveTweens(): void {
        this.onHoverBgTween?.pause()
        this.onHoverIconTween?.pause()
        this.onLeaveBgTween?.restart()
        this.onLeaveIconTween?.restart()
    }

    private createOnHoverTweens(): void {
        this.onHoverBgTween = this.scene.add.tween({
            targets: this.notificationBg,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: this.notificationBg.scale,
                    to: this.notificationBg.scale + 0.05,
                },
            },
            persist: true,
            paused: true,
        })

        this.onHoverIconTween = this.scene.tweens.chain({
            targets: this.notificationIcon,
            tweens: [
                {
                    duration: 150,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale,
                            to: this.notificationIcon.scale + 0.15,
                        },
                    },
                },
                {
                    duration: 200,
                    delay: 50,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.15,
                            to: this.notificationIcon.scale + 0.075,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.075,
                            to: this.notificationIcon.scale + 0.15,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.15,
                            to: this.notificationIcon.scale + 0.13,
                        },
                    },
                },
                {
                    duration: 100,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.13,
                            to: this.notificationIcon.scale + 0.15,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })
    }

    private createOnLeaveTweens(): void {
        this.onLeaveBgTween = this.scene.add.tween({
            targets: this.notificationBg,
            duration: 300,
            ease: 'cubic.inout',
            props: {
                scale: {
                    from: this.notificationBg.scale + 0.05,
                    to: this.notificationBg.scale,
                },
            },
            persist: true,
            paused: true,
        })

        this.onLeaveIconTween = this.scene.tweens.chain({
            targets: this.notificationIcon,
            tweens: [
                {
                    duration: 150,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.15,
                            to: this.notificationIcon.scale,
                        },
                    },
                },
                {
                    duration: 200,
                    delay: 50,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale,
                            to: this.notificationIcon.scale + 0.075,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.075,
                            to: this.notificationIcon.scale,
                        },
                    },
                },
                {
                    duration: 120,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale,
                            to: this.notificationIcon.scale + 0.02,
                        },
                    },
                },
                {
                    duration: 100,
                    ease: ButtonNotificationView.ICON_TWEEN_EASE,
                    props: {
                        scale: {
                            from: this.notificationIcon.scale + 0.02,
                            to: this.notificationIcon.scale,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
        })
    }
}
