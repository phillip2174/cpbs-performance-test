import { BehaviorSubject } from 'rxjs'
import { GuideLineUICellView } from './GuideLineUICellView'
import { IngredientBean } from './IngredientBean'

export class GuideLineUIManager {
   public guideLineUICellViewList: GuideLineUICellView[] = []
   public isAllFound: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

   public checkIsAllIngredientFound(): void {
      this.isAllFound.next(
         this.guideLineUICellViewList.every((cellView) => {
            return cellView.ingredientBean.isFound == true
         })
      )
   }

   public addGuideLineUICellViewList(guide: GuideLineUICellView[]) {
      this.guideLineUICellViewList = guide
   }

   public updateGuideLineCellUI(bean: IngredientBean) {
      let cellUpdate = this.guideLineUICellViewList.find((x) => x.ingredientBean.ingredientID == bean.ingredientID)
      cellUpdate.updateCellView()
   }
}
