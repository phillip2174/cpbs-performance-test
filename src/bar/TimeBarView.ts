import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../scripts/plugins/objects/GameObjectConstructor'
import { TextAdapter } from '../scripts/text-adapter/TextAdapter'
import { PodProvider } from '../scripts/pod/PodProvider'
import { Subscription, interval } from 'rxjs'
import { BoldText } from '../BoldText/BoldText'
import { AudioManager } from '../scripts/Audio/AudioManager'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'

export class TimeBarView extends GameObjects.Container {
    public static readonly COLOR_CODE_GREEN: number = 0x00f962
    public static readonly COLOR_CODE_YELLOW: number = 0xf9b300
    public static readonly COLOR_CODE_RED: number = 0xff0000
    public static readonly OFFSET_WIDTH: number = 16
    public static readonly YELLOW_PERCENT: number = 0.5
    public static readonly RED_PERCENT: number = 0.8334

    private defaultTextColor: string

    private bgTimeBar: GameObjects.NineSlice
    private iconTimeBar: GameObjects.Image
    private timeProgressBG: GameObjects.NineSlice
    private timeBar: GameObjects.NineSlice
    private timeOutlineBar: GameObjects.NineSlice

    private timeText: GameObjects.Text

    private timeBarContainer: GameObjects.Container
    private masker: GameObjects.Graphics

    private timeBarBGWidth: number
    private timeBarBGHeight: number
    private iconSize: number
    private depthTimeBar: number
    private iconOffset: number

    private timeBarWidth: number
    private timeBarHeight: number
    private timeBarXOffset: number
    private timeBarYOffset: number

    private isHaveText: boolean

    private currentTime: number

    private callBackFunction: Function

    private tweenTimeBar: Tweens.Tween
    private fadeColorTween: Tweens.Tween
    private isFadingColor: boolean = false
    private isFadeYellow: boolean = false

    private countdownSFXKey: string = 'clock_ticking_01_sfx'
    private timeAlmostUpCountdownSFXKey: string = ''
    private timeMillisecondToPlaySFX: number = 1000
    private offsetForUnsubscribeSound: number = 1

    private isUseDifferentSFXWhenTimeIsAlmostUp: boolean = false

    private countdownSFXSound: Phaser.Sound.BaseSound
    private timeAlmostUpCountdownSound: Phaser.Sound.BaseSound

    private audioManager: AudioManager

    private countdownIntervalSubscription: Subscription
    private isTimeRunningOut: boolean = false
    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(
        x: number,
        y: number,
        width: number,
        height: number,
        depth: number,
        timeBarWidth: number,
        timeBarHeight: number,
        timeBarXOffset: number,
        timeBarYOffset: number,
        iconOffset: number = 5,
        iconSize: number = 40
    ) {
        this.audioManager = PodProvider.instance.audioManager

        this.setPosition(x, y)
        this.timeBarBGWidth = width
        this.timeBarBGHeight = height
        this.iconSize = iconSize
        this.depthTimeBar = depth
        this.iconOffset = iconOffset

        this.timeBarWidth = timeBarWidth
        this.timeBarHeight = timeBarHeight
        this.timeBarXOffset = timeBarXOffset
        this.timeBarYOffset = timeBarYOffset

        this.setDepth(this.depthTimeBar)

        this.createUI()
        this.createTimeBar()
    }

    public createTextTime(offsetX: number, offsetY: number, colorText: string, fontSize: number) {
        if (DeviceChecker.instance.isAppleOS()) {
            this.timeText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded_Med')
                .setText('00:00s')
                .setOrigin(0.5)
                .setPosition(0, 0)
                .setStyle({ fill: colorText, fontSize: fontSize })
        } else {
            this.timeText = new BoldText(this.scene, 0, 0, '00:00s', fontSize, colorText)
        }

        this.defaultTextColor = colorText

        Phaser.Display.Align.In.LeftCenter(
            this.timeText,
            this.timeProgressBG,
            offsetX,
            -this.timeProgressBG.height + offsetY
        )

        this.isHaveText = true

        this.add(this.timeText)
    }

