import { SettingDataBean } from '../Town/Settings/SettingDataBean'

export class LocalStorageRepository {
    public settingDataBean: SettingDataBean

    public getSettingData(): SettingDataBean {
        let settingData = localStorage.getItem('settingData')
        if (settingData == null || settingData == undefined) {
            this.settingDataBean = new SettingDataBean()
        } else {
            this.settingDataBean = JSON.parse(settingData)
        }
        console.log(this.settingDataBean)
        return this.settingDataBean
    }

    public saveSettingData(): void {
        console.log(this.settingDataBean)
        localStorage.setItem('settingData', JSON.stringify(this.settingDataBean))
    }
}
