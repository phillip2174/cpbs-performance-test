import { TutorialSaveBean } from '../../Tutorial/TutorialSaveBean'
import { GameConfig } from '../GameConfig'
import { UserIngredientBean } from '../Ingredient/UserIngredientBean'
import { SettingDataBean } from '../Town/Settings/SettingDataBean'

export class LocalStorageRepository {
    public settingDataBean: SettingDataBean
    private tutorialSaveBean: TutorialSaveBean
    private userIngredientBeans: UserIngredientBean[]

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

    public clearAllTutorial() {
        localStorage.removeItem('tutorialSaveBean')
        this.clearLocalStorageUserIngredient()
    }

    public getTutorialSaveData(): TutorialSaveBean {
        // localStorage.removeItem('tutorialSaveBean')
        const tutorialBean = localStorage.getItem('tutorialSaveBean')
        if (tutorialBean == null || tutorialBean == undefined) {
            this.tutorialSaveBean = new TutorialSaveBean(0, false)
            this.saveTutorialData()
        } else {
            this.tutorialSaveBean = JSON.parse(tutorialBean)
        }
        console.log(this.tutorialSaveBean)
        return this.tutorialSaveBean
    }

    public saveTutorialData(): void {
        console.log('Saved tutorialSaveBean')
        console.log(this.tutorialSaveBean)
        localStorage.setItem('tutorialSaveBean', JSON.stringify(this.tutorialSaveBean))
    }

    public clearLocalStorageUserIngredient() {
        localStorage.removeItem('userIngredientBeans')
    }

    public getUserIngredientBeansData(isCompletedTutorial: boolean): UserIngredientBean[] {
        localStorage.removeItem('userIngredientBeans')

        const userIngredient = localStorage.getItem('userIngredientBeans')
        if (userIngredient == null || userIngredient == undefined) {
            this.userIngredientBeans = []
            this.saveTutorialData()
        } else {
            this.userIngredientBeans = JSON.parse(userIngredient)
        }
        console.log(this.userIngredientBeans)
        return this.userIngredientBeans
    }

    public saveUserIngredientBeansData(userIngredient: UserIngredientBean): void {
        this.userIngredientBeans.push(userIngredient)
        console.log('Saved UserIngredientBeans')
        console.log(this.userIngredientBeans)
        localStorage.setItem('userIngredientBeans', JSON.stringify(this.userIngredientBeans))
    }
}
