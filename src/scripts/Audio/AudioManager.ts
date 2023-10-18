import { BehaviorSubject } from 'rxjs'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { LocalStorageRepository } from './../Repository/LocalStorageRepository'

export class AudioManager {
    private isSoundEffectOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    private isBgMusicOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    private soundEffectVolume: number = 1
    private bgMusicVolume: number = 1
    private localStorageRepository: LocalStorageRepository

    public doInit(): void {
        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
        this.localStorageRepository.getSettingData()
        this.setSoundEffect(this.localStorageRepository.settingDataBean.isSoundEffectOn)
        this.setBgMusic(this.localStorageRepository.settingDataBean.isBgMusicOn)

        if (localStorage.getItem('settingData') == null || localStorage.getItem('settingData') == undefined)
            this.localStorageRepository.saveSettingData()

        this.isSoundEffectOn.subscribe((isOn) => {
            this.soundEffectVolume = isOn ? 1 : 0
            console.log('Sound Effect Volume: ' + this.soundEffectVolume)
        })

        this.isBgMusicOn.subscribe((isOn) => {
            this.bgMusicVolume = isOn ? 1 : 0
            console.log('Bg Music Volume: ' + this.bgMusicVolume)
        })
    }

    public getIsSoundEffectOn(): boolean {
        return this.isSoundEffectOn.value
    }

    public getIsBgMusicOn(): boolean {
        return this.isBgMusicOn.value
    }

    public setSoundEffect(isOn: boolean): void {
        this.isSoundEffectOn.next(isOn)
        this.localStorageRepository.settingDataBean.isSoundEffectOn = isOn
    }

    public setBgMusic(isOn: boolean): void {
        this.isBgMusicOn.next(isOn)
        this.localStorageRepository.settingDataBean.isBgMusicOn = isOn
    }

    public getSoundEffectVolume(): number {
        return this.soundEffectVolume
    }

    public getBgMusicVolume(): number {
        return this.bgMusicVolume
    }
}
