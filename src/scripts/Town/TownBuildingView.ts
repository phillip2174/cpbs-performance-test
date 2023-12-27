import { GameObjects, Input, Scene } from 'phaser'
import { Observable, concatMap, delay, forkJoin, map, of, tap } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { IdleObjectGroupView } from './IdleObjectGroupView'
import { IngredientObjectManager } from './IngredientObjectManager'
import { IngredientObjectView } from './IngredientObjectView'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { TrainObjectWithIngredientView } from './TrainObjectWithIngredientView'
import { TownTimeState } from './Type/TownTimeState'
import { APILoadingManager } from '../api-loading/APILoadingManager'
import { CameraControlPod } from '../camera/CameraControlPod'
import { ObjectDepthConfig } from '../ObjectDepthConfig'

export class TownBuildingView extends GameObjects.GameObject {
    private rangeMapRectangleBackground: GameObjects.Rectangle
    private townBackgroundImage: GameObjects.Image
    private townGroundImage: GameObjects.Image
    private fenceImage: GameObjects.Image
    private buildingImage: GameObjects.Image
    private buildingRoofImage: GameObjects.Image
    private trainTrailImage: GameObjects.Image

    private mockingTown: GameObjects.Image

    private keyT: Input.Keyboard.Key
    private townDayNightPod: TownDayNightPod
    private townBuildingPod: TownBuildingPod
    private ingredientObjectManager: IngredientObjectManager
    private cameraPod: CameraControlPod

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.ingredientObjectManager = IngredientObjectManager.instance
        this.cameraPod = PodProvider.instance.cameraControlPod

        this.ingredientObjectManager.clearIngredientRandomPoolList()
        this.keyT = this.scene.input.keyboard.addKey('T')

        let observableInit: Observable<any>[] = []
        observableInit.push(this.townBuildingPod.getUserIngredientData())
        observableInit.push(this.townBuildingPod.getCurrentHiddenIngredientData())
        observableInit.push(this.townBuildingPod.getIngredientObjectsDataPosition())
        observableInit.push(this.townBuildingPod.getInteractableObjectsDataPosition())
        observableInit.push(this.townBuildingPod.getNextHiddenIngredientData())

        forkJoin(observableInit).subscribe(() => {
            // if (GameConfig.DEBUG_OBJECT) {
            //     this.mockingTown = this.scene.add
            //         .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'mock-cp-town')
            //         .setDepth(99)
            //         .setAlpha(0.5)
            // }

            this.createBackgroundAndGround()

            this.cameraPod.setCameraBound(
                this.rangeMapRectangleBackground.getTopLeft().x,
                this.rangeMapRectangleBackground.getTopLeft().y,
                this.rangeMapRectangleBackground.width,
                this.rangeMapRectangleBackground.height
            )

            let idleObjectGroupView = new IdleObjectGroupView(this.scene)
            idleObjectGroupView.doInit()

            this.townBuildingPod.interactableObjects.forEach((object) => {
                let objectView: IngredientObjectView = new IngredientObjectView(this.scene, object)
                objectView.setPositionContainer()
                objectView.doInit()
            })

            let trainIngredientObject = new IngredientObjectView(
                this.scene,
                this.townBuildingPod.ingredientObjects[this.townBuildingPod.ingredientObjects.length - 1],
                true
            )
            trainIngredientObject.doInit()
            this.ingredientObjectManager.addIngredientObjectToRandomPool(trainIngredientObject)

            let trainObject = new TrainObjectWithIngredientView(
                this.scene,
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY
            )
            trainObject.doInit(trainIngredientObject)

            this.townBuildingPod.ingredientObjects
                .slice(0, this.townBuildingPod.ingredientObjects.length - 1)
                .forEach((object) => {
                    let objectView: IngredientObjectView = new IngredientObjectView(this.scene, object, true)
                    objectView.setPositionContainer()
                    objectView.doInit()
                    this.ingredientObjectManager.addIngredientObjectToRandomPool(objectView)
                })

            if (PodProvider.instance.tutorialManager.isCompletedTutorial()) {
                IngredientObjectManager.instance.randomIngredientIdToIngredientObject(
                    this.townBuildingPod.getIngredientBeanNotFoundWithUser()
                )
            } else {
                IngredientObjectManager.instance.setIngredientObjectTutorial(
                    this.townBuildingPod.currentHiddenIngredientBeans,
                    this.townBuildingPod.getIngredientBeanNotFoundWithUser()
                )
            }

            this.townBuildingPod.setFirstLoad()
            this.cameraPod.setInteractCamera(true)
            APILoadingManager.instance.hideSceneLoading()
        })
    }

    public createBackgroundAndGround() {
        this.rangeMapRectangleBackground = this.scene.add
            .rectangle(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY + 125, 3840, 2467, 0xffffff)
            .setDepth(ObjectDepthConfig.RANGE_MAP)

        this.townBackgroundImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'city-bg')
            .setScale(1)
            .setDepth(ObjectDepthConfig.CITY_BACKGROUND)
        // .setTint(0x63668f)

        this.townGroundImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'city-floor-day')
            .setScale(1)
            .setDepth(ObjectDepthConfig.CITY_FLOOR)
        // .setTint(0xb8bacc)

        this.fenceImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'fence-day')
            .setScale(1)
            .setDepth(ObjectDepthConfig.FENCE)

        this.buildingImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'city-building')
            .setScale(1)
            .setDepth(ObjectDepthConfig.CITY_BUILDING)

        this.buildingRoofImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'city-building-roof')
            .setDepth(ObjectDepthConfig.CITY_BUILDING_ROOF)

        this.trainTrailImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'train-rail')
            .setDepth(ObjectDepthConfig.TRIAL_RAIL)

        this.onTownTimeStateNight()
    }

    private onTownTimeStateNight() {
        if (this.townDayNightPod.townTimeState.value == TownTimeState.Night) {
            this.rangeMapRectangleBackground.setFillStyle(0x63668f)
            this.townBackgroundImage.setTint(0x63668f)
            this.fenceImage.setTexture('fence-night')
            this.townGroundImage.setTexture('city-floor-night')
        }
    }

    public update(): void {
        if (Input.Keyboard.JustDown(this.keyT))
            if (this.townDayNightPod.townTimeState.value == TownTimeState.Day) {
                this.townDayNightPod.setTownTimeState(TownTimeState.Night)
                this.onTownTimeStateNight()
            } else {
                this.townDayNightPod.setTownTimeState(TownTimeState.Day)
                this.rangeMapRectangleBackground.setFillStyle(0xffffff)
                this.townBackgroundImage.clearTint()
                this.fenceImage.setTexture('fence-day')
                this.townGroundImage.setTexture('city-floor-day')
            }
    }
}