    public addCallBack(functionCallBack: Function) {
        this.callBackFunction = functionCallBack
    }

    private padTo2Digits(num: number) {
        return num.toString().padStart(2, '0')
    }

    private convertMsToMinutesSeconds(milliseconds: number): string {
        const minutes = Math.floor(milliseconds / 60000)
        const seconds = Math.round((milliseconds % 60000) / 1000)

        return seconds === 60
            ? `${this.padTo2Digits(minutes + 1)}:00`
            : `${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`
    }

    private createUI() {
        this.bgTimeBar = this.scene.add.nineslice(
            0,
            0,
            'time-bar-bg',
            '',
            this.timeBarBGWidth,
            this.timeBarBGHeight,
            20,
            20,
            22,
            22
        )

        this.iconTimeBar = this.scene.add.image(0, 0, 'time-icon').setDisplaySize(this.iconSize, this.iconSize)
        this.iconTimeBar.setPosition(-this.bgTimeBar.width / 2 + this.iconTimeBar.width / 2 + this.iconOffset, -2)

        this.timeProgressBG = this.scene.add
            .nineslice(0, 0, 'time-progress-bar-bg', '', this.timeBarWidth, this.timeBarHeight, 10, 11, 9, 10)
            .setOrigin(0.5)

        this.timeProgressBG.setPosition(
            this.bgTimeBar.width / 2 - this.timeProgressBG.width / 2 + this.timeBarXOffset,
            this.timeBarYOffset
        )

        this.add([this.bgTimeBar, this.iconTimeBar, this.timeProgressBG])
    }

    private createTimeBar() {
        this.timeBarContainer = this.scene.add.container(0, 0).setDepth(this.depthTimeBar)

        let maskImage = this.scene.make
            .nineslice(
                {
                    x: this.x + this.bgTimeBar.width / 2 - this.timeProgressBG.width / 2 + this.timeBarXOffset,
                    y: this.y + this.timeBarYOffset,
                    depth: this.depthTimeBar,
                    width: this.timeBarWidth - 4,
                    height: 12,
                    key: 'time-bar',
                    leftWidth: 10,
                    rightWidth: 10,
                    topHeight: 5,
                    bottomHeight: 5,
                },
                false
            )
            .setTint(0xff00ff)

        const mask1 = new Phaser.Display.Masks.BitmapMask(this.scene, maskImage)

        this.timeBarContainer.mask = mask1

        this.timeBar = this.scene.add
            .nineslice(0, 0, 'time-bar', '', this.timeBarWidth - 4 + TimeBarView.OFFSET_WIDTH, 12, 10, 10, 5, 5)
            .setOrigin(0, 0.5)
            .setTint(TimeBarView.COLOR_CODE_GREEN)
        //var postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')

        // //@ts-ignore
        // postFxPlugin.add(this.timeBar, {
        //     thickness: 2,
        //     outlineColor: 0xffffff,
        // })

        Phaser.Display.Align.In.LeftCenter(this.timeBar, this.timeProgressBG, TimeBarView.OFFSET_WIDTH - 2)

        // this.startTimeBar(10000)

        this.timeBarContainer.add([this.timeBar])

        this.add(this.timeBarContainer)

        // timer(1000).subscribe(() => {
        //     this.y = this.y - 100
        //     maskImage.y = maskImage.y - 100
        // })

        // this.tweenTimeBar = this.scene.add.tween({
        //     targets: this,
        //     ease: 'Linear',
        //     duration: 1000,
        //     yoyo : true,
        //     props: {
        //         scale: { from: this.scale, to: 0 },
        //     },
        // })
    }

