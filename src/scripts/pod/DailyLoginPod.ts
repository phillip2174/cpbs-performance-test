import { Observable, map, of } from 'rxjs'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { DailyLoginBean } from '../Town/DailyLogin/DailyLoginBean'
import { DailyLoginRepository } from './../Repository/DailyLoginRepository'

export class DailyLoginPod {
    public dailyLoginBeans: DailyLoginBean[]

    private dailyLoginRepository: DailyLoginRepository

    constructor() {
        this.dailyLoginRepository = RepositoryProvider.instance.dailyLoginRepository
    }

    public getDailyLoginData(): Observable<DailyLoginBean[]> {
        if (this.dailyLoginBeans == undefined || this.dailyLoginBeans == null) {
            return this.dailyLoginRepository.getDailyLoginData().pipe(
                map((dailyLoginBeans) => {
                    this.dailyLoginBeans = dailyLoginBeans
                    console.log('dailyLoginBeans Count: ' + this.dailyLoginBeans.length)
                    console.log(this.dailyLoginBeans)
                    return this.dailyLoginBeans
                })
            )
        } else {
            return of(this.dailyLoginBeans)
        }
    }
}
