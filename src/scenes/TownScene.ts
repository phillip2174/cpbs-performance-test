import { Scene } from 'phaser'
import { TownBuildingView } from '../scripts/Town/TownBuildingView'
import { CameraControlView } from '../scripts/camera/CameraControlView'
import { TownDayNightView } from './../scripts/Town/TownDayNightView'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { AnimationController } from '../scripts/Town/AnimationController'
import { APILoadingManager } from '../scripts/api-loading/APILoadingManager'
import { SceneState } from './SceneState'
import { TutorialManager } from '../scripts/Manager/TutorialManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { GameConfig } from '../scripts/GameConfig'
import { TutorialHintView } from '../Tutorial/TutorialHintView'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'
import { UIDepthConfig } from '../scripts/UIDepthConfig'

export class TownScene extends Scene {
    private townBuildingView: TownBuildingView
    private cameraControlView: CameraControlView
    private townDayNightView: TownDayNightView

    private hintTutorialTownBuildingView: TutorialHintView

    private tutorialManager: TutorialManager

    constructor() {
        super({
            key: 'TownScene',
        })
    }

    preload(): void {
        console.log('start TownScene')
        ResourceManager.instance.setResourceLoaderScene(this)
        AnimationController.instance.createSpriteSheetAnimation(this)
        DeviceChecker.instance.doInit(this)

        this.tutorialManager = PodProvider.instance.tutorialManager
    }

    create() {
        this.cameraControlView = new CameraControlView(this)
        this.cameraControlView.doInit()

        this.townBuildingView = new TownBuildingView(this)
        this.townBuildingView.doInit()

        this.townDayNightView = new TownDayNightView(this)
        this.townDayNightView.doInit()

        if (!this.tutorialManager.tutorialSaveBean.isCompletedTutorial && GameConfig.IS_START_WITH_TUTORIAL) {
            this.hintTutorialTownBuildingView = new TutorialHintView(this).setDepth(UIDepthConfig.TUTORIAL_HINT)
            this.hintTutorialTownBuildingView.doInit()
        }
    }

    update() {
        this.cameraControlView.update()
        this.townBuildingView.update()
    }
}
