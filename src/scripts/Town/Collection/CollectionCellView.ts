import { GameObjects, Scene, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { CollectionCellPod } from './CollectionCellPod'
import { RecipeBean } from './RecipeBean'
import { RecipeType } from './type/RecipeType'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { Button } from '../../button/Button'
import { CookState } from './type/CookState'
import { UserRecipe } from './UserRecipe'
import { CollectionPod } from '../Pod/CollectionPod'
import { PodProvider } from '../../pod/PodProvider'
import { CollectionPanelState } from './type/CollectionPanelState'
import { TagRarityView } from '../Recipe/TagRarityView'
import { RecipePreviewView } from '../Recipe/RecipePreviewView'
import { AnimationController } from '../AnimationController'
import { RecipePod } from '../../pod/RecipePod'
import { ButtonNotificationView } from '../ButtonNotificationView'

export class CollectionCellView extends GameObjects.Container {
    public static readonly BUTTON_ICON_DEFAULT_SCALE: number = 1
    public static readonly BUTTON_ICON_MAX_SCALE: number = 1.2
    public static readonly BUTTON_ICON_DEFAULT_ANGLE: number = 0
    public static readonly BUTTON_ICON_MAX_ANGLE: number = -5

    private cellButton: Button
    private cardBackground: GameObjects.Image

    private contentContainer: GameObjects.Container

    private thumbnailContainer: GameObjects.Container
    private thumbnailBackground: GameObjects.Image
    private recipePreviewView: RecipePreviewView

    private tagRarityView: TagRarityView
    private nameText: GameObjects.Text

    private buttonNotificationView: ButtonNotificationView

    private onClickDownTweener: Tweens.Tween
    private onClickUpTweener: Tweens.Tween
    private onHoverButtonIconTween: Tweens.TweenChain

    private onLeaveButtonIconTween: Tweens.TweenChain

    private onLeaveButtonTextTween: Tweens.Tween
    private onHoverButtonTextTween: Tweens.Tween

    private pod: CollectionCellPod
    private collectionPod: CollectionPod
    private recipePod: RecipePod
    constructor(scene: Scene) {
        super(scene, 0, 0)
        GameObjectConstructor(scene, this)
    }

    public doInit(bean: RecipeBean) {
        this.pod = new CollectionCellPod(this.scene)
        this.collectionPod = PodProvider.instance.collectionPod
        this.recipePod = PodProvider.instance.recipePod
        this.pod.setRecipeCellBean(bean)

        this.createUI()
        this.setActionCell()
        this.createTween()
    }

    public getBean(): RecipeBean {
        return this.pod.recipeBean
    }

    public getUserRecipeBean() {
        return this.pod.userRecipe
    }

    private createUI() {
        let bean: RecipeBean = this.pod.recipeBean

        this.cardBackground = this.scene.add.image(0, 0, 'collection-card')

        this.contentContainer = this.scene.add.container(0, 0)

        this.thumbnailContainer = this.scene.add.container(0, -25)
        this.contentContainer.add(this.thumbnailContainer)

        this.thumbnailBackground = this.scene.add.image(0, 0, 'thumbnail-bg')
        this.recipePreviewView = new RecipePreviewView(this.scene, 0, 0)
        this.recipePreviewView.doInit()

        this.thumbnailContainer.add([this.thumbnailBackground, this.recipePreviewView])

        this.nameText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded_Med')
            .setText(bean.secretUnlock ? 'เมนูลับมาสเตอร์เชฟ' : bean.title)
            .setOrigin(0.5)
            .setPosition(0, 40)
            .setStyle({ fill: '#585858', fontSize: 18 })

        this.tagRarityView = new TagRarityView(this.scene, 0, 63)
        this.tagRarityView.doInit()

        this.buttonNotificationView = new ButtonNotificationView(this.scene).setVisible(false)
        this.buttonNotificationView.doInit(65, -75)

        this.add([
            this.cardBackground,
            this.contentContainer,
            this.nameText,
            this.tagRarityView,
            this.buttonNotificationView,
        ])

        this.setUICellMaster()
    }

    private setUICellMaster() {
        let bean: RecipeBean = this.pod.recipeBean

        if (bean.secretUnlock) {
            this.thumbnailBackground.setTint(0xd7e8ff)

            this.recipePreviewView.setSecretRecipe(0x9bd6f8)
            this.tagRarityView.setSecretTag(0.643)
        } else {
            this.recipePreviewView.setRecipePreviewMaster(bean.id)
            this.thumbnailBackground.setTint(0xedf0f5)
            this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase(), 0.643)
        }

        this.recipePreviewView.setSizeRecipe(94, 94)
        this.recipePreviewView.setSizeEffect(134, 100)
    }

    public setCellWithUserRecipe(userRecipe: UserRecipe) {
        let bean: RecipeBean = this.pod.recipeBean
        this.pod.setUserRecipeBean(userRecipe)

        switch (bean.userRecipeBean.state) {
            case CookState.Cooked:
                this.buttonNotificationView.setVisible(true)
                break
            case CookState.Unlocked:
                this.setCellToUnlocked()
                break
        }
    }

    public setCellToUnlocked() {
        let bean: RecipeBean = this.pod.recipeBean
        this.buttonNotificationView.setVisible(false)
        this.nameText.setText(bean.title)
        this.recipePreviewView.setRecipePreviewMaster(bean.id)
        this.tagRarityView.setColorTagAndTextWithType(bean.type, bean.type.toString().toUpperCase(), 0.643)
        this.recipePreviewView.setCellWithRecipeType(bean.type)
        this.setBackgroundColorCell()
    }

    private setBackgroundColorCell() {
        switch (this.pod.recipeBean.type) {
            case RecipeType.Easy:
                this.thumbnailBackground.setTint(0xebfef2)
                break
            case RecipeType.Normal:
                this.thumbnailBackground.setTint(0xfff9ec)
                break
            case RecipeType.Hard:
                this.thumbnailBackground.setTint(0xfdf3ec)
                break
            case RecipeType.Challenge:
                this.thumbnailBackground.setTint(0xf2f0fd)
                break
        }
    }

    private setActionCell() {
        let BoundContainer = this.getBounds()
        this.cellButton = new Button(this.scene, 0, 0, BoundContainer.width, BoundContainer.height, '').setAlpha(0.001)

        this.cellButton.onClick(
            () => {
                if (!this.collectionPod.isDragScrollView && !this.collectionPod.isDragScrollViewFilter) {
                    this.collectionPod.setCurrentDetailSelectedRecipe(this.pod.recipeBean)
                    this.collectionPod.changeState(CollectionPanelState.CollectionDetail)
                }
                this.onClickUpTweener?.restart()
            },
            () => {
                this.onClickDownTweener?.restart()
            },
            () => {
                this.onClickUpTweener?.restart()
            }
        )

        if (this.scene.sys.game.device.os.desktop) {
            this.cellButton.on('pointerover', () => {
                this.onHoverButton()
            })

            this.cellButton.on('pointerout', () => {
                this.onLeaveButton()
            })
        }

        this.add([this.cellButton])
    }

    private createTween() {
        this.onClickDownTweener = this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: `Quad.easeInOut`,
            props: {
                scale: { from: this.scale, to: 0.9 },
            },
            persist: true,
            paused: true,
        })

        this.onClickUpTweener = this.scene.tweens.add({
            targets: this,
            ease: 'Cubic.easeInOut',
            duration: 200,
            props: {
                scale: { from: this.scale, to: 1 },
            },
            persist: true,
            paused: true,
        })

        if (this.scene.sys.game.device.os.desktop) {
            let tweenOnHover = AnimationController.instance.tweenHoverButton(this.scene, undefined, () => {
                this.nameText?.setStyle({ fill: '#EE843C' })
            })
            let tweenOnLeaveHover = AnimationController.instance.tweenLeaveHoverButton(this.scene, undefined, () => {
                this.nameText?.setStyle({ fill: '#585858' })
            })
            this.onHoverButtonIconTween = tweenOnHover.onHoverButtonIconTween

            this.onLeaveButtonIconTween = tweenOnLeaveHover.onLeaveHoverButtonIconTween

            this.onHoverButtonTextTween = tweenOnHover.onHoverButtonTextTween

            this.onLeaveButtonTextTween = tweenOnLeaveHover.onLeaveHoverButtonTextTween
        }
    }

    private onHoverButton(): void {
        this.onHoverButtonIconTween?.restart()
        this.onHoverButtonTextTween?.restart()
        this.buttonNotificationView?.playOnHoverTweens()

        this.recipePreviewView?.onHover()
    }

    private onLeaveButton(): void {
        this.onLeaveButtonIconTween?.restart()
        this.onLeaveButtonTextTween?.restart()
        this.buttonNotificationView?.playOnLeaveTweens()

        this.recipePreviewView?.onLeave()
    }

    destroy(fromScene?: boolean): void {
        this.onHoverButtonIconTween?.destroy()
        this.onHoverButtonTextTween?.destroy()

        this.onLeaveButtonIconTween?.destroy()
        this.onLeaveButtonTextTween?.destroy()
    }
}
