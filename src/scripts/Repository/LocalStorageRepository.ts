import { TutorialSaveBean } from '../../Tutorial/TutorialSaveBean'
import { CookieConsentBean } from '../CookieConsent/CookieConsentBean'
import { GameConfig } from '../GameConfig'
import { UserIngredientBean } from '../Ingredient/UserIngredientBean'
import { InventoryItemBean } from '../Town/Inventory/InventoryItemBean'
import { SettingDataBean } from '../Town/Settings/SettingDataBean'

export class LocalStorageRepository {
    public settingDataBean: SettingDataBean
    private cookieConsentBean: CookieConsentBean
    private tutorialSaveBean: TutorialSaveBean
    private userIngredientBeans: UserIngredientBean[]
    private inventoryItemBean: InventoryItemBean[]
    private userCPPoint: number

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

    public saveCookieConsentData(cookieConsentBean: CookieConsentBean): void {
        console.log('Saved cookieConsentBean')
        console.log(this.cookieConsentBean)
        this.cookieConsentBean = cookieConsentBean
        localStorage.setItem('cookieConsentBean', JSON.stringify(this.cookieConsentBean))
    }

    public getCookieConsentData(): CookieConsentBean {
        const cookieBean = localStorage.getItem('cookieConsentBean')
        if (cookieBean == null || cookieBean == undefined) {
            this.cookieConsentBean = new CookieConsentBean(false)
            localStorage.setItem('cookieConsentBean', JSON.stringify(this.cookieConsentBean))
        } else {
            this.cookieConsentBean = JSON.parse(cookieBean)
        }
        console.log(this.cookieConsentBean)
        return this.cookieConsentBean
    }

    public clearCookieConsentBean() {
        localStorage.removeItem('cookieConsentBean')
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
        //localStorage.removeItem('userIngredientBeans')

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
        if (!this.userIngredientBeans.some((x) => x.id == userIngredient.id))
            this.userIngredientBeans.push(userIngredient)
        console.log('Saved UserIngredientBeans')
        console.log(this.userIngredientBeans)
        localStorage.setItem('userIngredientBeans', JSON.stringify(this.userIngredientBeans))
    }

    public getInventoryBeansData(): InventoryItemBean[] {
        //localStorage.removeItem('inventoryItemBean')

        const inventoryItemBean = localStorage.getItem('inventoryItemBean')
        if (inventoryItemBean == null || inventoryItemBean == undefined) {
            this.inventoryItemBean = []
            this.saveInventoryBeansData(this.inventoryItemBean)
        } else {
            this.inventoryItemBean = JSON.parse(inventoryItemBean)
        }
        console.log(this.inventoryItemBean)
        return this.inventoryItemBean
    }

    public saveInventoryBeansData(inventoryBeans: InventoryItemBean[]): void {
        this.inventoryItemBean = inventoryBeans
        console.log('Saved inventoryItemBean')
        console.log(this.inventoryItemBean)
        localStorage.setItem('inventoryItemBean', JSON.stringify(this.inventoryItemBean))
    }

    public getUserCPPoint(isCompletedTutorial: boolean): number {
        //localStorage.removeItem('userCPPoint')

        const userCPPoint = localStorage.getItem('userCPPoint')
        if (userCPPoint == null || userCPPoint == undefined) {
            this.userCPPoint = 0
            this.saveTutorialData()
        } else {
            this.userCPPoint = JSON.parse(userCPPoint)
        }
        console.log(this.userCPPoint)
        return this.userCPPoint
    }

    public saveUserCPPoint(userCPPoint: number): void {
        this.userCPPoint = userCPPoint
        console.log('Saved UserCPPoint')
        console.log(this.userCPPoint)
        localStorage.setItem('userCPPoint', JSON.stringify(this.userCPPoint))
    }

    public clearAllTutorialDataSave() {
        localStorage.removeItem('userIngredientBeans')
        localStorage.removeItem('inventoryItemBean')
        localStorage.removeItem('userCPPoint')
    }
}
