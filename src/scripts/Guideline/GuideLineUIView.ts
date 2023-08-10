import { Actions, Display, GameObjects, Input, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { PodProvider } from '../pod/PodProvider'
import { GuideLineUICellView } from './GuideLineUICellView'
import { tap, timer } from 'rxjs'
import { TownDayNightPod } from './../pod/TownDayNightPod'
import { TownTimeState } from '../Town/TownTimeState'
import { IngredientBean } from './IngredientBean'

export class GuideLineUIView extends GameObjects.GameObject {
    private guideLineUI: GameObjects.RenderTexture
    private townBuildingPod: TownBuildingPod
    private townDayNightPod: TownDayNightPod
    private ingredientBeans: IngredientBean[] = []
    private currentTimeGuideLineUICellViewList: GuideLineUICellView[] = []
    private gridCellWidth: number = 70
    private gridCellHeight: number = 70
    private gridCellOffset: number
    private keyY: Input.Keyboard.Key
    private currentTownTimeState: TownTimeState

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    private setupSubscribe(): void {
        this.townDayNightPod.townTimeState.subscribe((state) => {
            this.currentTownTimeState = state
            this.updateCurrentTimeStateCellViewList()
            this.setupGuideLineUI()
        })

        //Need To Add Condition Checks For When All Found For Login First Time
        PodProvider.instance.guideLineUIManager.isAllFound.subscribe((isAllFound) => {
            if (isAllFound) {
                timer(500).subscribe((_) => {
                    this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
                        cellView.destroy()
                    })

                    if (this.currentTownTimeState == TownTimeState.Day) {
                        this.currentTownTimeState = TownTimeState.Night
                    } else {
                        this.currentTownTimeState = TownTimeState.Day
                    }
                    this.getIngredientBeansAndSetupUI(this.currentTownTimeState)
                })
            }
        })
    }

    private updateCurrentTimeStateCellViewList(): void {
        this.currentTimeGuideLineUICellViewList.length = 0

        this.ingredientBeans.forEach((cellBean) => {
            let cellView: GuideLineUICellView = new GuideLineUICellView(this.scene, cellBean)
            this.currentTimeGuideLineUICellViewList.push(cellView)
        })
        PodProvider.instance.guideLineUIManager.addGuideLineUICellViewList(this.currentTimeGuideLineUICellViewList)
    }

    private setupGuideLineUI() {
        let ninesliceTexture = 'guideline-bg-slice'
        if (this.scene.textures.exists(ninesliceTexture)) this.scene.textures.remove(ninesliceTexture)
        this.scene.textures.addImage(
            ninesliceTexture,
            this.scene.textures.get('guideline-bg').getSourceImage() as HTMLImageElement
        )
        this.guideLineUI = this.scene.add
            .nineslice(
                UIUtil.getCanvasWidth() / 2,
                UIUtil.getCanvasHeight() - 50,
                (this.currentTimeGuideLineUICellViewList.length + 1.5) * this.gridCellWidth,
                80,
                ninesliceTexture,
                [21, 45, 21, 45]
            )
            .setOrigin(0.5)

        this.setupGuideLineCellViewGrid()
    }

    private setupGuideLineCellViewGrid() {
        this.gridCellOffset = ((this.currentTimeGuideLineUICellViewList.length - 1) * this.gridCellWidth) / 2

        Actions.GridAlign(this.currentTimeGuideLineUICellViewList, {
            position: Display.Align.CENTER,
            cellWidth: this.gridCellWidth,
            cellHeight: this.gridCellHeight,
            x: this.scene.cameras.main.centerX - this.gridCellOffset,
            y: this.guideLineUI.y,
        })

        this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
            cellView.doInit(cellView.x, cellView.y)
        })
    }

    private checkIsAllIngredientFound(cellView: GuideLineUICellView): boolean {
        return cellView.ingredientBean.isFound == true
    }

    private getIngredientBeansAndSetupUI(townTimeState: TownTimeState) {
        this.townBuildingPod
            .getIngredientBeansData(townTimeState)
            .pipe(
                tap((x) => {
                    this.ingredientBeans = x
                    this.updateCurrentTimeStateCellViewList()
                })
            )
            .subscribe((_) => {
                this.setupGuideLineUI()
            })
    }

    public doInit(): void {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.keyY = this.scene.input.keyboard.addKey('Y')
        this.setupSubscribe()
        this.getIngredientBeansAndSetupUI(this.townDayNightPod.townTimeState.value)
    }

    public update(): void {
        if (Input.Keyboard.JustDown(this.keyY)) {
            if (this.currentTimeGuideLineUICellViewList.every(this.checkIsAllIngredientFound)) {
                let mockTimer = this.scene.time.addEvent({
                    delay: 500,
                    repeat: 0,
                    callback: () => {
                        if (this.currentTownTimeState == TownTimeState.Day) {
                            this.currentTownTimeState = TownTimeState.Night
                        } else {
                            this.currentTownTimeState = TownTimeState.Day
                        }
                        this.getIngredientBeansAndSetupUI(this.currentTownTimeState)
                    },
                })
            }
        }
    }
}
