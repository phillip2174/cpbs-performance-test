import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../../plugins/objects/GameObjectConstructor'
import { CollectionPod } from '../../Pod/CollectionPod'
import { PodProvider } from '../../../pod/PodProvider'
import { TextAdapter } from '../../../text-adapter/TextAdapter'
import { RewardPointCellView } from '../../Recipe/RewardPointCellView'
import { CollectionDetailRecipeTweenView } from '../../CollectionDetail/CollectionDetailRecipeTweenView'
import { Subscription } from 'rxjs'
import { CookState } from '../type/CookState'
import { Button } from '../../../button/Button'
import { CollectionPanelState } from '../type/CollectionPanelState'
import { CollectionDetailState } from '../type/CollectionDetailState'
import { RecipeBean } from '../RecipeBean'
import { TagBonusView } from '../../Recipe/TagBonusView'
import { RecipePod } from '../../../pod/RecipePod'

export class CollectionDetailCongratCellView extends GameObjects.Container {
    public static readonly WIDTH_SIZE_BG_MOBILE: number = 311
    public static readonly HEIGHT_SIZE_BG_MOBILE: number = 464
    public static readonly WIDTH_SIZE_BG_DESKTOP: number = 480
    public static readonly HEIGHT_SIZE_BG_DESKTOP: number = 494
    public static readonly RECIPE_KEY_IMAGE: string = 'recipe-'

    private congratContainer: GameObjects.Container
    private tagContainer: GameObjects.Container

    private positionTagRect: GameObjects.Rectangle

    private firstDetailCellBG: GameObjects.NineSlice

    private rewardPointCellView: RewardPointCellView
    private tagBonusView: TagBonusView
    private collectionDetailRecipeTweenView: CollectionDetailRecipeTweenView

    private congratText: GameObjects.Text
    private recipeCookedText: GameObjects.Text
    private recieveText: GameObjects.Text

    private confirmButton: Button

    private isShowRecieveIngredient: boolean = true

    private openCongratTextTweenChain: Tweens.TweenChain
    private openTagCellTween: Tweens.TweenChain
    private openRecieveTextTween: Tweens.Tween

    private selectedSubscription: Subscription
    private recipeBean: RecipeBean

