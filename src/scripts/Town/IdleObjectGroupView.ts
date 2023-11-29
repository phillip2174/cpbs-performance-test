import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { BillboardObjectView } from './BillboardObjectView'
import { BillboardSizeType } from './Type/BillboardSizeType'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { ObjectPlacementDebugger } from '../plugins/ObjectPlacementDebugger'
import { Observable, tap } from 'rxjs'
import { Billboard3DObjectView } from './Billboard3D/Billboard3DObjectView'

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

        this.peopleGroupE = this.scene.add
            .image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'people-group-e')
            .setDepth(99)

        this.nongsomSprite = this.scene.add
            .sprite(this.scene.cameras.main.centerX - 342, this.scene.cameras.main.centerY - 141, 'nong-som')
            .setDepth(99)
        this.nongsomSprite.play('idle-nong-som')

        this.cheeseImage = this.scene.add
            .image(this.scene.cameras.main.centerX - 160, this.scene.cameras.main.centerY + 150, 'cheese')
            .setDepth(4)

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
            .setDepth(9)

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
            .setDepth(7)

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
            .setDepth(6)

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
            .setDepth(7)

        let clownConfig = {
            x: this.scene.cameras.main.centerX + 392,
            y: this.scene.cameras.main.centerY + 589,
            key: 'clown',
            startAnimation: 'idle',
            isLooping: true,
        }

        this.clown = this.scene.add
            .spine(clownConfig.x, clownConfig.y, clownConfig.key, clownConfig.startAnimation, clownConfig.isLooping)
            .setDepth(7)

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
            .setDepth(3)

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
            .setDepth(8)

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
            .setDepth(3)

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
            .setDepth(5)

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
            .setDepth(5)

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
            .setDepth(5)
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
