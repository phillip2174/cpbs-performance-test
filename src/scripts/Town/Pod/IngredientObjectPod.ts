import { BehaviorSubject } from 'rxjs'
import { Pod } from '../../plugins/objects/Pod'
import { IngredientObjectBean } from '../Bean/IngredientObjectBean'
import { ObjectAnimationState } from '../Type/ObjectAnimationState'
import { ObjectAnimationBean } from '../Bean/ObjectAnimationBean'

export class IngredientObjectPod extends Pod {
    public ingredientObjectBean: IngredientObjectBean
    public currentAnimationState: BehaviorSubject<ObjectAnimationState> = new BehaviorSubject<ObjectAnimationState>(
        ObjectAnimationState.Idle
    )
    public ingredientID: number = -1
    public isActiveObject: boolean = false

    public SetIngredientObjectBean(bean: IngredientObjectBean) {
        this.ingredientObjectBean = bean
    }

    public ChangeAnimationState(animationState: ObjectAnimationState) {
        this.currentAnimationState.next(animationState)
    }

    public getObjectAnimationBeanWithIndex(index: number): ObjectAnimationBean {
        return this.ingredientObjectBean.animationWithStateBeans[index]
    }
}
