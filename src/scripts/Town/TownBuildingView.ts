import { GameObjects, Scene, Input } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { UIUtil } from '../plugins/utils/UIUtil'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { PodProvider } from '../pod/PodProvider'
import { InteractableObjectView } from './InteractableObjectView'
import { TownTimeState } from './TownTimeState'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { concatMap, concatWith, map, tap } from 'rxjs'
import { CityUIScene } from '../../scenes/CityUIScene'
import { InteractableObjectBean } from './InteractableObjectBean'
import { CameraControlView } from '../camera/CameraControlView'

export class TownBuildingView extends GameObjects.GameObject {
   private mockingTown: GameObjects.Image
   private keyT: Input.Keyboard.Key
   private townDayNightPod: TownDayNightPod
   private townBuildingPod: TownBuildingPod

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   public doInit(camera: CameraControlView) {
      this.townBuildingPod = PodProvider.instance.townbuildingPod
      this.townDayNightPod = PodProvider.instance.townDayNightPod

      this.keyT = this.scene.input.keyboard.addKey('T')

      this.townBuildingPod
         .getIngredientBeansData(this.townDayNightPod.townTimeState.value)
         .pipe(
            tap((x) => console.log(`(1) getGuideLineUICellBeans : ` + x.length)),
            concatMap((_) => this.townBuildingPod.getInteractableObjects()),
            tap((x) => {
               this.mockingTown = this.scene.add
                  .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'mock-cp-town')
                  .setDepth(0)

               let objectViewGroup: InteractableObjectView[] = []
               x.forEach((object) => {
                  let objectView: InteractableObjectView = new InteractableObjectView(this.scene, object)
                  objectView.doInit()
                  objectViewGroup.push(objectView)
               })
               this.randomSetFoundIngredientObject(objectViewGroup)
               this.scene.scene.launch('CityUIScene', { cameraControlView: camera })
            })
         )
         .subscribe()
   }

   private randomSetFoundIngredientObject(interactableObjectGroup: InteractableObjectView[]) {
      console.log(` (###) interactableGroup Count : ` + interactableObjectGroup.length)
      console.log(` (###) guideLineBeans Count : ` + this.townBuildingPod.ingredientBeans.length)

      let cloneInteractableGroup: InteractableObjectView[]
      cloneInteractableGroup = Object.assign([], interactableObjectGroup)
      console.log(` (###) clone interactableGroup Count : ` + interactableObjectGroup.length)

      for (let i = 0; i < this.townBuildingPod.ingredientBeans.length; i++) {
         let randomIndex = Math.floor(Math.random() * cloneInteractableGroup.length)
         let randomResult = cloneInteractableGroup[randomIndex]
         cloneInteractableGroup.splice(randomIndex, 1)
         randomResult.setFoundIngredient(true)

         if (cloneInteractableGroup.length == 0) {
            console.log(`break`)
            break
         }

         console.log(` (###) clone interactableGroup left : ` + cloneInteractableGroup.length)
      }
   }

   public update(): void {
      if (Input.Keyboard.JustDown(this.keyT))
         if (this.townDayNightPod.townTimeState.value == TownTimeState.Day)
            this.townDayNightPod.setTownTimeState(TownTimeState.Night)
         else this.townDayNightPod.setTownTimeState(TownTimeState.Day)
   }
}
