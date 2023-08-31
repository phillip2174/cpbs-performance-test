import { BehaviorSubject } from 'rxjs'
import { Pod } from '../../plugins/objects/Pod'
import { SuccessIndicatorState } from '../Type/SuccessIndicatorState'
import { IngredientBean } from '../../Guideline/IngredientBean'

export class SuccessIndicatorPod extends Pod {
    public currentSuccessIndicatorState: BehaviorSubject<SuccessIndicatorState> =
        new BehaviorSubject<SuccessIndicatorState>(SuccessIndicatorState.SpawnIngredient)

    public ingredientBean: IngredientBean

    public changeState(state: SuccessIndicatorState) {
        this.currentSuccessIndicatorState.next(state)
    }

    public setBean(bean: IngredientBean) {
        this.ingredientBean = bean
    }
}
