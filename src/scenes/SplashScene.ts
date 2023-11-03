import { Scene } from 'phaser'
import { Subscription } from 'rxjs'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { UIUtil } from '../scripts/plugins/utils/UIUtil'
import { PodProvider } from '../scripts/pod/PodProvider'

export class SplashScene extends Scene {
    private userDataSubscription: Subscription
    constructor() {
        super({
            key: 'SplashScene',
        })
    }

    preload(): void {
        console.log('start SplashScene')
        this.initWindowEvents()
        this.loadAsset()
        this.loadUserData()
    }

    private loadAsset() {
        ResourceManager.instance.doInit(this)
        ResourceManager.instance.loadPackJson('bootAssetLoad', `assets/bootload.json`).subscribe()
        this.createLoader()
    }

    private createLoader(): void {
        this.load.on('complete', () => {
            this.onCompleteLoadBootAsset()
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
        let userPod = PodProvider.instance.userPod
        this.userDataSubscription = userPod.getUserBean().subscribe((_) => {
            userPod.checkFirstLoginOfTheDay()
            this.userDataSubscription?.unsubscribe()
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
