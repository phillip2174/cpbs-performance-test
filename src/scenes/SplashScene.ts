import { Scene } from 'phaser'
import { Subscription, concatMap } from 'rxjs'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { UIUtil } from '../scripts/plugins/utils/UIUtil'
import { PodProvider } from '../scripts/pod/PodProvider'
import { DeviceChecker } from '../scripts/plugins/DeviceChecker'
import { UrlManager } from '../scripts/plugins/url-manager/UrlManager'
import { UserType } from '../scripts/User/UserType'

export class SplashScene extends Scene {
    private userDataSubscription: Subscription
    constructor() {
        super({
            key: 'SplashScene',
        })
    }

    preload(): void {
        console.log('start SplashScene')
        DeviceChecker.instance.doInit(this)
        this.add
            .rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2b2b2b, 1)
            .setOrigin(0)
            .setInteractive()

        this.initWindowEvents()
        this.loadAsset()

        // @ts-ignore: Unreachable code error
        PodProvider.instance.audioManager.doInit(
            // @ts-ignore: Unreachable code error
            this.game.bgmAudioManager,
            // @ts-ignore: Unreachable code error
            this.game.sfxAudioManager,
            // @ts-ignore: Unreachable code error
            this.game.ambientAudioManager
        )
    }

    private loadAsset() {
        ResourceManager.instance.doInit(this)
        ResourceManager.instance.loadPackJson('bootAssetLoad', `assets/bootload.json`).subscribe()
        this.createLoader()
    }

    private createLoader(): void {
        this.load.on('complete', () => {
            let url = UrlManager.getParam()
            console.log(url)

            if (url.userType != undefined || url.userType != null) {
                console.log(url.userType)
                const userPod = PodProvider.instance.userPod
                userPod.userLoginType = UserType[url.userType]
            }

            const tutorialManager = PodProvider.instance.tutorialManager
            tutorialManager.getTutorialData(false)

            if (url.isCompletedTutorial != null || url.isCompletedTutorial != undefined) {
                console.log(url.isCompletedTutorial)
                tutorialManager.getTutorialData(
                    true,
                    tutorialManager.isCompletedTutorial()
                        ? tutorialManager.isCompletedTutorial()
                        : JSON.parse(url.isCompletedTutorial)
                )
            } else {
                tutorialManager.getTutorialData(false)
            }

            this.loadUserData()
        })
    }

    private initWindowEvents() {
        // this.setGameCanvasSize()
        // window.onresize = () => {
        //     timer(100).subscribe((_) => {
        //         //this.game.scale.setParentSize(UIUtil.parentWidth, UIUtil.parentHeight)
        //        this.setGameCanvasSize()
        //     })
        // }
    }

    private loadUserData(): void {
        const userPod = PodProvider.instance.userPod

        this.userDataSubscription = userPod
            .getUserBean()
            .pipe(
                concatMap((_) => userPod.getUserCPPoint()),
                concatMap((_) =>
                    ResourceManager.instance.loadTexture('user-profile-button-icon', userPod.userBean.profileImageUrl)
                )
            )
            .subscribe((_) => {
                userPod.checkFirstLoginOfTheDay()
                this.userDataSubscription?.unsubscribe()
                this.onCompleteLoadBootAsset()
            })
    }

    private onCompleteLoadBootAsset(): void {
        this.hiddenFirstLoading()

        this.scene.start(`SplashLoaddingScene`)
    }

    private hiddenFirstLoading(): void {
        let loading = window.document.getElementById('loading-container')
        if (loading != null) loading.remove()
    }
    normalize(val: number, min: number, max: number): number {
        return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
    }

    inverseNormalize(normalizeVal: number, min: number, max: number): number {
        return +(normalizeVal * (max - min) + min).toFixed(2)
    }

    normalizeNoLimit(val: number, min: number, max: number): number {
        return +((val - min) / (max - min)).toFixed(2)
    }
}
