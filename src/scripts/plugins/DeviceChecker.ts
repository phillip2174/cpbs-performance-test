import { Scene } from 'phaser'

export class DeviceChecker {
    private scene: Scene

    private static _instance: DeviceChecker

    private static getInstance() {
        if (!DeviceChecker._instance) {
            DeviceChecker._instance = new DeviceChecker()
        }
        return DeviceChecker._instance
    }

    static get instance(): DeviceChecker {
        return this.getInstance()
    }

    public doInit(scene: Scene) {
        this.scene = scene
    }

    public isDesktop(): boolean {
        return this.scene.sys.game.device.os.desktop
    }

    public isAppleOS(): boolean {
        return this.scene.sys.game.device.os.macOS || this.scene.sys.game.device.os.iOS
    }

    public isMacOS(): boolean {
        return this.scene.sys.game.device.os.macOS
    }
    public isiOS(): boolean {
        return this.scene.sys.game.device.os.iOS
    }
}
