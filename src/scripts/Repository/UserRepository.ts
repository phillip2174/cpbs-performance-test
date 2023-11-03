import { UserBean } from '../User/UserBean'
import { Observable, of } from 'rxjs'

export class UserRepository {
    private mockUserBean: UserBean

    public getUserBean(): Observable<UserBean> {
        this.mockUserBean = new UserBean()
        return of(this.mockUserBean)
    }
}
