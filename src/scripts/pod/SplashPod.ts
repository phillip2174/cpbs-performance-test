import { SceneState } from '../../scenes/SceneState'

export class SplashPod {
    public launchScene: SceneState = SceneState.TownScene
    public isShowLogoLoading: boolean = true
    public isLaunchCPCity: boolean = false

    public setLaunchScene(state: SceneState) {
        this.launchScene = state
    }

    public setIsCloseLogo(isCloseLogo: boolean) {
        this.isShowLogoLoading = isCloseLogo
    }
}
