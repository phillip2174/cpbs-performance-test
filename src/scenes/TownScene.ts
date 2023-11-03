import { Scene } from 'phaser'
import { TownBuildingView } from '../scripts/Town/TownBuildingView'
import { CameraControlView } from '../scripts/camera/CameraControlView'
import { TownDayNightView } from './../scripts/Town/TownDayNightView'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { AnimationController } from '../scripts/Town/AnimationController'

export class TownScene extends Scene {
    private townBuildingView: TownBuildingView
    private cameraControlView: CameraControlView
    private townDayNightView: TownDayNightView

    constructor() {
        super({
            key: 'TownScene',
        })
    }

    preload(): void {
        console.log('start TownScene')
        ResourceManager.instance.setResourceLoaderScene(this)
        AnimationController.instance.createSpriteSheetAnimation(this)

        this.cameraControlView = new CameraControlView(this)
        this.cameraControlView.doInit()

        this.scene.launch('CityUIScene')

        this.townBuildingView = new TownBuildingView(this)
        this.townBuildingView.doInit()

        this.townDayNightView = new TownDayNightView(this)
        this.townDayNightView.doInit()
    }

    update() {
        this.townBuildingView.update()
    }
}
