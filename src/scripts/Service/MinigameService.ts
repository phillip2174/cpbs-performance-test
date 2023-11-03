import { MinigameBonusBean } from './../minigame/MinigameBonusBean';
import { Observable, of } from 'rxjs'
import { MinigameResultBean } from "../minigame/MinigameResultBean"

export class MinigameService {


   public startGame(id: number): Observable<StartGameResultBean> {

      return of(new StartGameResultBean(2, { image: 'assets/minigame/minigame1/minigame1.png' }))
   }

   public sendResult(id: number, score: number): Observable<MinigameResultBean> {
      console.log(score);
      var result = 0
      if (id == 1) {
         if (score > 50000) {
            result = 3;
         } else if (score > 10000) {
            result = 2;
         } else if (score > 100) {
            result = 1;
         }
      }
      var minigameResultBean = new MinigameResultBean(result, [new MinigameBonusBean(true, 0, 10), new MinigameBonusBean(false, 2, 1), new MinigameBonusBean(false, 4, 100)])
      return of(minigameResultBean)
   }

}

export class StartGameResultBean {
   ticketLeft: number
   balance: any

   constructor(ticketList: number, balance: object) {
      this.ticketLeft = ticketList;
      this.balance = balance;
   }
}
