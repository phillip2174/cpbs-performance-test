import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'

export class LoadingBarView extends GameObjects.Container {
    public static readonly COLOR_CODE_ORANGE: number = 0xff5c00
    public static readonly COLOR_CODE_YELLOW: number = 0xffbf3c

    private valueBar: number

    private loadingBarBG: GameObjects.NineSlice
    private loadingBarContainer: GameObjects.Container
    private loadingBar: GameObjects.NineSlice
    private glowEffect: GameObjects.Image
    private maskImage: GameObjects.NineSlice

    private startLoadingValue: number
    private endLoadingValue: number
    private barTempWidthValue: number

    private fakeTween: Tweens.Tween

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit(startLoadingValue: number) {
        this.glowEffect = this.scene.add.image(0, 0, 'glow-effect-loading-bar')
        this.loadingBarBG = this.scene.add.nineslice(0, 0, 'loading-bar-bg', '', 240, 8, 10, 10, 4, 4)
        this.barTempWidthValue = this.loadingBarBG.width + 44
        this.valueBar = startLoadingValue
        this.startLoadingValue = startLoadingValue

        this.add([this.loadingBarBG, this.glowEffect])

        this.createLoadingBar()
    }

    public setActiveAll(isActive: boolean) {
        this.setVisible(isActive)
    }

    public updatePositionMask() {
        this.maskImage.setPosition(this.x, this.y)
    }

    private createLoadingBar() {
        this.loadingBarContainer = this.scene.add.container(0, 0).setDepth(this.depth + 1)

        this.maskImage = this.scene.make
            .nineslice(
                {
                    x: this.x,
                    y: this.y,
                    depth: this.depth + 1,
                    width: this.loadingBarBG.width - 2,
                    height: 6,
                    key: 'loading-bar-mask',
                    leftWidth: 4,
                    rightWidth: 4,
                    topHeight: 3,
                    bottomHeight: 3,
                },
                false
            )
            .setTint(0xff00ff)

        const mask1 = new Phaser.Display.Masks.BitmapMask(this.scene, this.maskImage)

        this.loadingBarContainer.mask = mask1

        this.loadingBar = this.scene.add
            .nineslice(
                -this.loadingBarBG.width / 2 - 44,
                0,
                'loading-bar-mask',
                '',
                this.barTempWidthValue,
                6,
                4,
                40,
                3,
                3
            )
            .setOrigin(0, 0.5)

        this.loadingBarContainer.add([this.loadingBar])
        this.add([this.loadingBarContainer])

        this.updateBarProgress(this.startLoadingValue)
    }

    public updateBarProgress(value: number) {
        this.valueBar = value
        this.loadingBar.width = Math.round(this.barTempWidthValue * value) + 44 * this.normalize(value, 1, 0)
    }

    public fakeLoading(callBack: Function) {
        this.fakeTween?.destroy()

        this.scene.add.tween({
            targets: this.loadingBar,
            ease: 'Linear',
            duration: 500,
            props: {
                width: {
                    from: Math.round(this.barTempWidthValue * 0.25) + 44 * this.normalize(0.25, 1, 0),
                    to: this.barTempWidthValue,
                },
            },
            onComplete: () => {
                callBack()
            },
        })
    }

    public fakeFirstLoading() {
        this.fakeTween = this.scene.add.tween({
            targets: this.loadingBar,
            ease: 'Linear',
            duration: 2000,
            props: {
                width: {
                    from: this.loadingBar.width,
                    to: Math.round(this.barTempWidthValue * 0.3) + 44 * this.normalize(0.3, 1, 0),
                },
            },
        })
    }

    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }
}
