import { GameConfig } from '../GameConfig'
import { UserBean } from '../User/UserBean'
import { Observable, of } from 'rxjs'
import { UserType } from '../User/UserType'
import { LocalStorageRepository } from './LocalStorageRepository'
import { RepositoryProvider } from './RepositoryProvider'

export class UserRepository {
    private userBean: UserBean
    private localStorageRepository: LocalStorageRepository

    constructor() {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
    }

    public getUserBean(userType: UserType): Observable<UserBean> {
        if (GameConfig.IS_MOCK_API) {
            if (userType == UserType.Login) {
                this.userBean = new UserBean(
                    1,
                    'Phillip',
                    'Liu',
                    0,
                    0,
                    'https://cdn.discordapp.com/attachments/545221131775246371/1192695294006140958/1797506_765669076788654_2508913238626413675_n.png?ex=65aa030d&is=65978e0d&hm=f217432de5cc436653e981a34dff1b817e59c56872351e83af699147b0ba169b&'
                )
            } else {
                this.userBean = new UserBean(0, 'Guest', 'User', 0, 0)
            }

            return of(this.userBean)
        } else {
            if (userType == UserType.Login) {
                //TODO GET USER
                this.userBean = new UserBean(1, 'Phillip', 'Liu', 0, 100100)
            } else {
                this.userBean = new UserBean(0, 'Guest', 'User', 0, 0)
            }

            return of(this.userBean)
        }
    }

    public getUserCPPoint(isCompletedTutorial: boolean): Observable<number> {
        if (GameConfig.IS_MOCK_API) {
            return of(this.localStorageRepository.getUserCPPoint(isCompletedTutorial))
        } else {
            if (isCompletedTutorial) {
                //API LOAD USER CP POINT
                const point: number = 0
                return of(point)
            } else {
                return of(this.localStorageRepository.getUserCPPoint(isCompletedTutorial))
            }
        }
    }
}
