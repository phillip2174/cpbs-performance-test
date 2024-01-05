import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { BillboardObjectView } from './BillboardObjectView'
import { BillboardSizeType } from './Type/BillboardSizeType'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { ObjectPlacementDebugger } from '../plugins/ObjectPlacementDebugger'
import { Observable, Subscription, tap, timer } from 'rxjs'
import { Billboard3DObjectView } from './Billboard3D/Billboard3DObjectView'
import { TownUIPod } from './Pod/TownUIPod'
import { PodProvider } from '../pod/PodProvider'
import { TownUIState } from './Type/TownUIState'
import { ObjectDepthConfig } from '../ObjectDepthConfig'

export class IdleObjectGroupView extends GameObjects.GameObject {
    private cloudBigImage: GameObjects.Image
    private cloudSmallImage: GameObjects.Image
    private cloudNarutoImage: GameObjects.Image
    private cheeseImage: GameObjects.Image
    private peopleGroupE: GameObjects.Image
    private nongsomSprite: GameObjects.Sprite

    private bigBillboard: BillboardObjectView
    private mediumBillboard: BillboardObjectView
    private smallBillboard: BillboardObjectView

    private billboard3DObjectView: Billboard3DObjectView

    private burgerShrimp: SpineGameObject
    private bushes: SpineGameObject
    private personMascot2ndFloor: SpineGameObject
    private dog7_11: SpineGameObject
    private clown: SpineGameObject
    private peopleGroupA: SpineGameObject
    private peopleGroupC: SpineGameObject
    private peopleGroupD: SpineGameObject
    private peopleGroupF: SpineGameObject
    private hotdogShop: SpineGameObject
    private vegetableLotus: SpineGameObject

    private townUIPod: TownUIPod
    private stateSubscription: Subscription
    private delaySetActiveSubscription: Subscription

    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    public doInit() {
        console.log('Create idle Object')
        this.townUIPod = PodProvider.instance.townUIPod
        this.createIdleObject()

        this.stateSubscription = this.townUIPod.townUIState.subscribe((state) => {
            const validStates: TownUIState[] = [
                TownUIState.MainMenu,
                TownUIState.Settings,
                TownUIState.DailyLogin,
                TownUIState.CompleteIngredients,
                TownUIState.NextIngredients,
                TownUIState.UserProfile,
            ]

            if (validStates.includes(state)) {
                this.delaySetActiveSubscription?.unsubscribe()
                this.handleObjectSpine(true)
            } else {
                this.delaySetActiveSubscription = timer(200).subscribe((_) => {
                    this.handleObjectSpine(false)
                })
            }
        })

        this.on('destroy', () => {
            this.stateSubscription?.unsubscribe()
            this.delaySetActiveSubscription?.unsubscribe()
        })
    }

    public createIdleObject() {
        this.cloudBigImage = this.scene.add
            .image(this.scene.cameras.main.centerX + 810, this.scene.cameras.main.centerY - 340, 'cloud-01')
            .setDepth(ObjectDepthConfig.CLOUD)

        this.cloudSmallImage = this.scene.add
            .image(this.scene.cameras.main.centerX + 480, this.scene.cameras.main.centerY - 495, 'cloud-02')
            .setDepth(ObjectDepthConfig.CLOUD)

        this.cloudNarutoImage = this.scene.add
            .image(this.scene.cameras.main.centerX - 910, this.scene.cameras.main.centerY - 315, 'cloud-naruto')
            .setDepth(ObjectDepthConfig.CLOUD)

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

        this.peopleGroupE = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'people-group-e')
            .setDepth(ObjectDepthConfig.PEOPLE_GROUP_E)

        this.nongsomSprite = this.scene.add
            .sprite(this.scene.cameras.main.centerX - 342, this.scene.cameras.main.centerY - 141, 'nong-som')
            .setDepth(ObjectDepthConfig.NONG_SOM)
        this.nongsomSprite.play('idle-nong-som')

        this.cheeseImage = this.scene.add
            .image(this.scene.cameras.main.centerX - 160, this.scene.cameras.main.centerY + 150, 'cheese')
            .setDepth(ObjectDepthConfig.CHEESE)

