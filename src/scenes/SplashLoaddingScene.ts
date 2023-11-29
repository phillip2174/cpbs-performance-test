import { GameObjects, Scene } from 'phaser'
import { Observable, forkJoin, timer } from 'rxjs'
import { APILoadingManager } from '../scripts/api-loading/APILoadingManager'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { PodProvider } from '../scripts/pod/PodProvider'
import { TextAdapter } from '../scripts/text-adapter/TextAdapter'
import { SplashPod } from '../scripts/pod/SplashPod'
import { SceneState } from './SceneState'
import { LoadingBarView } from '../bar/LoadingBar'
import { GameConfig } from '../scripts/GameConfig'

export class SplashLoaddingScene extends Scene {
    private splashPod: SplashPod
    private loadingText: GameObjects.Text
    private loadingBar: LoadingBarView
    isDesktop: boolean

    private isLoadingBar: boolean = false
    private valueLoading: number = 0

    constructor() {
        super({
            key: 'SplashLoaddingScene',
        })
    }

    preload(): void {
        console.log('start SplashLoaddingScene')
        this.splashPod = PodProvider.instance.splashPod
        this.sys.game.device.os.desktop ? (this.isDesktop = true) : (this.isDesktop = false)
        ResourceManager.instance.setResourceLoaderScene(this)

        APILoadingManager.instance.doInit(this, 0)
        APILoadingManager.instance.showSceneLoading(this.splashPod.launchScene)
        this.loadingBar = APILoadingManager.instance.getLoadingBar()

        this.isLoadingBar = false

        this.load.on('progress', (value: number) => {
            this.isLoadingBar = true
            this.valueLoading = value
            this.loadingBar.updateBarProgress(this.valueLoading)
        })

        if (!this.isLoadingBar) {
            this.loadingBar.fakeFirstLoading()
        }

        let observableInit: Observable<any>[] = []

        timer(500).subscribe((_) => {
            switch (this.splashPod.launchScene) {
                case SceneState.TownScene:
                    const tutorialManager = PodProvider.instance.tutorialManager
                    if (!tutorialManager.tutorialSaveBean.isCompletedTutorial && GameConfig.IS_START_WITH_TUTORIAL) {
                        observableInit.push(
                            ResourceManager.instance.loadPackJson(
                                'tutorial-ui-load',
                                `assets/town/json/tutorial-ui-load.json`
                            )
                        )

                        observableInit.push(tutorialManager.loadTutorialData(this.isDesktop))
                    }
                    observableInit.push(timer(1500))
                    observableInit.push(
                        ResourceManager.instance.loadPackJson('global-ui-load', `assets/global-ui-load.json`)
                    )
                    observableInit.push(
                        ResourceManager.instance.loadPackJson('townload', `assets/town/json/townload.json`)
                    )
                    observableInit.push(
                        ResourceManager.instance.loadPackJson('town-ui-load', `assets/town/json/town-ui-load.json`)
                    )
                    observableInit.push(
                        ResourceManager.instance.loadPackJson('town-audio-load', `assets/town/json/town-audio-load.json`)
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
                    observableInit.push(
                        ResourceManager.instance.loadPackJson(
                            'spine-load-data',
                            `assets/town/json/spine-load-data.json`
                        )
                    )
                    break
                case SceneState.MinigameCPPuzzle:
                    observableInit.push(timer(1500))
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
                    if (this.isDesktop) {
                        observableInit.push(
                            ResourceManager.instance.loadPackJson(
                                'minigame-result-load',
                                `assets/minigame/result/minigame-result-load.json`
                            )
                        )
                    } else {
                        observableInit.push(
                            ResourceManager.instance.loadPackJson(
                                'minigame-result-load',
                                `assets/minigame/result/mobile/mobile-minigame-result-load.json`
                            )
                        )
                    }
                    break
                case SceneState.MinigameCPOrder:
                    observableInit.push(timer(1500))
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
                        ResourceManager.instance.loadPackJson('recipe-load', `assets/town/json/recipe-load.json`)
                    )
                    observableInit.push(
                        ResourceManager.instance.loadPackJson(
                            'minigame2-load',
                            `assets/minigame/minigame2/minigame2-load.json`
                        )
                    )
                    if (this.isDesktop) {
                        observableInit.push(
                            ResourceManager.instance.loadPackJson(
                                'minigame-result-load',
                                `assets/minigame/result/minigame-result-load.json`
                            )
                        )
                    } else {
                        observableInit.push(
                            ResourceManager.instance.loadPackJson(
                                'minigame-result-load',
                                `assets/minigame/result/mobile/mobile-minigame-result-load.json`
                            )
                        )
                    }
                    break
            }

            forkJoin(observableInit).subscribe(() => {
                if (this.isLoadingBar) {
                    this.scene.start(this.splashPod.launchScene.toString())
                } else {
                    this.loadingBar.fakeLoading(() => {
                        this.scene.start(this.splashPod.launchScene.toString())
                    })
                }
            })
        })
    }
}
