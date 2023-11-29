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
    public static readonly LENGTH_CUT_TEXT_TITLE_DESKTOP: number = 45
    public static readonly LENGTH_CUT_TEXT_TITLE_MOBILE: number = 30
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
    private congratDescTextContainer: GameObjects.Container

    private confirmButton: Button

    private isShowRecieveIngredient: boolean = true

    private openCongratTextTweenChain: Tweens.TweenChain
    private openTagCellTween: Tweens.TweenChain
    private openRecieveTextTween: Tweens.Tween

    private isDesktop: boolean

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
        this.scene.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)

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
        const isDesktop = this.scene.sys.game.device.os.desktop
        let sizeWidthBG = isDesktop
            ? CollectionDetailCongratCellView.WIDTH_SIZE_BG_DESKTOP
            : CollectionDetailCongratCellView.WIDTH_SIZE_BG_MOBILE

        let sizeHeightBG = isDesktop
            ? CollectionDetailCongratCellView.HEIGHT_SIZE_BG_DESKTOP
            : CollectionDetailCongratCellView.HEIGHT_SIZE_BG_MOBILE

        this.firstDetailCellBG = this.scene.add
            .nineslice(0, 0, 'detail-cell', '', sizeWidthBG, sizeHeightBG, 30, 30, 30, 30)
            .setOrigin(0.5, 0)

        this.congratText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
            .setText('ยินดีด้วย!!')
            .setOrigin(0.5)
            .setPosition(0, isDesktop ? 40 : 30)
            .setStyle({ fill: '#29CC6A', fontSize: 36 })

        this.congratDescTextContainer = this.scene.add.container(0, isDesktop ? 90 : 75)

        this.tagContainer = this.scene.add.container(0, 165)

        this.positionTagRect = this.scene.add.rectangle(0, 165, 0, 0, 0xff00ff, 0)

        this.rewardPointCellView = new RewardPointCellView(this.scene, 0, 0)
        this.rewardPointCellView.createLargeTag()

        this.tagBonusView = new TagBonusView(this.scene, 0, 0)
        this.tagBonusView.doInit()

        this.tagContainer.add([this.rewardPointCellView, this.tagBonusView])

        this.collectionDetailRecipeTweenView = new CollectionDetailRecipeTweenView(
            this.scene,
            0,
            this.scene.sys.game.device.os.desktop ? 340 : 320
        )
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
            this.congratDescTextContainer,
            this.positionTagRect,
            this.tagContainer,
            this.confirmButton,
            this.collectionDetailRecipeTweenView,
        ])

        this.add([this.congratContainer])
    }

    private setupCookedStateTween(bean: RecipeBean) {
        this.congratText.setScale(0)
        this.congratDescTextContainer.setAlpha(0)

        this.tagBonusView.setVisible(this.recipeBean.userRecipeBean.bonus != undefined)

        //let testArr = ['ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง', 'ไข่ตุ่นฟักทองไข่ตุ่นฟักทองไข่ตุ่นฟักทอง']
        const title = TextAdapter.splitThaiStringByLegth(
            bean.title,
            this.isDesktop
                ? CollectionDetailCongratCellView.LENGTH_CUT_TEXT_TITLE_DESKTOP
                : CollectionDetailCongratCellView.LENGTH_CUT_TEXT_TITLE_MOBILE
        )
        this.createTextCongratDesc(title)

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

    private createTextCongratDesc(arrTitle: string[]) {
        this.congratDescTextContainer.removeAll(true)

        let mapDesc = arrTitle.map((x) => x)
        let maxArrIndex = mapDesc.length - 1
        mapDesc[0] = `"${mapDesc[0]}`
        mapDesc[maxArrIndex] = `${mapDesc[maxArrIndex]}"`
        mapDesc.push(`ปรุงเสร็จแล้วคุณได้รับ`)

        mapDesc.forEach((line) => {
            let lineGroup: GameObjects.Container = this.scene.add.container()
            let positionMock = this.scene.add
                .rectangle(
                    0,
                    0,
                    this.firstDetailCellBG.width - (this.scene.sys.game.device.os.desktop ? 100 : 80),
                    24,
                    0xff0000,
                    0
                )
                .setOrigin(0.5, 0.5)

            let titleText = TextAdapter.instance
                .getVectorText(this.scene, 'DB_HeaventRounded')
                .setText(line)
                .setOrigin(0.5, 0.5)
                .setPosition(0, -positionMock.height / 2 + 8)
                .setStyle({ fill: '#585858', fontSize: 24 })

            lineGroup.add([positionMock, titleText])

            lineGroup.width = lineGroup.getBounds().width
            lineGroup.height = 24

            this.congratDescTextContainer.add(lineGroup)
        })

        if (mapDesc.length > 1)
            Phaser.Actions.AlignTo(this.congratDescTextContainer.getAll(), Phaser.Display.Align.BOTTOM_CENTER, 0, 5)

        this.congratDescTextContainer.width = this.congratDescTextContainer.getBounds().width
        this.congratDescTextContainer.height = this.congratDescTextContainer.getBounds().height

        this.tagContainer.setPosition(0, this.congratDescTextContainer.y + this.congratDescTextContainer.height - 10)

        if (maxArrIndex > 0) {
            this.collectionDetailRecipeTweenView.setPosition(0, this.scene.sys.game.device.os.desktop ? 340 : 320)
        } else {
            this.collectionDetailRecipeTweenView.setPosition(0, this.scene.sys.game.device.os.desktop ? 320 : 300)
        }
    }

    private setActiveElement(isActive: boolean) {
        this.congratText.setVisible(isActive)
        this.congratText.setActive(isActive)

        this.congratDescTextContainer.setVisible(isActive)
        this.congratDescTextContainer.setActive(isActive)

        this.collectionDetailRecipeTweenView.setVisible(isActive)
        this.collectionDetailRecipeTweenView.setActive(isActive)
    }

    private createSubscription() {
        this.selectedSubscription = this.collectionPod.currentDetailRecipeSelected.subscribe((bean) => {
            this.recipeBean = bean
            if (this.recipeBean.userRecipeBean?.state == CookState.Cooked) {
                this.rewardPointCellView.setPointCell(bean.rewardPoint.toString())
                this.setupCookedStateTween(bean)
            }
        })

        this.on('destroy', () => { this.selectedSubscription?.unsubscribe() })
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
                    onComplete: () => { },
                    ease: 'linear',
                },
            ],
            persist: true,
            paused: true,
        })

        this.openRecieveTextTween = this.scene.add.tween({
            targets: [this.congratDescTextContainer],
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
