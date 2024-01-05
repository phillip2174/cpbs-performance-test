import { CookieConsentBean } from '../CookieConsent/CookieConsentBean'
import { LocalStorageRepository } from '../Repository/LocalStorageRepository'
import { RepositoryProvider } from '../Repository/RepositoryProvider'

export class CookieConsentManager {
    public isAcceptCookie: boolean
    public cookieConsentBean: CookieConsentBean

    private localStorageRepository: LocalStorageRepository

    constructor() {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
    }

    public getCookieConsentData() {
        this.cookieConsentBean = this.localStorageRepository.getCookieConsentData()
        this.isAcceptCookie = this.cookieConsentBean.isAcceptCookie
    }

    public saveCookieConsentData(isAcceptCookie: boolean) {
        this.isAcceptCookie = isAcceptCookie
        this.cookieConsentBean.isAcceptCookie = isAcceptCookie
        this.localStorageRepository.saveCookieConsentData(this.cookieConsentBean)
    }
}