    public setTimebarProperties(countdownSFXKey: string, timeMillisecondToPlaySFX: number = 1000, offsetForUnsubscribeSound: number = 1, isUseDifferentSFXWhenTimeIsAlmostUp: boolean = false, timeAlmostUpCountdownSFXKey: string = '') {
        this.countdownSFXKey = countdownSFXKey
        this.timeMillisecondToPlaySFX = timeMillisecondToPlaySFX
        this.offsetForUnsubscribeSound = offsetForUnsubscribeSound
        this.isUseDifferentSFXWhenTimeIsAlmostUp = isUseDifferentSFXWhenTimeIsAlmostUp
        this.timeAlmostUpCountdownSFXKey = timeAlmostUpCountdownSFXKey

        if(this.countdownSFXSound != undefined)
            this.countdownSFXSound.destroy()

        if(this.timeAlmostUpCountdownSound != undefined)
            this.timeAlmostUpCountdownSound.destroy()

        this.countdownSFXSound = this.audioManager.createSFXSoundObject(countdownSFXKey)

        if(isUseDifferentSFXWhenTimeIsAlmostUp)
            this.timeAlmostUpCountdownSound = this.audioManager.createSFXSoundObject(timeAlmostUpCountdownSFXKey)
    }

    public startTimeBar(timeMillisecond: number, doCallBackOnEnd: boolean = false, startCount: boolean = false) {
        this.resetToDefault()

        this.currentTime = timeMillisecond

        if (this.isHaveText) {
            this.timeText.setColor(this.defaultTextColor)
            this.timeText.setText(`${this.convertMsToMinutesSeconds(this.currentTime)}s`)
        }

        const greenColor = Phaser.Display.Color.ValueToColor(TimeBarView.COLOR_CODE_GREEN)
        const yellowColor = Phaser.Display.Color.ValueToColor(TimeBarView.COLOR_CODE_YELLOW)
        const redColor = Phaser.Display.Color.ValueToColor(TimeBarView.COLOR_CODE_RED)

        if(startCount) {
            this.countdownSFXSound.play()

            this.countdownIntervalSubscription = interval(this.timeMillisecondToPlaySFX).subscribe((count) => {
                if(this.isUseDifferentSFXWhenTimeIsAlmostUp) {
                    if (this.changeValueRange(0, (timeMillisecond / 1000) - 1, 0, 1, count) >= TimeBarView.RED_PERCENT)
                        this.timeAlmostUpCountdownSound.play()
                    else
                        this.countdownSFXSound.play()
                }else
                    this.countdownSFXSound.play()

                if (count >= (timeMillisecond / 1000) - this.offsetForUnsubscribeSound) {
                    this.countdownIntervalSubscription?.unsubscribe()
                }
            })

            this.tweenTimeBar = this.scene.add.tween({
                targets: this.timeBar,
                ease: 'Linear',
                duration: timeMillisecond,
                props: {
                    width: { from: this.timeBar.width, to: TimeBarView.OFFSET_WIDTH + 4 },
                },
                onUpdate: (tweenMain) => {
                    this.currentTime = tweenMain.duration - tweenMain.duration * tweenMain.progress

                    if (this.isHaveText) {
                        this.timeText.setText(`${this.convertMsToMinutesSeconds(this.currentTime)}s`)

                        if (tweenMain.progress >= TimeBarView.RED_PERCENT) {
                            this.timeText.setColor('#DF2B41')
                        }
                    }

                    if (timeMillisecond <= 10000) {
                        if (!this.isFadingColor) {
                            this.isFadingColor = true

                            this.fadeColorTween = this.scene.tweens.addCounter({
                                from: 0,
                                to: 100,
                                duration: timeMillisecond / 2.5,
                                ease: 'Sine.easeIn',
                                onUpdate: (tween) => {
                                    const value = tween.getValue()
                                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                                        greenColor,
                                        yellowColor,
                                        100,
                                        value
                                    )
                                    const color = Phaser.Display.Color.GetColor(
                                        colorObject.r,
                                        colorObject.g,
                                        colorObject.b
                                    )
                                    this.timeBar.setTint(color)

                                    if (value == 100) {
                                        this.fadeColorTween = this.scene.tweens.addCounter({
                                            from: 0,
                                            to: 100,
                                            duration: timeMillisecond / 2.5,
                                            ease: 'Sine.easeIn',
                                            onUpdate: (tween) => {
                                                const value = tween.getValue()
                                                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                                                    yellowColor,
                                                    redColor,
                                                    100,
                                                    value
                                                )
                                                const color = Phaser.Display.Color.GetColor(
                                                    colorObject.r,
                                                    colorObject.g,
                                                    colorObject.b
                                                )
                                                this.timeBar.setTint(color)
                                            },
                                        })
                                    }
                                },
                            })
                        }
                    } else {
                        if (
                            tweenMain.progress >= TimeBarView.YELLOW_PERCENT &&
                            tweenMain.progress <= TimeBarView.RED_PERCENT &&
                            !this.isFadingColor &&
                            !this.isFadeYellow
                        ) {
                            this.isFadingColor = true
                            this.isFadeYellow = true
                            this.fadeColorTween = this.scene.tweens.addCounter({
                                from: 0,
                                to: 100,
                                duration: 1500,
                                ease: 'Sine.easeIn',
                                onUpdate: (tween) => {
                                    const value = tween.getValue()
                                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                                        greenColor,
                                        yellowColor,
                                        100,
                                        value
                                    )
                                    const color = Phaser.Display.Color.GetColor(
                                        colorObject.r,
                                        colorObject.g,
                                        colorObject.b
                                    )
                                    this.timeBar.setTint(color)

                                    if (value == 100) {
                                        this.isFadingColor = false
                                    }
                                },
                            })
                        }
                        if (tweenMain.progress >= TimeBarView.RED_PERCENT && !this.isFadingColor) {
                            this.isFadingColor = true

                            this.fadeColorTween = this.scene.tweens.addCounter({
                                from: 0,
                                to: 100,
                                duration: 1000,
                                ease: 'Sine.easeIn',
                                onUpdate: (tween) => {
                                    const value = tween.getValue()
                                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                                        yellowColor,
                                        redColor,
                                        100,
                                        value
                                    )
                                    const color = Phaser.Display.Color.GetColor(
                                        colorObject.r,
                                        colorObject.g,
                                        colorObject.b
                                    )
                                    this.timeBar.setTint(color)
                                },
                            })
                        }
                    }

                    if (this.currentTime <= 1000 && !this.isTimeRunningOut) {
                        this.isTimeRunningOut = true
                    }
                },
                onComplete: () => {
                    if (doCallBackOnEnd) this.doCallBack()
                },
            })
        }
    }

    public resetToDefault() {
        this.timeBar.setTint(TimeBarView.COLOR_CODE_GREEN)
        this.isFadingColor = false
        this.isFadeYellow = false
        this.isTimeRunningOut = false

        this.timeBar.width = this.timeBarWidth - 4 + TimeBarView.OFFSET_WIDTH
    }

    public pauseTimebar() {
        this.tweenTimeBar?.pause()
        this.countdownIntervalSubscription?.unsubscribe()
        this.fadeColorTween?.destroy()

        if(this.countdownSFXSound != undefined)
            this.countdownSFXSound.stop()

        if(this.timeAlmostUpCountdownSound != undefined)
            this.timeAlmostUpCountdownSound.stop()
    }

    public doCallBack() {
        this.tweenTimeBar?.pause()
        this.countdownIntervalSubscription?.unsubscribe()
        this.callBackFunction()
    }

    public getCurrentTime(): number {
        return this.currentTime
    }

    public setActiveTimeBar(isActive: boolean) {
        this.setVisible(isActive)
    }

    public getIsTimeRunningOut(): boolean {
        return this.isTimeRunningOut
    }

    private changeValueRange(oldMin: number, oldMax: number, newMin: number, newMax: number, value: number) : number {
        return (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
    }
}
