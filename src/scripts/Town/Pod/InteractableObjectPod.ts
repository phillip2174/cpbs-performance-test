import { BehaviorSubject } from 'rxjs'
import { Pod } from '../../plugins/objects/Pod'
import { InteractableObjectAnimationState } from '../Type/InteractableObjectAnimationState'
import { InteractableObjectBean } from '../InteractableObjectBean'
import { InteractableObjectPickupState } from '../Type/InteractableObjectPickupState'

export class InteractableObjectPod extends Pod {
    public interactableObjectBean: InteractableObjectBean
    public currentAnimationState: BehaviorSubject<InteractableObjectAnimationState> =
        new BehaviorSubject<InteractableObjectAnimationState>(InteractableObjectAnimationState.Idle)
    public isFoundIngredient: boolean = false
    public isActiveObject: boolean = false

    public SetInteractableObjectBean(interactableObjectBean: InteractableObjectBean) {
        this.interactableObjectBean = interactableObjectBean
    }

    public ChangeAnimationState(animationState: InteractableObjectAnimationState) {
        this.currentAnimationState.next(animationState)
    }
}
