import { Observable, map } from 'rxjs'
import { DailyLoginBean } from '../Town/DailyLogin/DailyLoginBean'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'

export class DailyLoginRepository {
    public getDailyLoginData(): Observable<DailyLoginBean[]> {
        return ResourceManager.instance
            .loadText('daily_login_data', 'assets/town/json/daily_login_data.json')
            .pipe(map((json) => JSON.parse(json)))
    }
}
