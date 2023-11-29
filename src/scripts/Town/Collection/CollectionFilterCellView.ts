import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { Button } from '../../button/Button'
import { CollectionPod } from '../Pod/CollectionPod'
import { PodProvider } from '../../pod/PodProvider'
import { RecipeFilterType } from '../Recipe/RecipeFilterType'
import { Subscription } from 'rxjs'
import { BoldText } from '../../../BoldText/BoldText'
import { AudioManager } from '../../Audio/AudioManager'

export class CollectionFilterCellView extends GameObjects.Container implements IScrollViewCallBack {
    public cellPageIndex: number

    private filterType: RecipeFilterType
    private buttonFilter: Button

    private filterBackground: GameObjects.NineSlice
    private selectedBackground: GameObjects.NineSlice
    private circleNotification: GameObjects.Image

    private filterText: GameObjects.Text
    private stateFilterSubscription: Subscription
    private notificationFilterSubscription: Subscription

    private onHoverTextTween: Tweens.Tween
    private onLeaveTextTween: Tweens.Tween

    private onHoverBackgroundTween: Tweens.Tween
    private onLeaveBackgroundTween: Tweens.Tween

    private onHoverSelectedTween: Tweens.Tween
    private onLeaveSelectedTween: Tweens.Tween

    private onHoverNotificationTween: Tweens.Tween
    private onLeaveNotificationTween: Tweens.Tween

    private audioManager: AudioManager

    private collectionPod: CollectionPod
    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(filterType: RecipeFilterType, height: number, color: number, cellPageIndex: number = 0) {
        this.collectionPod = PodProvider.instance.collectionPod
        this.audioManager = PodProvider.instance.audioManager
        this.filterType = filterType
        this.cellPageIndex = cellPageIndex

        this.filterText = new BoldText(this.scene, 0, -4, filterType.toString(), 22)

        let isDesktop = this.scene.sys.game.device.os.desktop
        this.filterBackground = this.scene.add
            .nineslice(
                0,
                isDesktop ? height / 2 : 0,
                isDesktop ? 'filter-bg-desktop' : 'filter-bg',
                '',
                isDesktop ? this.filterText.width + 29 : this.filterText.width + 19,
                height,
                10,
                10,
                10,
                10
            )
            .setOrigin(0.5, isDesktop ? 1 : 0.5)

        this.filterBackground.setTint(color)

        this.selectedBackground = this.scene.add
            .nineslice(
                0,
                isDesktop ? height / 2 : 0,
                isDesktop ? 'selected-filter-bg-desktop' : 'selected-filter-bg',
                '',
                isDesktop ? this.filterText.width + 35 : this.filterText.width + 27,
                isDesktop ? height + 4 : height + 8,
                10,
                10,
                10,
                10
            )
            .setOrigin(0.5, isDesktop ? 1 : 0.5)

        this.circleNotification = this.scene.add.image(0, 0, 'button-notification-bg').setVisible(false).setScale(0.48)

        if (isDesktop) {
            this.circleNotification.setPosition(
                this.filterBackground.width / 2 - 10,
                -this.filterBackground.height / 2 + 7
            )
        } else {
            this.circleNotification.setPosition(
                this.filterBackground.width / 2 - 4,
                -this.filterBackground.height / 2 + 3
            )
        }

        this.buttonFilter = new Button(this.scene, 0, 0, this.filterText.width + 19, height, '', 0).setAlpha(0.01)

        this.add([
            this.selectedBackground,
            this.filterBackground,
            this.filterText,
            this.circleNotification,
            this.buttonFilter,
        ])

        this.setActionFilter()
        this.createTween()

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    public setInteractButtonScrollView(isCanInteract: boolean) {
        if (isCanInteract) {
            // this.setVisible(true)
            this.buttonFilter.setCanInteract(true, false)
        } else {
            //this.setVisible(false)
            this.buttonFilter.setCanInteract(false, false)
        }
    }

    private setActionFilter() {
        this.stateFilterSubscription = this.collectionPod.collectionFilterState.subscribe((state) => {
            this.setActiveSelected(state == this.filterType)
        })

        this.notificationFilterSubscription = this.collectionPod.notificationFilterCollection.subscribe((arr) => {
            this.circleNotification.setVisible(false)
            if (arr.length != 0) {
                if (this.filterType == RecipeFilterType.All) {
                    this.circleNotification.setVisible(true)
                }

                arr.forEach((filter) => {
                    if (filter == this.filterType) this.circleNotification.setVisible(true)
                })
            }
        })

        this.buttonFilter?.onClick(() => {
            if (!this.collectionPod.isDragScrollViewFilter) {
                this.audioManager.playSFXSound('collection_page_flip_sfx')
                this.collectionPod.changeStateFilter(this.filterType)
            }
        })

        if (this.scene.sys.game.device.os.desktop) {
            this.buttonFilter.on('pointerover', () => {
                this.onHoverButton()
            })

            this.buttonFilter.on('pointerout', () => {
                this.onLeaveButton()
            })
        }

        this.on('destroy', () => {
            this.stateFilterSubscription?.unsubscribe()
            this.notificationFilterSubscription?.unsubscribe()
        })
    }

    private setActiveSelected(isActive: boolean) {
        this.selectedBackground.setVisible(isActive)
        this.selectedBackground.setActive(isActive)
    }

    private createTween() {
        if (this.scene.sys.game.device.os.desktop) {
            this.onHoverBackgroundTween = this.scene.add.tween({
                targets: this.filterBackground,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    height: {
                        from: this.filterBackground.height,
                        to: this.filterBackground.height + 7,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onHoverSelectedTween = this.scene.add.tween({
                targets: this.selectedBackground,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    height: {
                        from: this.selectedBackground.height,
                        to: this.selectedBackground.height + 7,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onHoverTextTween = this.scene.add.tween({
                targets: this.filterText,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    y: {
                        from: this.filterText.y,
                        to: this.filterText.y - 7,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onHoverNotificationTween = this.scene.add.tween({
                targets: this.circleNotification,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    y: {
                        from: this.circleNotification.y,
                        to: this.circleNotification.y - 7,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onLeaveBackgroundTween = this.scene.add.tween({
                targets: this.filterBackground,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    height: {
                        from: this.filterBackground.height + 7,
                        to: this.filterBackground.height,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onLeaveSelectedTween = this.scene.add.tween({
                targets: this.selectedBackground,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    height: {
                        from: this.selectedBackground.height + 7,
                        to: this.selectedBackground.height,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onLeaveTextTween = this.scene.add.tween({
                targets: this.filterText,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    y: {
                        from: this.filterText.y - 7,
                        to: this.filterText.y,
                    },
                },
                persist: true,
                paused: true,
            })

            this.onLeaveNotificationTween = this.scene.add.tween({
                targets: this.circleNotification,
                duration: 300,
                ease: 'Cubic.easeInOut',
                props: {
                    y: {
                        from: this.circleNotification.y - 7,
                        to: this.circleNotification.y,
                    },
                },
                persist: true,
                paused: true,
            })
        }
    }

    private onHoverButton(): void {
        this.onHoverTextTween?.restart()
        this.onHoverBackgroundTween?.restart()
        this.onHoverSelectedTween?.restart()
        this.onHoverNotificationTween?.restart()
    }

    private onLeaveButton(): void {
        this.onLeaveTextTween?.restart()
        this.onLeaveBackgroundTween?.restart()
        this.onLeaveSelectedTween?.restart()
        this.onLeaveNotificationTween?.restart()
    }
}