        this.setupBillboards()
        this.setupBillboard3D()
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
            BillboardSizeType.Medium
        )

        this.smallBillboard = new BillboardObjectView(this.scene)
        this.smallBillboard.doInit(
            this.scene.cameras.main.centerX - 468.5,
            this.scene.cameras.main.centerY + 402,
            BillboardSizeType.Small,
            2500,
            800
        )
    }

    private setupBillboard3D() {
        this.billboard3DObjectView = new Billboard3DObjectView(this.scene)
        this.billboard3DObjectView.doInit()
    }

    private setupIdleSpineObjects(): void {
        //let test = new ObjectPlacementDebugger(this.scene)
        let burgerShrimpConfig = {
            x: this.scene.cameras.main.centerX + 289,
            y: this.scene.cameras.main.centerY - 214,
            key: 'burger-shrimp',
            startAnimation: 'idle',
            isLooping: true,
        }
        this.burgerShrimp = this.scene.add
            .spine(
                burgerShrimpConfig.x,
                burgerShrimpConfig.y,
                burgerShrimpConfig.key,
                burgerShrimpConfig.startAnimation,
                burgerShrimpConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.BURGER_SHRIMP)

        let bushesConfig = {
            x: this.scene.cameras.main.centerX + 352,
            y: this.scene.cameras.main.centerY - 116,
            key: 'bushes',
            startAnimation: 'animation',
            isLooping: true,
        }

        this.bushes = this.scene.add
            .spine(
                bushesConfig.x,
                bushesConfig.y,
                bushesConfig.key,
                bushesConfig.startAnimation,
                bushesConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.BUSHES)

        let personMascotConfig = {
            x: this.scene.cameras.main.centerX + 433,
            y: this.scene.cameras.main.centerY + 275,
            key: 'person-mascot-2nd-floor',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.personMascot2ndFloor = this.scene.add
            .spine(
                personMascotConfig.x,
                personMascotConfig.y,
                personMascotConfig.key,
                personMascotConfig.startAnimation,
                personMascotConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.PERSON_WITH_MASCOT)

        let dog7_11Config = {
            x: this.scene.cameras.main.centerX + 491,
            y: this.scene.cameras.main.centerY + 540,
            key: '7-11-dog',
            startAnimation: 'animation',
            isLooping: true,
        }

        this.dog7_11 = this.scene.add
            .spine(
                dog7_11Config.x,
                dog7_11Config.y,
                dog7_11Config.key,
                dog7_11Config.startAnimation,
                dog7_11Config.isLooping
            )
            .setDepth(ObjectDepthConfig.DOG_7_11)

        let clownConfig = {
            x: this.scene.cameras.main.centerX + 392,
            y: this.scene.cameras.main.centerY + 589,
            key: 'clown',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.clown = this.scene.add
            .spine(clownConfig.x, clownConfig.y, clownConfig.key, clownConfig.startAnimation, clownConfig.isLooping)
            .setDepth(ObjectDepthConfig.CLOWN)

        let peopleGroupAConfig = {
            x: this.scene.cameras.main.centerX + 700,
            y: this.scene.cameras.main.centerY + 612,
            key: 'people-group-a',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.peopleGroupA = this.scene.add
            .spine(
                peopleGroupAConfig.x,
                peopleGroupAConfig.y,
                peopleGroupAConfig.key,
                peopleGroupAConfig.startAnimation,
                peopleGroupAConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.PEOPLE_GROUP_A)

        let peopleGroupCConfig = {
            x: this.scene.cameras.main.centerX + 23,
            y: this.scene.cameras.main.centerY + 968,
            key: 'people-group-c',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.peopleGroupC = this.scene.add
            .spine(
                peopleGroupCConfig.x,
                peopleGroupCConfig.y,
                peopleGroupCConfig.key,
                peopleGroupCConfig.startAnimation,
                peopleGroupCConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.PEOPLE_GROUP_C)

        let peopleGroupDConfig = {
            x: this.scene.cameras.main.centerX - 528,
            y: this.scene.cameras.main.centerY + 694,
            key: 'people-group-d',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.peopleGroupD = this.scene.add
            .spine(
                peopleGroupDConfig.x,
                peopleGroupDConfig.y,
                peopleGroupDConfig.key,
                peopleGroupDConfig.startAnimation,
                peopleGroupDConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.PEOPLE_GROUP_D)

        let hotdogShopConfig = {
            x: this.scene.cameras.main.centerX - 917.5,
            y: this.scene.cameras.main.centerY + 691.5,
            key: 'hotdog-shop',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.hotdogShop = this.scene.add
            .spine(
                hotdogShopConfig.x,
                hotdogShopConfig.y,
                hotdogShopConfig.key,
                hotdogShopConfig.startAnimation,
                hotdogShopConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.HOTDOG_SHOP)

        let vegetableLotusConfig = {
            x: this.scene.cameras.main.centerX - 553,
            y: this.scene.cameras.main.centerY + 230,
            key: 'vegetable-lotus',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.vegetableLotus = this.scene.add
            .spine(
                vegetableLotusConfig.x,
                vegetableLotusConfig.y,
                vegetableLotusConfig.key,
                vegetableLotusConfig.startAnimation,
                vegetableLotusConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.VEGETABLE_LOTUS)

        let peopleGroupFConfig = {
            x: this.scene.cameras.main.centerX - 230,
            y: this.scene.cameras.main.centerY + 454,
            key: 'people-group-f',
            startAnimation: 'animation',
            isLooping: true,
        }

        this.peopleGroupF = this.scene.add
            .spine(
                peopleGroupFConfig.x,
                peopleGroupFConfig.y,
                peopleGroupFConfig.key,
                peopleGroupFConfig.startAnimation,
                peopleGroupFConfig.isLooping
            )
            .setDepth(ObjectDepthConfig.PEOPLE_GROUP_F)
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    private handleObjectSpine(isActive: boolean) {
        const timeScaleSpine = isActive ? 1 : 0

        this.burgerShrimp.timeScale = timeScaleSpine
        this.bushes.timeScale = timeScaleSpine
        this.personMascot2ndFloor.timeScale = timeScaleSpine
        this.dog7_11.timeScale = timeScaleSpine
        this.clown.timeScale = timeScaleSpine
        this.peopleGroupA.timeScale = timeScaleSpine
        this.peopleGroupC.timeScale = timeScaleSpine
        this.peopleGroupD.timeScale = timeScaleSpine
        this.peopleGroupF.timeScale = timeScaleSpine
        this.hotdogShop.timeScale = timeScaleSpine
        this.vegetableLotus.timeScale = timeScaleSpine

        this.burgerShrimp.setVisible(isActive)
        this.bushes.setVisible(isActive)
        this.personMascot2ndFloor.setVisible(isActive)
        this.dog7_11.setVisible(isActive)
        this.clown.setVisible(isActive)
        this.peopleGroupA.setVisible(isActive)
        this.peopleGroupC.setVisible(isActive)
        this.peopleGroupD.setVisible(isActive)
        this.peopleGroupF.setVisible(isActive)
        this.hotdogShop.setVisible(isActive)
        this.vegetableLotus.setVisible(isActive)
    }
}
