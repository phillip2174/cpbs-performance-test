import { Observable, Observer } from 'rxjs'
import { SpineConfig } from '../spineConfig'
import { ResourceLoader } from './ResourceLoader'

export class ResourceManager {
    loader: ResourceLoader

    private static _instance: ResourceManager

    private scene: Phaser.Scene

    private static getInstance() {
        if (!ResourceManager._instance) {
            ResourceManager._instance = new ResourceManager()
        }

        return ResourceManager._instance
    }

    static get instance(): ResourceManager {
        return this.getInstance()
    }

    doInit(scene: Phaser.Scene): void {
        this.scene = scene
        this.loader = new ResourceLoader(this.scene)
        this.loader.doInit(this.scene)
    }

    setResourceLoaderScene(scene: Phaser.Scene): void {
        this.scene = scene
        this.loader.doInit(this.scene)
    }

    loadPackJsonInPreload(key: string, path: string): void {
        this.scene.load.pack(key, path, key)
    }

    loadPackJson(key: string, path: string): Observable<string> {
        return Observable.create((obs: Observer<string>) => {
            this.loader
                .loadPackJson(this.scene, key, path)
                .subscribe((keyList) => {
                    obs.next(key)
                    obs.complete()
                })
        })
    }

    loadTexture(imageKey: string, imagePath: string): Observable<string> {
        return Observable.create((obs: Observer<string>) => {
            this.loader.loadImage(imageKey, imagePath).subscribe((path) => {
                obs.next(path)
                obs.complete()
            })
        })
    }

    loadSpriteSheet(imageKey: string, imagePath: string, frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig): Observable<string> {
        return Observable.create((obs: Observer<string>) => {
            this.loader.loadSpriteSheet(imageKey, imagePath, frameConfig).subscribe((path) => {
                obs.next(path)
                obs.complete()
            })
        })
    }


    loadJson(key: string, path: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.loader.loadJson(key, path).subscribe((keyResult: string) => {
                let jsonString = this.scene.cache.json.get(keyResult)
                observer.next(jsonString)
                observer.complete()
            })
        })
    }

    loadText(key: string, path: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.loader.loadText(key, path).subscribe((keyResult: string) => {
                let jsonString = this.scene.cache.text.get(keyResult)
                observer.next(jsonString)
                observer.complete()
            })
        })
    }

    loadSpine(scene: Phaser.Scene, spineConfig: SpineConfig, isTest: boolean = false): Observable<any> {
        return Observable.create((obs: Observer<any>) => {
            if (!isTest) {
                this.loader.loadSpine(spineConfig.path, spineConfig.key).subscribe((key: string) => {
                    //@ts-ignore
                    let spine: SpineGameObject = scene.add.spine(spineConfig.x,
                        spineConfig.y,
                        key,
                        spineConfig.startAnimation,
                        spineConfig.isLooping);

                    spine.setDepth(1);

                    obs.next(spine);
                    obs.complete();
                });
            } else {
                this.loader.loadSpine(`coin-pro`, spineConfig.key).subscribe((key: string) => {
                    //@ts-ignore
                    let spine: SpineGameObject = scene.add.spine(spineConfig.x,
                        spineConfig.y,
                        key,
                        spineConfig.startAnimation,
                        spineConfig.isLooping);
                    spine.setDepth(9);
                    obs.next(spine);
                    obs.complete();
                });
            }
        });

    }
}
