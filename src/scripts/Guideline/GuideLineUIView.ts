import { Actions, Display, GameObjects, Scale, Scene } from 'phaser'
import { Subscription, tap, timer } from 'rxjs'
import { ScrollView } from '../ScrollView/ScrollView'
import { TownBuildingPod } from '../Town/Pod/TownBuildingPod'
import { TownTimeState } from '../Town/Type/TownTimeState'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { PodProvider } from '../pod/PodProvider'
import { TextAdapter } from '../text-adapter/TextAdapter'
import { TownDayNightPod } from './../pod/TownDayNightPod'
import { GuideLineUICellView } from './GuideLineUICellView'
import { IngredientBean } from './IngredientBean'
import { ObjectPlacementDebugger } from '../plugins/ObjectPlacementDebugger'

export class GuideLineUIView extends GameObjects.GameObject {
   private guideLineUI: GameObjects.NineSlice
   private townBuildingPod: TownBuildingPod
   private townDayNightPod: TownDayNightPod
   private ingredientBeans: IngredientBean[] = []
   private currentTimeGuideLineUICellViewList: GuideLineUICellView[] = []
   private gridCellWidth: number = 70
   private gridCellHeight: number = 70
   private gridCellOffset: number
   private currentTownTimeState: TownTimeState
   private guideLineScrollView: ScrollView = undefined
   private currentFoundIngredientCountText: GameObjects.Text
   private maxIngredientCountText: GameObjects.Text
   private townTimeStateDisposable: Subscription
   private ingredientCountDisposable: Subscription
   private foundAllIngredientDisposable: Subscription

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   private setupSubscribe(): void {
      this.townTimeStateDisposable = this.townDayNightPod.townTimeState.subscribe((state) => {
         this.currentTownTimeState = state
         this.updateCurrentTimeStateCellViewList()
         this.setupGuideLineUI()
      })

      this.ingredientCountDisposable = PodProvider.instance.guideLineUIManager.currentFoundIngredientCount.subscribe(
         (currentCount) => {
            if (this.currentFoundIngredientCountText != null || this.currentFoundIngredientCountText != undefined) {
               this.currentFoundIngredientCountText.setText(currentCount.toString())
               this.scene.add.tween({
                  targets: this.currentFoundIngredientCountText,
                  duration: 300,
                  ease: 'cubic.inout',
                  props: { scale: { from: 1, to: 2.5 } },
                  yoyo: true,
                  repeat: 0,
               })
            }
         }
      )

      //Need To Add Condition Checks For When All Found For Login First Time
      this.foundAllIngredientDisposable = PodProvider.instance.guideLineUIManager.isAllFound.subscribe((isAllFound) => {
         if (isAllFound) {
            timer(600).subscribe((_) => {
               this.guideLineUI?.destroy()
               this.guideLineScrollView?.destroy()
               this.guideLineScrollView = undefined
               this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
                  cellView.destroy()
               })
               this.hideIngredientCountTexts()

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
      if (this.currentTimeGuideLineUICellViewList.length > 0) {
         this.guideLineUI = this.scene.add
            .nineslice(
               UIUtil.getCanvasWidth() / 2,
               UIUtil.getCanvasHeight() - 65,
               'guideline-bg',
               '',
               (this.currentTimeGuideLineUICellViewList.length >= this.getMaxGuidelineUILengthFromDeviceCheck()
                  ? !this.scene.sys.game.device.os.desktop
                     ? 5.85
                     : 7.85
                  : this.currentTimeGuideLineUICellViewList.length + 0.85) * this.gridCellWidth,
               105,
               35,
               35,
               18,
               18
            )
            .setOrigin(0.5)

         this.setupGuideLineScrollView()
         this.setupGuideLineCellViewGrid()
      }
   }

   private setupGuideLineScrollView() {
      if (this.currentTimeGuideLineUICellViewList.length > this.getMaxGuidelineUILengthFromDeviceCheck()) {
         let scrollViewPosX = this.guideLineUI.x - this.guideLineUI.width / 2 + 20
         let scrollViewPosY = this.guideLineUI.y - this.guideLineUI.height / 2 + 20

         this.guideLineScrollView = new ScrollView(
            this.scene,
            scrollViewPosX,
            scrollViewPosY,
            this.guideLineUI.width - 45,
            this.guideLineUI.height,
            5,
            this.gridCellWidth,
            this.gridCellHeight,
            1,
            0,
            this.gridCellWidth *
               (this.currentTimeGuideLineUICellViewList.length - this.getMaxGuidelineUILengthFromDeviceCheck()),
            0
         )
      }
   }

   private setupGuideLineCellViewGrid() {
      this.gridCellOffset = ((this.currentTimeGuideLineUICellViewList.length - 1) * this.gridCellWidth) / 2

      Actions.GridAlign(this.currentTimeGuideLineUICellViewList, {
         position: Display.Align.LEFT_TOP,
         cellWidth: this.gridCellWidth,
         cellHeight: this.gridCellHeight,
         x: this.guideLineScrollView == undefined ? this.scene.cameras.main.centerX - this.gridCellOffset : 40,
         y: this.guideLineScrollView == undefined ? this.guideLineUI.y + 10 : 40,
      })

      this.currentTimeGuideLineUICellViewList.forEach((cellView) => {
         this.setupGuideLineUICellView(cellView)
      })
   }

   private setupGuideLineUICellView(cellView: GuideLineUICellView) {
      if (this.guideLineScrollView == undefined) {
         cellView.doInit(cellView.x, cellView.y)
      } else {
         cellView.doInit(0, 0)
         cellView.addImagesToContainer()
         this.guideLineScrollView.addChildIntoContainer(cellView)
      }
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

   private getMaxGuidelineUILengthFromDeviceCheck(): number {
      return !this.scene.sys.game.device.os.desktop ? 5 : 7
   }

   private setupFoundIngredientCountTexts(): void {
      let maxIngredientCount = this.currentTimeGuideLineUICellViewList.length

      this.currentFoundIngredientCountText = TextAdapter.instance
         .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
         .setText('0')
         .setOrigin(0.5)
         .setPosition(this.guideLineUI.x + this.guideLineUI.width / 3, this.guideLineUI.y - 38)
         .setStyle({ fill: '#F19D63', fontSize: 25 })
         .setDepth(4)

      this.maxIngredientCountText = TextAdapter.instance
         .getVectorText(this.scene, 'DB_HeaventRounded_Bd')
         .setText('/' + maxIngredientCount)
         .setOrigin(0.5)
         .setPosition(
            this.currentFoundIngredientCountText.x + (maxIngredientCount <= 9 ? 15 : 20),
            this.currentFoundIngredientCountText.y
         )
         .setStyle({ fill: '#A7A7A7', fontSize: 25 })
         .setDepth(4)
   }

   private hideIngredientCountTexts(): void {
      this.currentFoundIngredientCountText.setActive(false)
      this.currentFoundIngredientCountText.setVisible(false)
      this.maxIngredientCountText.setActive(false)
      this.maxIngredientCountText.setVisible(false)
   }

   public doInit(): void {
      this.townBuildingPod = PodProvider.instance.townbuildingPod
      this.townDayNightPod = PodProvider.instance.townDayNightPod
      this.setupSubscribe()
      this.getIngredientBeansAndSetupUI(this.townDayNightPod.townTimeState.value)
      this.setupFoundIngredientCountTexts()
   }
}
