import { GameObjects, Input, Scene } from 'phaser'
import { Observable, concatMap, forkJoin, tap } from 'rxjs'
import { GameConfig } from '../GameConfig'
import { IngredientBean } from '../Guideline/IngredientBean'
import { CameraControlView } from '../camera/CameraControlView'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../pod/PodProvider'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { IdleObjectGroupView } from './IdleObjectGroupView'
import { IngredientObjectView } from './IngredientObjectView'
import { TownBuildingPod } from './Pod/TownBuildingPod'
import { TownTimeState } from './Type/TownTimeState'
import { IngredientObjectManager } from './IngredientObjectManager'
import { TrainObjectWithIngredientView } from './TrainObjectWithIngredientView'
import { BillboardObjectView } from './BillboardObjectView'
import { BillboardSizeType } from './Type/BillboardSizeType'

export class TownBuildingView extends GameObjects.GameObject {
    private rangeMapRectangleBackground: GameObjects.Rectangle
    private townBackgroundImage: GameObjects.Image
    private townGroundImage: GameObjects.Image
    private buildingImage: GameObjects.Image
    private trainTrailImage: GameObjects.Image
    private bigBillboard: BillboardObjectView
    private mediumBillboard: BillboardObjectView
    private smallBillboard: BillboardObjectView

    private mockingTown: GameObjects.Image

    private keyT: Input.Keyboard.Key
    private townDayNightPod: TownDayNightPod
    private townBuildingPod: TownBuildingPod
    private ingredientObjectManager: IngredientObjectManager

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit(camera: CameraControlView) {
        this.townBuildingPod = PodProvider.instance.townbuildingPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.ingredientObjectManager = IngredientObjectManager.instance

        this.keyT = this.scene.input.keyboard.addKey('T')

        this.townBuildingPod
            .getIngredientBeansData(this.townDayNightPod.townTimeState.value)
            .pipe(
                tap((x) => console.log(`(1) getGuideLineUICellBeans : ` + x.length)),
                concatMap((_) => this.townBuildingPod.getIngredientObjects()),
                concatMap((_) => this.townBuildingPod.getInteractableObjects()),
                tap((_) => {
                    if (GameConfig.DEBUG_OBJECT) {
                        // this.mockingTown = this.scene.add
                        //     .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'mock-cp-town')
                        //     .setDepth(99)
                        //     .setAlpha(0.2)
                    }

                    this.createBackgroundAndGround()

                    camera.setCameraBound(
                        this.rangeMapRectangleBackground.getTopLeft(),
                        this.rangeMapRectangleBackground.width,
                        this.rangeMapRectangleBackground.height
                    )

                    let idleObjectGroupView = new IdleObjectGroupView(this.scene)
                    idleObjectGroupView.doInit()

                    let observableInit: Observable<any>[] = []

                    this.townBuildingPod.interactableObjects.forEach((object) => {
                        let objectView: IngredientObjectView = new IngredientObjectView(this.scene, object)
                        objectView.setPositionContainer()
                        observableInit.push(objectView.doInit())
                    })

                    let trainObject = new TrainObjectWithIngredientView(
                        this.scene,
                        this.scene.cameras.main.centerX,
                        this.scene.cameras.main.centerY
                    )

                    let trainIngredientObject = new IngredientObjectView(
                        this.scene,
                        this.townBuildingPod.ingredientObjects[this.townBuildingPod.ingredientObjects.length - 1],
                        true
                    )
                    observableInit.push(
                        trainIngredientObject.doInit().pipe(
                            tap((_) => {
                                this.ingredientObjectManager.addIngredientObjectGroup(trainIngredientObject)
                            })
                        )
                    )
                    observableInit.push(trainObject.doInit(trainIngredientObject))

                    this.townBuildingPod.ingredientObjects
                        .slice(0, this.townBuildingPod.ingredientObjects.length - 1)
                        .forEach((object) => {
                            let objectView: IngredientObjectView = new IngredientObjectView(this.scene, object, true)
                            objectView.setPositionContainer()
                            observableInit.push(
                                objectView.doInit().pipe(
                                    tap((_) => {
                                        this.ingredientObjectManager.addIngredientObjectGroup(objectView)
                                    })
                                )
                            )
                        })

                    forkJoin(observableInit).subscribe(() => {
                        IngredientObjectManager.instance.randomIngredientIdToIngredientObject(
                            this.townBuildingPod.ingredientBeans
                        )
                    })

                    this.scene.scene.launch('CityUIScene', { cameraControlView: camera })
                })
            )
            .subscribe()

        this.bigBillboard = new BillboardObjectView(this.scene)
        this.bigBillboard.doInit(
            this.scene.cameras.main.centerX + 165,
            this.scene.cameras.main.centerY - 70.5,
            BillboardSizeType.Big
        )

        this.mediumBillboard = new BillboardObjectView(this.scene)
        this.mediumBillboard.doInit(
            this.scene.cameras.main.centerX + 652,
            this.scene.cameras.main.centerY + 180,
            BillboardSizeType.Medium,
            2000,
            1000
        )

        this.smallBillboard = new BillboardObjectView(this.scene)
        this.smallBillboard.doInit(
            this.scene.cameras.main.centerX - 485,
            this.scene.cameras.main.centerY + 269,
            BillboardSizeType.Small,
            1500,
            500
        )
    }

    public createBackgroundAndGround() {
        this.rangeMapRectangleBackground = this.scene.add
            .rectangle(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 3840, 2160, 0xffffff)
            .setDepth(-2)

        this.townBackgroundImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'bg-town')
            .setScale(1)
            .setDepth(0)
        // .setTint(0x63668f)

        this.townGroundImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'ground-town')
            .setScale(1)
            .setDepth(1)
        // .setTint(0xb8bacc)

        this.buildingImage = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'city-building')
            .setScale(1)
            .setDepth(3)

        this.trainTrailImage = this.scene.add
            .image(this.scene.cameras.main.centerX - 400, this.scene.cameras.main.centerY - 580, 'train-rail')
            .setDepth(3)

        this.onTownTimeStateNight()
    }

    private onTownTimeStateNight() {
        if (this.townDayNightPod.townTimeState.value == TownTimeState.Night) {
            this.townBackgroundImage.setTint(0x63668f)
            this.townGroundImage.setTint(0xb8bacc)
        }
    }

    public update(): void {
        if (Input.Keyboard.JustDown(this.keyT))
            if (this.townDayNightPod.townTimeState.value == TownTimeState.Day) {
                this.townDayNightPod.setTownTimeState(TownTimeState.Night)
                this.onTownTimeStateNight()
            } else {
                this.townDayNightPod.setTownTimeState(TownTimeState.Day)
                this.townBackgroundImage.clearTint()
                this.townGroundImage.clearTint()
            }
    }
}
