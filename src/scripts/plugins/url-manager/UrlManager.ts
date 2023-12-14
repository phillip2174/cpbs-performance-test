import { UrlParam } from './UrlParam'

export class UrlManager {
    private static gameParam: UrlParam

    private static init(): void {
        this.gameParam = `${window.location.search}?`
            .split('?')[1]
            .split('&')
            .reduce((params: object, pair: string) => {
                const [key, value] = `${pair}=`.split('=').map(decodeURIComponent)

                return key.length > 0 ? { ...params, [key]: value } : params
            }, {}) as UrlParam
    }

    static getParam(): UrlParam {
        if (!this.gameParam) this.init()
        return this.gameParam
    }

    static resetParam() {
        this.gameParam = null
    }

    // static updateUrl(gameParam: UrlParam) {
    //     let baseUrl = window.location.href.split('?')[0]
    //     var newUrl = `${baseUrl}?code=${gameParam.code}&liffClientId=${gameParam.liffClientId}&state=${gameParam.state}&liffRedirectUri=${gameParam.liffRedirectUri}&scene=${gameParam.scene}&gameID=${gameParam.gameID}&blinding=${gameParam.blinding}`
    //     if (FacebookShareManager.isShareFacebook()) newUrl += '#_=_'
    //     UrlManager.resetParam()
    //     history.pushState({}, null, newUrl)
    // }
    // static getUrl() {
    //     let baseUrl = window.location.href.split('?')[0]
    //     var newUrl = `${baseUrl}?code=${this.gameParam.code}&liffClientId=${this.gameParam.liffClientId}&state=${this.gameParam.state}&liffRedirectUri=${this.gameParam.liffRedirectUri}&scene=${this.gameParam.scene}&gameID=${this.gameParam.gameID}&blinding=${this.gameParam.blinding}`
    //     return newUrl
    // }
}
