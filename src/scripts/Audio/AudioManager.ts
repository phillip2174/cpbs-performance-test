import { BehaviorSubject } from 'rxjs'
import { RepositoryProvider } from '../Repository/RepositoryProvider'
import { LocalStorageRepository } from './../Repository/LocalStorageRepository'

export class AudioManager {
    private scene: Phaser.Scene

    private lastBGMKey: string

    private bgmSoundManager: Phaser.Sound.BaseSoundManager
    private sfxSoundManager: Phaser.Sound.BaseSoundManager
    private ambientSoundManager: Phaser.Sound.BaseSoundManager

    private isSoundEffectOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    private isBgMusicOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)

    private soundEffectVolume: number = 1
    private bgMusicVolume: number = 1
    private localStorageRepository: LocalStorageRepository

    private bgmSound: Phaser.Sound.BaseSound
    private ambientSound: Phaser.Sound.BaseSound

    public doInit(bgmSoundManager:Phaser.Sound.BaseSoundManager, sfxSoundManager: Phaser.Sound.BaseSoundManager, ambientSoundManager: Phaser.Sound.BaseSoundManager): void {
        this.bgmSoundManager = bgmSoundManager
        this.sfxSoundManager = sfxSoundManager
        this.ambientSoundManager = ambientSoundManager

        this.localStorageRepository = RepositoryProvider.instance.localStorageRepository
        this.localStorageRepository.getSettingData()
        this.setSoundEffect(this.localStorageRepository.settingDataBean.isSoundEffectOn)
        this.setBgMusic(this.localStorageRepository.settingDataBean.isBgMusicOn)
        
        this.isSoundEffectOn.subscribe((isOn) => {
            this.soundEffectVolume = isOn ? 1 : 0

            if(this.sfxSoundManager != undefined)
                this.sfxSoundManager.mute = !isOn

            if(this.ambientSoundManager != undefined)
                this.ambientSoundManager.mute = !isOn
        })

        this.isBgMusicOn.subscribe((isOn) => {
            this.bgMusicVolume = isOn ? 1 : 0

            if(this.bgmSoundManager != undefined)
            this.bgmSoundManager.mute = !isOn
        })

        if (localStorage.getItem('settingData') == null || localStorage.getItem('settingData') == undefined)
            this.localStorageRepository.saveSettingData()
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

    public playBGMSound(key: string, isForceStart: boolean = false): Phaser.Sound.BaseSound {
        if(isForceStart == false && this.bgmSound != undefined && this.bgmSound.key == key) return;
        if (this.bgmSound != undefined) this.bgmSound.destroy()
        const config: Phaser.Types.Sound.SoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        }

        this.bgmSound = this.bgmSoundManager.add(key, config)
        this.bgmSound.play()

        return this.bgmSound
    }

    public stopBGMSound() {
        if (this.bgmSound != undefined) {
            this.bgmSound.destroy()
            this.bgmSound = undefined
        }
    }

    public playAmbientSound(key: string, isForceStart: boolean = false): Phaser.Sound.BaseSound {
        if(isForceStart == false && this.ambientSound != undefined && this.ambientSound.key == key) return;
        if (this.ambientSound != undefined) this.ambientSound.destroy()
        const config: Phaser.Types.Sound.SoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        }

        this.ambientSound = this.ambientSoundManager.add(key, config)
        this.ambientSound.play()

        return this.ambientSound
    }

    public stopAmbientSound() {
        if (this.ambientSound != undefined){
            this.ambientSound.destroy()
            this.ambientSound = undefined
        } 
    }

    playSFXSound(key: string, isLoop: boolean = false) {
        const config: Phaser.Types.Sound.SoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: isLoop,
            delay: 0,        
        }

        this.sfxSoundManager.play(key, config)
    }

    createSFXSoundObject(key: string, isLoop: boolean = false): Phaser.Sound.BaseSound {
        const config: Phaser.Types.Sound.SoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: isLoop,
            delay: 0,        
        }

        const sfx = this.sfxSoundManager.add(key, config)
        return sfx
    }
}
