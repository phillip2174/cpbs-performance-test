import { BehaviorSubject, Observable, map } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { UserBean } from '../../User/UserBean'
import { UserRepository } from './../../Repository/UserRepository'

export class UserPod {
    public static readonly SECONDS_CONVERT_MODIFIER: number = 1000
    public static readonly UNIX_DAY_TIMESTAMP: number = 86400
    public userBean: UserBean
    public isFirstLoginOfTheDay: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)

    private currentLoginTime: Date
    private userRepository: UserRepository

    constructor() {
        this.userRepository = RepositoryProvider.instance.userRepository
    }

    public getUserBean(): Observable<UserBean> {
        return this.userRepository.getUserBean().pipe(
            map((userBean) => {
                this.userBean = userBean
                console.log(this.userBean)
                return this.userBean
            })
        )
    }

    public checkFirstLoginOfTheDay(): void {
        this.currentLoginTime = new Date()
        if (this.userBean.lastLoginTime == undefined || this.userBean.lastLoginTime == null) {
            this.resetFirstLoginOfTheDay()
            this.userBean.lastLoginTime = this.getCurrentTimeInUnixSeconds()
        } else {
            if (this.checkIsLoginAnotherDay()) {
                this.resetFirstLoginOfTheDay()
            } else {
                this.isFirstLoginOfTheDay.next(false)
            }
        }
    }

    public setIsFirstLoginOfTheDay(isFirstLogin: boolean): void {
        this.isFirstLoginOfTheDay.next(isFirstLogin)
    }

    private getCurrentTimeInUnixSeconds(): number {
        return +(this.currentLoginTime.getTime() / UserPod.SECONDS_CONVERT_MODIFIER).toFixed(0)
    }

    private checkIsLoginAnotherDay(): boolean {
        let lastLoginDayTimeStamp = new Date(this.userBean.lastLoginTime * UserPod.SECONDS_CONVERT_MODIFIER)
        return this.currentLoginTime.getDate() - lastLoginDayTimeStamp.getDate() >= 1
    }

    private resetFirstLoginOfTheDay(): void {
        this.isFirstLoginOfTheDay.next(true)
    }
}
