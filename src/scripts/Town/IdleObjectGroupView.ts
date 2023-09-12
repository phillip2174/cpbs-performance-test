import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { BillboardObjectView } from './BillboardObjectView'
import { BillboardSizeType } from './Type/BillboardSizeType'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { ObjectPlacementDebugger } from '../plugins/ObjectPlacementDebugger'

export class IdleObjectGroupView extends GameObjects.GameObject {
   public static readonly SPINE_PATH: string = `assets/spines/`
   private cloudBigImage: GameObjects.Image
   private cloudSmallImage: GameObjects.Image
   private cloudNarutoImage: GameObjects.Image
   private bigBillboard: BillboardObjectView
   private mediumBillboard: BillboardObjectView
   private smallBillboard: BillboardObjectView
   private burgerShrimp: SpineGameObject
   private bushes: SpineGameObject
   private personMascot2ndFloor: SpineGameObject
   private dog7_11: SpineGameObject
   private clown: SpineGameObject
   private peopleGroupA: SpineGameObject
   private peopleGroupC: SpineGameObject
   private peopleGroupD: SpineGameObject

   constructor(scene: Scene) {
      super(scene, 'gameObject')
      GameObjectConstructor(scene, this)
   }

   public doInit() {
      console.log('Create idle Object')
      this.createIdleObject()
   }

   public createIdleObject() {
      this.cloudBigImage = this.scene.add
         .image(this.scene.cameras.main.centerX + 810, this.scene.cameras.main.centerY - 340, 'cloud-01')
         .setDepth(99)

      this.cloudSmallImage = this.scene.add
         .image(this.scene.cameras.main.centerX + 480, this.scene.cameras.main.centerY - 495, 'cloud-02')
         .setDepth(99)

      this.cloudNarutoImage = this.scene.add
         .image(this.scene.cameras.main.centerX - 910, this.scene.cameras.main.centerY - 315, 'cloud-naruto')
         .setDepth(99)

      this.scene.add.tween({
         targets: this.cloudBigImage,
         ease: 'Cubic.easeInOut',
         yoyo: true,
         loop: -1,
         delay: this.randomIntFromInterval(1000, 3000),
         repeatDelay: this.randomIntFromInterval(600, 1500),
         duration: 2000,
         props: {
            x: { from: this.cloudBigImage.x, to: this.cloudBigImage.x - 15 },
         },
         onComplete: (x) => {},
      })

      this.scene.add.tween({
         targets: this.cloudSmallImage,
         ease: 'Cubic.easeInOut',
         yoyo: true,
         loop: -1,
         delay: this.randomIntFromInterval(1000, 3000),
         repeatDelay: this.randomIntFromInterval(600, 1500),
         duration: 2000,
         props: {
            x: { from: this.cloudSmallImage.x, to: this.cloudSmallImage.x - 15 },
         },
         onComplete: (x) => {},
      })

      this.scene.add.tween({
         targets: this.cloudNarutoImage,
         ease: 'Cubic.easeInOut',
         yoyo: true,
         loop: -1,
         delay: this.randomIntFromInterval(1000, 3000),
         repeatDelay: this.randomIntFromInterval(600, 1500),
         duration: 2000,
         props: {
            x: { from: this.cloudNarutoImage.x, to: this.cloudNarutoImage.x - 15 },
         },
         onComplete: (x) => {},
      })

      this.setupBillboards()
      this.setupIdleSpineObjects()
   }

   private setupBillboards(): void {
      this.bigBillboard = new BillboardObjectView(this.scene)
      this.bigBillboard.doInit(
         this.scene.cameras.main.centerX + 181,
         this.scene.cameras.main.centerY + 61,
         BillboardSizeType.Big
      )

      this.mediumBillboard = new BillboardObjectView(this.scene)
      this.mediumBillboard.doInit(
         this.scene.cameras.main.centerX + 668,
         this.scene.cameras.main.centerY + 313,
         BillboardSizeType.Medium,
         2000,
         1000
      )

      this.smallBillboard = new BillboardObjectView(this.scene)
      this.smallBillboard.doInit(
         this.scene.cameras.main.centerX - 468.5,
         this.scene.cameras.main.centerY + 402,
         BillboardSizeType.Small,
         1500,
         500
      )
   }

   private setupIdleSpineObjects(): void {
      //let test = new ObjectPlacementDebugger(this.scene)
      let burgerShrimpConfig = {
         x: this.scene.cameras.main.centerX + 289,
         y: this.scene.cameras.main.centerY - 214,
         key: 'burger-shrimp',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, burgerShrimpConfig).subscribe((spine) => {
         this.burgerShrimp = spine
         this.burgerShrimp.setDepth(5)
      })

      let bushesConfig = {
         x: this.scene.cameras.main.centerX + 352,
         y: this.scene.cameras.main.centerY - 116,
         key: 'bushes',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'animation',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, bushesConfig).subscribe((spine) => {
         this.bushes = spine
         this.bushes.setDepth(3)
      })

      let personMascotConfig = {
         x: this.scene.cameras.main.centerX + 433,
         y: this.scene.cameras.main.centerY + 275,
         key: 'person-mascot-2nd-floor',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, personMascotConfig).subscribe((spine) => {
         this.personMascot2ndFloor = spine
         this.personMascot2ndFloor.setDepth(3)
      })

      let dog7_11Config = {
         x: this.scene.cameras.main.centerX + 491,
         y: this.scene.cameras.main.centerY + 540,
         key: '7-11-dog',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'animation',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, dog7_11Config).subscribe((spine) => {
         this.dog7_11 = spine
         this.dog7_11.setDepth(3)
      })

      let clownConfig = {
         x: this.scene.cameras.main.centerX + 392,
         y: this.scene.cameras.main.centerY + 589,
         key: 'clown',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, clownConfig).subscribe((spine) => {
         this.clown = spine
         this.clown.setDepth(3)
      })

      let peopleGroupAConfig = {
         x: this.scene.cameras.main.centerX + 700,
         y: this.scene.cameras.main.centerY + 612,
         key: 'people-group-a',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, peopleGroupAConfig).subscribe((spine) => {
         this.peopleGroupA = spine
         this.peopleGroupA.setDepth(3)
      })

      let peopleGroupCConfig = {
         x: this.scene.cameras.main.centerX + 23,
         y: this.scene.cameras.main.centerY + 968,
         key: 'people-group-c',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, peopleGroupCConfig).subscribe((spine) => {
         this.peopleGroupC = spine
         this.peopleGroupC.setDepth(3)
      })

      let peopleGroupDConfig = {
         x: this.scene.cameras.main.centerX - 528,
         y: this.scene.cameras.main.centerY + 694,
         key: 'people-group-d',
         path: IdleObjectGroupView.SPINE_PATH,
         startAnimation: 'idle',
         isLooping: true,
      }

      ResourceManager.instance.loadSpine(this.scene, peopleGroupDConfig).subscribe((spine) => {
         this.peopleGroupD = spine
         this.peopleGroupD.setDepth(3)
      })
   }

   private randomIntFromInterval(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
   }
}