    private collectionPod: CollectionPod
    private recipePod: RecipePod
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y)
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.collectionPod = PodProvider.instance.collectionPod
        this.recipePod = PodProvider.instance.recipePod

        this.createUI()
        this.createTween()
        this.createSubscription()
        this.setActionButton()
    }

    public showCookedTween() {
        this.openCongratTextTweenChain?.restart()
    }

    private setActionButton() {
        this.confirmButton?.onClick(() => {
            this.recipePod.unlockedRecipeMenu(this.recipeBean.userRecipeBean).subscribe((_) => {
                this.collectionPod.setStateDetail(CollectionDetailState.UnlockedDetail)
                this.collectionPod.changeState(CollectionPanelState.CollectionListFromCongrat)
                this.collectionPod.changeState(CollectionPanelState.CollectionDetail)
            })
        })
    }

    private createUI() {
        this.congratContainer = this.scene.add.container(0, 0)

        let sizeWidthBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailCongratCellView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailCongratCellView.WIDTH_SIZE_BG_MOBILE

        let sizeHeightBG = this.scene.sys.game.device.os.desktop
            ? CollectionDetailCongratCellView.HEIGHT_SIZE_BG_DESKTOP
            : CollectionDetailCongratCellView.HEIGHT_SIZE_BG_MOBILE

        this.firstDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, sizeHeightBG, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.congratText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('ยินดีด้วย!!')
            .setOrigin(0.5)
            .setPosition(0, 50)
            .setStyle({ fill: '#29CC6A', fontSize: 36 })

        this.recipeCookedText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('"ไข่ตุ๋นฟักทอง" ปรุงเสร็จแล้ว')
            .setOrigin(0.5)
            .setPosition(0, 90)
            .setStyle({ fill: '#585858', fontSize: 25 })

        this.recieveText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText('คุณได้รับ')
            .setOrigin(0.5)
            .setPosition(0, 120)
            .setStyle({ fill: '#585858', fontSize: 25 })

        this.tagContainer = this.scene.add.container(0, 165)

        this.positionTagRect = this.scene.add.rectangle(0, 165, 0, 0, 0xff00ff, 0)

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.doInit()

        this.tagBonusView = new TagBonusView(this.scene, 0, 0)
        this.tagBonusView.doInit()

        this.tagContainer.add([this.rewardPointCellView, this.tagBonusView])

        this.collectionDetailRecipeTweenView = new CollectionDetailRecipeTweenView(this.scene, 0, 310)
        this.collectionDetailRecipeTweenView.doInit()

        this.confirmButton = new Button(this.scene, 0, this.firstDetailCellBG.height - 50, 119, 48, '', 1000, 'CONFIRM')
        this.confirmButton.setNineSlice({
            imageAtlasKey: '',
            imageKey: 'button-white-bg',
            leftWidth: 15,
            rightWidth: 15,
            topHeight: 15,
            bottomHeight: 15,
            safeAreaOffset: 0,
        })

        this.confirmButton.setTextStyle({
            fontFamily: 'DB_HeaventRounded',
            fill: 'white',
            fontSize: 22,
        })

        this.confirmButton.setTextPosition(0, 0)

        this.confirmButton.setTintColorBackground(0x29cc6a)

        this.congratContainer.add([
            this.firstDetailCellBG,
            this.congratText,
            this.recipeCookedText,
            this.recieveText,
            this.positionTagRect,
            this.tagContainer,
            this.confirmButton,
            this.collectionDetailRecipeTweenView,
        ])

        this.add([this.congratContainer])
    }

    private setupCookedStateTween(bean: RecipeBean) {
        this.congratText.setScale(0)
        this.recipeCookedText.setAlpha(0)
        this.recieveText.setAlpha(0)
        this.tagBonusView.setVisible(this.recipeBean.userRecipeBean.bonus != undefined)

        this.recipeCookedText.setText(`"${bean.title}" ปรุงเสร็จแล้ว`)
        this.collectionDetailRecipeTweenView.setupCookedStateTween()
        this.collectionDetailRecipeTweenView.setRecipe(CollectionDetailCongratCellView.RECIPE_KEY_IMAGE + bean.id)

        let beanBonus = this.recipeBean.userRecipeBean.bonus
        if (beanBonus != undefined) {
            this.tagBonusView.setTagBonusCell(beanBonus)
            this.collectionDetailRecipeTweenView.setIngredient(beanBonus.id, beanBonus.amount)
        }

        this.setPositionTag()

        this.rewardPointCellView.setScale(0)
        this.tagBonusView.setScale(0)
    }

    private setPositionTag() {
        this.tagContainer.x = 0

        if (this.recipeBean.userRecipeBean.bonus) {
            let spacing = 10
            this.positionTagRect.setSize(
                this.rewardPointCellView.getBounds().width + this.tagBonusView.getBounds().width + spacing,
                36
            )
            this.tagContainer.x = -this.positionTagRect.width / 2 + this.rewardPointCellView.width / 2

            this.tagContainer.width = this.tagContainer.getBounds().width
            this.tagContainer.height = this.tagContainer.getBounds().height

            Phaser.Actions.AlignTo(this.tagContainer.getAll(), Phaser.Display.Align.RIGHT_CENTER, spacing)
        }
    }

    private setActiveElement(isActive: boolean) {
        this.congratText.setVisible(isActive)
        this.congratText.setActive(isActive)

        this.recipeCookedText.setVisible(isActive)
        this.recipeCookedText.setActive(isActive)

        this.recieveText.setVisible(isActive)
        this.recieveText.setActive(isActive)

        this.collectionDetailRecipeTweenView.setVisible(isActive)
        this.collectionDetailRecipeTweenView.setActive(isActive)
    }

    private createSubscription() {
        this.selectedSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((bean) => {
            this.recipeBean = bean
            if (this.recipeBean.userRecipeBean?.state == CookState.Cooked) {
                this.rewardPointCellView.setPointRewardCell(bean)
                this.setupCookedStateTween(bean)
            }
        })
    }

    private createTween() {
        this.openCongratTextTweenChain = this.scene.tweens.chain({
            tweens: [
                {
                    targets: this.congratText,
                    duration: 150,
                    props: {
                        scale: {
                            from: 0,
                            to: 1.3,
                        },
                    },
                    onComplete: () => {
                        this.collectionDetailRecipeTweenView.playTween(
                            this.recipeBean.userRecipeBean.bonus != undefined,
                            () => this.openRecieveTextTween?.restart(),
                            () => this.openTagCellTween?.restart()
                        )
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: this.congratText,
                    duration: 100,
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

        this.openTagCellTween = this.scene.tweens.chain({
            tweens: [
                {
                    targets: [this.rewardPointCellView, this.tagBonusView],
                    duration: 200,
                    props: {
                        scale: {
                            from: 0,
                            to: 1.3,
                        },
                    },
                    ease: 'cubic.inout',
                },
                {
                    targets: [this.rewardPointCellView, this.tagBonusView],
                    duration: 100,
                    props: {
                        scale: {
                            from: 1.3,
                            to: 1,
                        },
                    },
                    onComplete: () => {},
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.openRecieveTextTween = this.scene.add.tween({
            targets: [this.recipeCookedText, this.recieveText],
            duration: 250,
            ease: 'linear',
            props: {
                alpha: {
                    from: 0,
                    to: 1,
                },
            },
            onComplete: () => {
                if (!this.recipeBean.userRecipeBean.bonus) {
                    this.openTagCellTween?.restart()
                }
            },
            persist: true,
            paused: true,
        })
    }
}
