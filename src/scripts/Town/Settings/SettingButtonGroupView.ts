import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { TownUIButtonType } from '../Type/TownUIButtonType'
import { SettingButtonView } from './SettingButtonView'
import { PodProvider } from '../../pod/PodProvider'
import { RepositoryProvider } from '../../Repository/RepositoryProvider'

export class SettingButtonGroupView extends GameObjects.Container {
    private notificationsButton: SettingButtonView
    private guideButton: SettingButtonView
    private soundEffectButton: SettingButtonView
    private bgMusicButton: SettingButtonView

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.setPosition(x, y)

        this.notificationsButton = new SettingButtonView(this.scene)
        this.notificationsButton.doInit(-70, -60, 'mail', TownUIButtonType.Notification, 'Notifications')
        this.notificationsButton.onClick(() => {
            PodProvider.instance.townUIButtonNotificationManager.setNotificationIsUpdate(false)
        })

        this.guideButton = new SettingButtonView(this.scene)
        this.guideButton.doInit(60, -60, 'guide', TownUIButtonType.Guide, 'Guide')

        this.soundEffectButton = new SettingButtonView(this.scene)
        this.soundEffectButton.doInit(-70, 90, 'sound-effect-on', TownUIButtonType.SoundEffect, 'Sound Effect')
        this.soundEffectButton.onClick(() => {
            this.soundEffectButton.setButtonToggle('sound-effect')
            RepositoryProvider.instance.localStorageRepository.saveSettingData()
        })

        this.bgMusicButton = new SettingButtonView(this.scene)
        this.bgMusicButton.doInit(60, 90, 'bg-music-on', TownUIButtonType.BGMusic, 'BG Music')
        this.bgMusicButton.onClick(() => {
            this.bgMusicButton.setButtonToggle('bg-music')
            RepositoryProvider.instance.localStorageRepository.saveSettingData()
        })

        this.add([this.notificationsButton, this.guideButton, this.soundEffectButton, this.bgMusicButton])
    }
}
