import { ObjectAnimationState } from '../Type/ObjectAnimationState'

export class ObjectAnimationBean {
    stateType: ObjectAnimationState
    animKey: string
    animTime: number

    constructor(stateType: ObjectAnimationState, animKey: string, animTime: number) {
        this.stateType = stateType
        this.animKey = animKey
        this.animTime = animTime
    }
}
