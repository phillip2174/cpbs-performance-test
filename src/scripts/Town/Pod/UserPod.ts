import { BehaviorSubject, Observable, map } from 'rxjs'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'
import { UserBean } from '../../User/UserBean'
import { UserRepository } from './../../Repository/UserRepository'
import { TutorialManager } from '../../Manager/TutorialManager'
import { PodProvider } from '../../pod/PodProvider'
import { UserType } from '../../User/UserType'

export class UserPod {
    public static readonly SECONDS_CONVERT_MODIFIER: number = 1000
    public static readonly UNIX_DAY_TIMESTAMP: number = 86400
    public userBean: UserBean
    public userCPpoint: BehaviorSubject<number> = new BehaviorSubject<number>(0)
    public isFirstLoginOfTheDay: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    public userLoginType: UserType = UserType.Guest

    private currentLoginTime: Date
    private userRepository: UserRepository

    constructor() {
        this.userRepository = RepositoryProvider.instance.userRepository
    }

    public getUserBean(): Observable<UserBean> {
        return this.userRepository.getUserBean(this.userLoginType).pipe(
            map((userBean) => {
                this.userBean = userBean
                this.userCPpoint.next(this.userBean.cpPoint)
                console.log(this.userBean)
                return this.userBean
            })
        )
    }

    public getUserCPPoint(): Observable<number> {
        return this.userRepository.getUserCPPoint(PodProvider.instance.tutorialManager.isCompletedTutorial()).pipe(
            map((cpPoint) => {
                this.userCPpoint.next(cpPoint)
                return this.userCPpoint.value
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

    public addCPPoint(point: number): void {
        this.userCPpoint.next(this.userCPpoint.value + point)
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
