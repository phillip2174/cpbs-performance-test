import { GameObjects, Scene, Tweens } from 'phaser'
import { Subscription } from 'rxjs'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { TownUIState } from '../Type/TownUIState'
import { DailyLoginBean } from './DailyLoginBean'
import { DailyLoginCollectState } from './DailyLoginCollectState'
import { DailyLoginRewardPreviewView } from './DailyLoginRewardPreviewView'

export class DailyLoginCellView extends GameObjects.Container {
    public static readonly BG_WIDTH_BIG_DESKTOP: number = 243
    public static readonly BG_WIDTH_DESKTOP: number = 116.5
    public static readonly BG_HEIGHT_DESKTOP: number = 112
    public static readonly BG_WIDTH_BIG_MOBILE: number = 152
    public static readonly BG_WIDTH_MOBILE: number = 74
    public static readonly BG_HEIGHT_MOBILE: number = 100
    public static readonly STAMP_MAX_SCALE_DESKTOP: number = 0.69
    public static readonly STAMP_MIN_SCALE_DESKTOP: number = 0.23
    public static readonly STAMP_MAX_SCALE_MOBILE: number = 0.54
    public static readonly STAMP_MIN_SCALE_MOBILE: number = 0.18

    private cellBg: GameObjects.NineSlice

    private dayText: GameObjects.Text

    private rewardPreviewContainer: GameObjects.Container
    private rewardPreviewPosRect: GameObjects.Rectangle
    private rewardPreviews: DailyLoginRewardPreviewView[] = []

    private skipButton: GameObjects.Rectangle

    private collectedStamp: GameObjects.Image

    private stampMaxScale: number
    private stampMinScale: number

    private dailyLoginBean: DailyLoginBean

    private stampTween: Tweens.TweenChain

    private isDesktop: boolean

    private uiStateSubscription: Subscription

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(dailyLoginBean: DailyLoginBean) {
        if (this.scene.sys.game.device.os.desktop) {
            this.isDesktop = true
            this.stampMaxScale = DailyLoginCellView.STAMP_MAX_SCALE_DESKTOP
            this.stampMinScale = DailyLoginCellView.STAMP_MIN_SCALE_DESKTOP
        } else {
            this.isDesktop = false
            this.stampMaxScale = DailyLoginCellView.STAMP_MAX_SCALE_MOBILE
            this.stampMinScale = DailyLoginCellView.STAMP_MIN_SCALE_MOBILE
        }
        this.dailyLoginBean = dailyLoginBean
        this.setupUI()
        this.createStampTween()
        this.updateCellByCollectState()
        this.setupSubscribe()
    }

    public updateCellOnCollecting(skipButton: GameObjects.Rectangle): void {
        this.skipButton = skipButton
        this.stampTween?.restart()
    }

    public stopStampTween(): void {
        this.stampTween?.pause()
        this.collectedStamp.setVisible(true).setScale(this.stampMinScale)
        this.dailyLoginBean.collectState = DailyLoginCollectState.Collected
        this.updateCellCollectedState()
    }

    public getCollectState(): DailyLoginCollectState {
        return this.dailyLoginBean.collectState
    }

    public getIsBigReward(): boolean {
        return this.dailyLoginBean.isBigReward
    }

    private setupUI(): void {
        this.rewardPreviewContainer = this.scene.add.container()
        this.isDesktop ? this.setupCellDesktop() : this.setupCellMobile()

        this.dayText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('DAY ' + this.dailyLoginBean.id)
            .setStyle({ fill: '#2B2B2B', fontSize: 16 })
            .setPosition(0, -this.cellBg.height / 2 + (this.isDesktop ? 15 : 10))
            .setOrigin(0.5)

        this.collectedStamp = this.scene.add
            .image(0, 0, 'daily-login-stamp')
            .setScale(this.stampMinScale)
            .setVisible(false)

        this.setupRewardPreviewsContainer()
        this.add([
            this.cellBg,
            this.dayText,
            this.rewardPreviewContainer,
            this.rewardPreviewPosRect,
            this.collectedStamp,
        ])

        this.width = this.getBounds().width
        this.height = this.getBounds().height
    }

    private setupCellDesktop(): void {
        if (this.dailyLoginBean.isBigReward) {
            this.cellBg = this.scene.add
                .nineslice(
                    0,
                    0,
                    'collection-card',
                    '',
                    DailyLoginCellView.BG_WIDTH_BIG_DESKTOP,
                    DailyLoginCellView.BG_HEIGHT_DESKTOP,
                    30,
                    30,
                    30,
                    30
                )
                .setTint(0xfff3db)
        } else {
            this.cellBg = this.scene.add.nineslice(
                0,
                0,
                'collection-card',
                '',
                DailyLoginCellView.BG_WIDTH_DESKTOP,
                DailyLoginCellView.BG_HEIGHT_DESKTOP,
                30,
                30,
                30,
                30
            )
        }
    }

