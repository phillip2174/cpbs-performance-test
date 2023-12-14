import { GameObjects, Scene } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { TownDayNightPod } from '../pod/TownDayNightPod'
import { TownTimeState } from './Type/TownTimeState'
import { PodProvider } from '../pod/PodProvider'
import { CountdownTimerPod } from '../pod/CountdownTimerPod'
import { AlertDialogue } from '../alert-dialogue/AlertDialogue'
import { GameConfig } from '../GameConfig'
import { CameraControlPod } from '../camera/CameraControlPod'

export class TownDayNightView extends GameObjects.GameObject {
    private nightLights: GameObjects.PointLight[] = []
    private rightBuildingBehindLight_01: GameObjects.PointLight
    private rightBuildingBehindLight_02: GameObjects.PointLight
    private rightBuildingBehindLight_03: GameObjects.PointLight
    private rightBuildingGroundLight_01: GameObjects.PointLight
    private rightBuildingGroundLight_02: GameObjects.PointLight
    private rightBuildingGroundLight_03: GameObjects.PointLight
    private leftBuildingBehindLight_01: GameObjects.PointLight
    private leftBuildingBehindLight_02: GameObjects.PointLight
    private hotdogGroundLight_01: GameObjects.PointLight
    private townDayNightPod: TownDayNightPod
    private countdownTimerPod: CountdownTimerPod
    private cameraPod: CameraControlPod
    constructor(scene: Scene) {
        super(scene, 'gameObject')
        GameObjectConstructor(scene, this)
    }

    private setupSubscribe(): void {
        this.townDayNightPod.townTimeState.subscribe((state) => {
            if (this.nightLights.length == 0 && state == TownTimeState.Night) {
                //this.setupNightLights()
            }

            if (!GameConfig.IS_MOCK_DAY_NIGHT) {
                this.countdownTimerPod.getCurrentTownTimeStateByTimeStamp().subscribe((timeState) => {
                    if (timeState != state) {
                        this.townDayNightPod.setTownTimeState(timeState)
                        this.ShowReloadPopup()
                        return
                    }
                    switch (state) {
                        case TownTimeState.Day:
                            this.ToggleOnOffNightLights(false)
                            break
                        case TownTimeState.Night:
                            this.ToggleOnOffNightLights(true)
                            break
                    }
                })
            } else {
                switch (state) {
                    case TownTimeState.Day:
                        this.ToggleOnOffNightLights(false)
                        break
                    case TownTimeState.Night:
                        this.ToggleOnOffNightLights(true)
                        break
                }
            }
        })
    }

    private ShowReloadPopup(): void {
        this.cameraPod.setInteractCamera(false)
    }

    private setupNightLights(): void {
        this.rightBuildingBehindLight_01 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX + 670,
                this.scene.cameras.main.centerY - 225,
                0xe5f337,
                350,
                0.1,
                0.1
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingBehindLight_01)

        this.rightBuildingBehindLight_02 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX + 420,
                this.scene.cameras.main.centerY - 400,
                0xe5f337,
                350,
                0.1,
                0.1
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingBehindLight_02)

        this.rightBuildingBehindLight_03 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX + 10,
                this.scene.cameras.main.centerY - 505,
                0xe5f337,
                350,
                0.1,
                0.1
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingBehindLight_03)

        this.rightBuildingGroundLight_01 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX + 700,
                this.scene.cameras.main.centerY + 310,
                0xe5f337,
                350,
                0.15,
                0.05
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingGroundLight_01)

        this.rightBuildingGroundLight_02 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX + 435,
                this.scene.cameras.main.centerY + 450,
                0xe5f337,
                350,
                0.15,
                0.05
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingGroundLight_02)

        this.rightBuildingGroundLight_03 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX - 35,
                this.scene.cameras.main.centerY + 180,
                0xe5f337,
                350,
                0.18,
                0.05
            )
            .setDepth(2)
        this.nightLights.push(this.rightBuildingGroundLight_03)

        this.leftBuildingBehindLight_01 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX - 320,
                this.scene.cameras.main.centerY - 230,
                0xe5f337,
                350,
                0.1,
                0.1
            )
            .setDepth(2)
        this.nightLights.push(this.leftBuildingBehindLight_01)

        this.leftBuildingBehindLight_02 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX - 680,
                this.scene.cameras.main.centerY - 65,
                0xe5f337,
                350,
                0.1,
                0.1
            )
            .setDepth(2)
        this.nightLights.push(this.leftBuildingBehindLight_02)

        this.hotdogGroundLight_01 = this.scene.add
            .pointlight(
                this.scene.cameras.main.centerX - 740,
                this.scene.cameras.main.centerY + 355,
                0xe5f337,
                350,
                0.18,
                0.05
            )
            .setDepth(2)
        this.nightLights.push(this.hotdogGroundLight_01)
    }

    private ToggleOnOffNightLights(isOn: boolean): void {
        this.nightLights.forEach((nightLight) => {
            nightLight.setActive(isOn)
            nightLight.setVisible(isOn)
        })
    }

    public doInit(): void {
        this.cameraPod = PodProvider.instance.cameraControlPod
        this.townDayNightPod = PodProvider.instance.townDayNightPod
        this.townDayNightPod.doInit()
        this.countdownTimerPod = PodProvider.instance.countdownTimerPod
        this.setupSubscribe()
    }
}
