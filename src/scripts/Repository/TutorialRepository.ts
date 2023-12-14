import { Observable, map, of } from 'rxjs'
import { TutorialDataBean } from '../../Tutorial/TutorialDataBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'

export class TutorialRepository {
    public getTutorialData(isDesktop: boolean): Observable<TutorialDataBean[]> {
        if (isDesktop) {
            return ResourceManager.instance
                .loadText('tutorial-data-desktop', 'assets/town/json/tutorial-data-desktop.json')
                .pipe(map((json) => JSON.parse(json)))
        } else {
            return ResourceManager.instance
                .loadText('tutorial-data-mobile', 'assets/town/json/tutorial-data-mobile.json')
                .pipe(map((json) => JSON.parse(json)))
        }
    }

    public saveTutorialData(): Observable<boolean> {
        return of(true)
    }
}
