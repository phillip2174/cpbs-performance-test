import { BehaviorSubject } from "rxjs";
import { Pod } from "../plugins/objects/Pod";
import { SplashLoaddingSceneState } from "./SplashLoadingSceneState";

export class SplashLoadingPod extends Pod{
    public bootSceneState = new BehaviorSubject<SplashLoaddingSceneState>(
        SplashLoaddingSceneState.TownScene,
    )

    public setSplashLoadingState(state: SplashLoaddingSceneState): void {
        this.bootSceneState.next(state)
    }
}