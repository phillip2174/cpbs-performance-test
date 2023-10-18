import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { PodProvider } from '../../pod/PodProvider'
import { TextAdapter } from '../../text-adapter/TextAdapter'
import { TownUIButtonView } from '../TownUIButtonView'
import { TownUIButtonType } from '../Type/TownUIButtonType'
import { AudioManager } from './../../Audio/AudioManager'

export class SettingButtonView extends GameObjects.Container {
    private uiButton: TownUIButtonView
    private buttonText: GameObjects.Text
    private buttonType: TownUIButtonType
    private audioManager: AudioManager

    private isToggleOn: boolean = true

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number, iconKey: string, buttonType: TownUIButtonType, buttonText: string): void {
        this.audioManager = PodProvider.instance.audioManager
        this.buttonType = buttonType
        this.setPosition(x, y)
        this.uiButton = new TownUIButtonView(this.scene)
        this.uiButton.doInit(0, 0, iconKey, buttonType, '', 1000, false)
        if (buttonType != TownUIButtonType.Notification) {
            this.uiButton.hideNotification()
        }
        this.buttonText = TextAdapter.instance
            .getVectorText(this.scene, 'DB_HeaventRounded')
            .setText(buttonText)
            .setOrigin(0.5)
            .setPosition(0, 65)
            .setStyle({ fill: '#585858', fontSize: 24 })
        this.add([this.uiButton, this.buttonText])
        switch (this.buttonType) {
            case TownUIButtonType.SoundEffect:
                this.setButtonToggleOnInit(this.audioManager.getIsSoundEffectOn(), 'sound-effect')
                break
            case TownUIButtonType.BGMusic:
                this.setButtonToggleOnInit(this.audioManager.getIsBgMusicOn(), 'bg-music')
                break
        }
    }

    public onClick(callback: Function, holdCallback: Function = null): void {
        this.uiButton.onClick(callback, holdCallback)
    }

    public setButtonToggle(iconKey: string): void {
        this.isToggleOn = !this.isToggleOn
        switch (this.buttonType) {
            case TownUIButtonType.SoundEffect:
                this.setupButtonIcon(iconKey)
                this.audioManager.setSoundEffect(this.isToggleOn)
                break
            case TownUIButtonType.BGMusic:
                this.setupButtonIcon(iconKey)
                this.audioManager.setBgMusic(this.isToggleOn)
                break
        }
    }

    private setupButtonIcon(iconKey: string) {
        this.isToggleOn ? this.uiButton.setButtonIcon(iconKey + '-on') : this.uiButton.setButtonIcon(iconKey + '-off')
    }

    private setButtonToggleOnInit(isOn: boolean, iconKey: string): void {
        this.isToggleOn = isOn
        switch (this.buttonType) {
            case TownUIButtonType.SoundEffect:
                this.setupButtonIcon(iconKey)
                break
            case TownUIButtonType.BGMusic:
                this.setupButtonIcon(iconKey)
                break
        }
    }
}
