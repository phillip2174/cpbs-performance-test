import { GameObjects, Scene } from 'phaser'
import { Observable, forkJoin } from 'rxjs'
import { APILoadingManager } from '../scripts/api-loading/APILoadingManager'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { TextAdapter } from '../scripts/text-adapter/TextAdapter'
import { SplashPod } from '../scripts/pod/SplashPod'
import { SceneState } from './SceneState'

export class SplashLoaddingScene extends Scene {
    private splashPod: SplashPod
    private loadingText: GameObjects.Text

    constructor() {
        super({
            key: 'SplashLoaddingScene',
        })
    }

    preload(): void {
        console.log('start SplashLoaddingScene')
        this.splashPod = PodProvider.instance.splashPod

        ResourceManager.instance.setResourceLoaderScene(this)

        APILoadingManager.instance.doInit(this)
        APILoadingManager.instance.showAPILoading()

        this.loadingText = TextAdapter.instance
            .getVectorText(this, 'FC_Lamoon_Bold')
            .setText('โหลด Asset')
            .setPosition(this.cameras.main.centerX, this.cameras.main.centerY)
            .setOrigin(0.5, 0.5)
            .setStyle({
                fill: 'Orange',
                fontSize: 55,
            })

        let observableInit: Observable<any>[] = []

        switch (this.splashPod.launchScene) {
            case SceneState.TownScene:
                observableInit.push(
                    ResourceManager.instance.loadPackJson('global-ui-load', `assets/global-ui-load.json`)
                )
                observableInit.push(ResourceManager.instance.loadPackJson('townload', `assets/town/json/townload.json`))
                observableInit.push(
                    ResourceManager.instance.loadPackJson('town-ui-load', `assets/town/json/town-ui-load.json`)
                )
                observableInit.push(
                    ResourceManager.instance.loadPackJson(
                        'ingredient-asset-load',
                        `assets/town/json/ingredient-asset-load.json`
                    )
                )
                observableInit.push(
                    ResourceManager.instance.loadPackJson('recipe-load', `assets/town/json/recipe-load.json`)
                )
                break
            case SceneState.MinigameCPPuzzle:
                observableInit.push(
                    ResourceManager.instance.loadPackJson('global-ui-load', `assets/global-ui-load.json`)
                )
                observableInit.push(
                    ResourceManager.instance.loadPackJson(
                        'ingredient-asset-load',
                        `assets/town/json/ingredient-asset-load.json`
                    )
                )
                
                observableInit.push(
                    ResourceManager.instance.loadPackJson(
                        'minigame1-load',
                        `assets/minigame/minigame1/minigame1-load.json`
                    )
                )
                observableInit.push(ResourceManager.instance.loadPackJson('minigame-result-load', `assets/minigame/result/minigame-result-load.json`))

                break
            case SceneState.MinigameCPOrder:
                observableInit.push(
                    ResourceManager.instance.loadPackJson('global-ui-load', `assets/global-ui-load.json`)
                )
                observableInit.push(
                    ResourceManager.instance.loadPackJson('recipe-load', `assets/town/json/recipe-load.json`)
                )
                observableInit.push(
                    ResourceManager.instance.loadPackJson(
                        'minigame2-load',
                        `assets/minigame/minigame2/minigame2-load.json`
                    )
                )
                observableInit.push(ResourceManager.instance.loadPackJson('minigame-result-load', `assets/minigame/result/minigame-result-load.json`))
                break
        }

        PodProvider.instance.audioManager.doInit()
        forkJoin(observableInit).subscribe(() => {
            //APILoadingManager.instance.hideAPILoading()
            this.scene.start(this.splashPod.launchScene.toString())
            //  this.scene.start(`MinigameCPPuzzle`)
            //this.scene.start(`MinigameCPOrder`)
        })
    }
}