    private setupCellMobile(): void {
        if (this.dailyLoginBean.isBigReward) {
            this.cellBg = this.scene.add
                .nineslice(
                    0,
                    0,
                    'collection-card',
                    '',
                    DailyLoginCellView.BG_WIDTH_BIG_MOBILE,
                    DailyLoginCellView.BG_HEIGHT_MOBILE,
                    30,
                    30,
                    30,
                    30
                )
                .setTint(0xfff3db)
        } else {
            this.cellBg = this.scene.add.nineslice(
                0,
                0,
                'collection-card',
                '',
                DailyLoginCellView.BG_WIDTH_MOBILE,
                DailyLoginCellView.BG_HEIGHT_MOBILE,
                30,
                30,
                30,
                30
            )
        }
    }

    private setupSubscribe(): void {
        this.uiStateSubscription = PodProvider.instance.townUIPod.townUIState.subscribe((state) => {
            if (this.dailyLoginBean.collectState == DailyLoginCollectState.Collected) {
                this.rewardPreviews?.forEach((reward) => {
                    reward.setIconGrayscale(state == TownUIState.DailyLogin)
                })
            }
        })
    }

    private setupRewardPreviewsContainer(): void {
        this.dailyLoginBean.rewardBeans.forEach((rewardBean) => {
            let dailyLoginRewardPreviewView = new DailyLoginRewardPreviewView(this.scene)
            dailyLoginRewardPreviewView.doInit(this.dailyLoginBean, rewardBean)
            if (this.isDesktop) dailyLoginRewardPreviewView.setPosition(0, -3)
            this.rewardPreviewContainer.add([dailyLoginRewardPreviewView])
        })

        this.rewardPreviews = this.rewardPreviewContainer.getAll() as DailyLoginRewardPreviewView[]
        this.rewardPreviewPosRect = this.scene.add.rectangle(this.isDesktop ? 1 : 0, 3, 10, 10, 0xff00ff, 0)

        let alignOffsetX = this.isDesktop ? 20 : 3
        let sumWidth =
            this.rewardPreviews[0].width * this.rewardPreviews.length + (alignOffsetX * this.rewardPreviews.length - 1)
        this.rewardPreviewPosRect.setSize(sumWidth, this.rewardPreviews[0].height)

        this.rewardPreviewContainer.width = this.rewardPreviewContainer.getBounds().width
        this.rewardPreviewContainer.height = this.rewardPreviewContainer.getBounds().height

        Phaser.Display.Align.In.LeftCenter(
            this.rewardPreviewContainer,
            this.rewardPreviewPosRect,
            this.isDesktop ? -8 : 0
        )
        Phaser.Actions.AlignTo(this.rewardPreviewContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, alignOffsetX)
    }

    private createStampTween(): void {
        this.stampTween = this.scene.tweens.chain({
            targets: this.collectedStamp,
            tweens: [
                {
                    ease: 'Cubic.easeInOut',
                    duration: 250,
                    props: {
                        scale: {
                            from: this.stampMaxScale,
                            to: this.stampMinScale - 0.04,
                        },
                    },
                    delay: 800,
                    onStart: () => {
                        this.collectedStamp.setVisible(true)
                    },
                    onComplete: () => {
                        this.skipButton?.removeInteractive()
                        this.dailyLoginBean.collectState = DailyLoginCollectState.Collected
                        this.updateCellCollectedState()
                    },
                },
                {
                    ease: 'Cubic.easeInOut',
                    duration: 150,
                    props: {
                        scale: {
                            from: this.stampMinScale - 0.04,
                            to: this.stampMinScale,
                        },
                    },
                },
            ],
            persist: true,
            paused: true,
            onComplete: () => {},
        })
    }

    private updateCellCollectedState(): void {
        if (this.dailyLoginBean.isBigReward) this.cellBg.clearTint()
        this.cellBg.setTexture('daily-login-collected-bg')
        this.rewardPreviews.forEach((rewardPreview) => {
            this.dayText.setColor('#848A92')
            rewardPreview.updatePreviewOnCollected()
        })
    }

    private updateCellByCollectState(): void {
        switch (this.dailyLoginBean.collectState) {
            case DailyLoginCollectState.Uncollected:
                this.collectedStamp.setVisible(false)
                break
            case DailyLoginCollectState.Collected:
                this.collectedStamp.setVisible(true)
                this.updateCellCollectedState()
                break
        }
    }
}
