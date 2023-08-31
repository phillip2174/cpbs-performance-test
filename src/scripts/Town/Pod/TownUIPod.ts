import { BehaviorSubject } from 'rxjs'
import { TownUIState } from '../Type/TownUIState'

export class TownUIPod {
   public townUIState: BehaviorSubject<TownUIState> = new BehaviorSubject<TownUIState>(TownUIState.MainMenu)

   public changeUIState(state: TownUIState): void {
      this.townUIState.next(state)
   }
}
