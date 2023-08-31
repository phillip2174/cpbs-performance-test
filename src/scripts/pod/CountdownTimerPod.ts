import { TownTimeState } from '../Town/Type/TownTimeState'
import { CountdownTimerRepository } from './../Repository/CountdownTimerRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { Observable, map } from 'rxjs'

export class CountdownTimerPod {
   public timeDiffhours: number
   public timeDiffminutes: number
   public timeDiffseconds: number
   private currentTimeStamp: Date
   private localTimeStamp: Date
   private dayTimeStamp: Date
   private nightTimeStamp: Date
   private timeDiffTimeStamp: Date
   private timeDiff: number
   private timeZoneOffset: number
   private currentTownTimeState: TownTimeState
   private countDownTimerRepository: CountdownTimerRepository

   constructor() {
      this.countDownTimerRepository = RepositoryProvider.instance.countdownTimerRepository
   }

   public setupTimeStamps(): void {
      this.localTimeStamp = new Date()
      this.timeZoneOffset = this.localTimeStamp.getTimezoneOffset() * 60000

      if (this.currentTownTimeState == TownTimeState.Night) {
         this.dayTimeStamp = new Date(
            this.localTimeStamp.getFullYear(),
            this.localTimeStamp.getMonth(),
            this.localTimeStamp.getDate() + 1,
            6,
            0,
            0,
            0
         )
      } else {
         this.dayTimeStamp = new Date(
            this.localTimeStamp.getFullYear(),
            this.localTimeStamp.getMonth(),
            this.localTimeStamp.getDate(),
            6,
            0,
            0,
            0
         )
      }

      this.nightTimeStamp = new Date(
         this.localTimeStamp.getFullYear(),
         this.localTimeStamp.getMonth(),
         this.localTimeStamp.getDate(),
         18,
         0,
         0,
         0
      )
   }

   public updateTimeDiffTimeStamp(): void {
      this.localTimeStamp = new Date()
      if (this.localTimeStamp < this.dayTimeStamp) {
         this.timeDiff = this.dayTimeStamp.getTime() - this.localTimeStamp.getTime()
      } else {
         this.timeDiff = this.nightTimeStamp.getTime() - this.localTimeStamp.getTime()
      }

      this.timeDiffTimeStamp = new Date(this.timeDiff + this.timeZoneOffset)
   }

   public checkIsCountdownFinish(): boolean {
      return this.timeDiffhours == 0 && this.timeDiffminutes == 0 && this.timeDiffseconds == 0
   }

   public setTimeDiffTimes(): void {
      this.timeDiffhours = this.timeDiffTimeStamp.getHours()
      this.timeDiffminutes = this.timeDiffTimeStamp.getMinutes()
      this.timeDiffseconds = this.timeDiffTimeStamp.getSeconds()
   }

   public getCurrentTimeStamp(): Observable<Date> {
      return this.countDownTimerRepository.getCurrentTimeStamp().pipe(
         map((timeStamp) => {
            this.currentTimeStamp = timeStamp
            return this.currentTimeStamp
         })
      )
   }

   public getCurrentTownTimeStateByServer(): Observable<TownTimeState> {
      return this.countDownTimerRepository.getCurrentTimeState().pipe(
         map((timeState) => {
            this.currentTownTimeState = timeState
            this.setupTimeStamps()
            return this.currentTownTimeState
         })
      )
   }

   public getCurrentTownTimeStateByTimeStamp(): Observable<TownTimeState> {
      return this.getCurrentTimeStamp().pipe(
         map((timestamp) => {
            if (timestamp > this.dayTimeStamp) {
               return TownTimeState.Night
            } else {
               return TownTimeState.Day
            }
         })
      )
   }
}
