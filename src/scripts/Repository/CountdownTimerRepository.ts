import { Observable, of } from 'rxjs'
import { TownTimeState } from '../Town/TownTimeState'

export class CountdownTimerRepository {
   private currentTimeStamp: Date
   private currentTownTimeState: TownTimeState

   public getCurrentTimeStamp(): Observable<Date> {
      this.currentTimeStamp = new Date()
      return of(this.currentTimeStamp)
   }

   public getCurrentTimeState(): Observable<TownTimeState> {
      this.currentTownTimeState = TownTimeState.Day
      return of(this.currentTownTimeState)
   }
}
