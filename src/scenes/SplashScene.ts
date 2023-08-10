import { Scene } from "phaser";
import { UIUtil } from "../scripts/plugins/utils/UIUtil";
import { timer } from "rxjs";
import { ResourceManager } from "../scripts/plugins/resource-loader/ResourceManager";

export class SplashScene extends Scene{
    constructor(){
        super({
            key : 'SplashScene'
        })
    }

    preload(): void {
        console.log("start SplashScene")
        this.initWindowEvents()
        this.loadAsset()
    }

    private loadAsset(){
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
        this.setGameCanvasSize()
        // window.onresize = () => {
        //     timer(100).subscribe((_) => {
        //         //this.game.scale.setParentSize(UIUtil.parentWidth, UIUtil.parentHeight)
        //        this.setGameCanvasSize()
        //     })
        // }
    }

    private onCompleteLoadBootAsset(): void {
        this.hiddenFirstLoading()
        this.setGameCanvasSize()
        this.scene.start(`SplashLoaddingScene`)
    }

    private setGameCanvasSize(): void {
        const w = UIUtil.getCanvasWidth()
        const h = UIUtil.getCanvasHeight()
        this.scale.setGameSize(w, h)
        this.scale.refresh()
        UIUtil.initialize(this.cameras.main.width, this.cameras.main.height)
        UIUtil.innerHeight = window.innerHeight
        UIUtil.parentWidth = this.scale.parentSize.width
        UIUtil.parentHeight = this.scale.parentSize.height
    }

    private hiddenFirstLoading(): void {
        let loading = window.document.getElementById('loading-container')
        if (loading != null) loading.remove()
    }
}