import { TownTimeState } from '../Town/Type/TownTimeState'
import { CountdownTimerRepository } from '../Repository/CountdownTimerRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { Observable, map } from 'rxjs'

export class MinigameCountdownTimerPod {
   public timeDiffhours: number
   public timeDiffminutes: number
   public timeDiffseconds: number
   private currentTimeStamp: Date
   private localTimeStamp: Date
   private nextDayTimeStamp: Date
   private timeDiffTimeStamp: Date
   private timeDiff: number
   private timeZoneOffset: number
   private countDownTimerRepository: CountdownTimerRepository

   constructor() {
      this.countDownTimerRepository = RepositoryProvider.instance.countdownTimerRepository
   }

   public setupTimeStamps(): void {
      this.localTimeStamp = new Date()
      this.timeZoneOffset = this.localTimeStamp.getTimezoneOffset() * 60000


      this.nextDayTimeStamp = new Date(
         this.localTimeStamp.getFullYear(),
         this.localTimeStamp.getMonth(),
         this.localTimeStamp.getDate() + 1,
         0,
         0,
         0,
         0)
         
      // //MOCK
      // this.nextDayTimeStamp = new Date(
      //    this.localTimeStamp.getFullYear(),
      //    this.localTimeStamp.getMonth(),
      //    this.localTimeStamp.getDate(),
      //    this.localTimeStamp.getHours(),
      //    this.localTimeStamp.getMinutes(),
      //    this.localTimeStamp.getSeconds() + 10,
      //    0)
   }


   public updateTimeDiffTimeStamp(): void {
      this.localTimeStamp = new Date()
      this.timeDiff = this.nextDayTimeStamp.getTime() - this.localTimeStamp.getTime()
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

}
