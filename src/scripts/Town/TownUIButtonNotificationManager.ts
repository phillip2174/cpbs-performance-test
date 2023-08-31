import { BehaviorSubject } from 'rxjs'

export class TownUIButtonNotificationManager {
   public menuGroupIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
   public collectionsIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
   public inventoryIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
   public cookingIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
   public dailyLoginIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
   public minigameIsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

   public setMenuGroupIsUpdate(isUpdate: boolean): void {
      this.menuGroupIsUpdate.next(isUpdate)
   }

   public setCollectionsIsUpdate(isUpdate: boolean): void {
      this.collectionsIsUpdate.next(isUpdate)
   }

   public setInventoryIsUpdate(isUpdate: boolean): void {
      this.inventoryIsUpdate.next(isUpdate)
   }

   public setCookingIsUpdate(isUpdate: boolean): void {
      this.cookingIsUpdate.next(isUpdate)
   }

   public setDailyLoginIsUpdate(isUpdate: boolean): void {
      this.dailyLoginIsUpdate.next(isUpdate)
   }

   public setMinigameIsUpdate(isUpdate: boolean): void {
      this.minigameIsUpdate.next(isUpdate)
   }
}
