import { GameConfig } from '../GameConfig'
import { UserBean } from '../User/UserBean'
import { Observable, of } from 'rxjs'
import { UserType } from '../User/UserType'

export class UserRepository {
    private userBean: UserBean

    public getUserBean(userType: UserType): Observable<UserBean> {
        if (GameConfig.IS_MOCK_API) {
            if (userType == UserType.Login) {
                this.userBean = new UserBean(1, 'Phillip', 'Liu', 0, 100100)
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
}
