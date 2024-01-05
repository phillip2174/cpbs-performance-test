import { GameConfig } from '../GameConfig'

export class UserBean {
    public userId: number = 1
    public firstName: string = 'Phillip'
    public lastName: string = 'Liu'
    public lastLoginTime: number
    public cpPoint: number = 100100
    public profileImageUrl: string = 'user-profile'

    constructor(
        userId?: number,
        firstName?: string,
        lastName?: string,
        lastLoginTime?: number,
        cpPoint?: number,
        profileImageUrl?: string
    ) {
        this.userId = userId
        this.firstName = firstName
        this.lastName = lastName
        this.lastLoginTime = lastLoginTime
        this.cpPoint = cpPoint
        this.profileImageUrl = profileImageUrl
    }
}
