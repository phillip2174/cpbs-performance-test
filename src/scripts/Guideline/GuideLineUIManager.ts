import { BehaviorSubject } from 'rxjs'
import { GuideLineUICellView } from './GuideLineUICellView'
import { IngredientBean } from '../Ingredient/IngredientBean'
import { GuideLineUICellState } from './GuideLineUICellState'

export class GuideLineUIManager {
    public guideLineUICellViewList: GuideLineUICellView[] = []
    public isAllFound: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public currentFoundIngredientCount: BehaviorSubject<number> = new BehaviorSubject<number>(0)

    public checkIsAllIngredientFound(): void {
        this.isAllFound.next(this.checkAllIsFound())
    }

    public updateCurrentFoundIngredientCount(): void {
        this.currentFoundIngredientCount.next(
            this.guideLineUICellViewList.filter((cellView) => {
                return cellView.getGuideLineUICellState() == GuideLineUICellState.IdleFound
            }).length
        )
    }

    public checkAllIsFound(): boolean {
        return this.guideLineUICellViewList.every((cellView) => {
            return cellView.getGuideLineUICellState() == GuideLineUICellState.IdleFound
        })
    }

    public addGuideLineUICellViewList(guide: GuideLineUICellView[]) {
        this.guideLineUICellViewList = guide
    }

    public updateGuideLineCellUI(bean: IngredientBean) {
        let cellUpdate = this.guideLineUICellViewList.find((x) => x.ingredientBean.id == bean.id)
        cellUpdate.updateCellView()
    }
}
