import { SceneState } from '../../scenes/SceneState'

export class SplashPod {
    public launchScene: SceneState = SceneState.TownScene

    public setLaunchScene(state: SceneState) {
        this.launchScene = state
    }
}
