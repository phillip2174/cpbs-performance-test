import { Observable, Observer } from 'rxjs'
export class ResourceLoader {
    scene: Phaser.Scene

    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    doInit(scene: Phaser.Scene): void {
        this.scene = scene
    }

    loadImage(imageKey: string, imagePath: string): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            if (this.scene.textures.exists(imageKey)) {
                observer.next(imageKey)
                observer.complete()
            } else {
                this.scene.load.once('complete', () => {
                    observer.next(imageKey)
                    observer.complete()
                })

                this.scene.load.image(imageKey, imagePath)
                this.scene.load.start()
            }
        })
    }

    loadSpriteSheet(
        imageKey: string,
        imagePath: string,
        frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig
    ): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            if (this.scene.textures.exists(imageKey)) {
                observer.next(imageKey)
                observer.complete()
            } else {
                this.scene.load.once('complete', () => {
                    observer.next(imageKey)
                    observer.complete()
                })

                this.scene.load.spritesheet(imageKey, imagePath, frameConfig)
                this.scene.load.start()
            }
        })
    }

    loadPackJson(scene: Phaser.Scene, jsonName: string, jsonPath: string): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            if (this.scene.cache.json.has(jsonName)) {
                observer.next(jsonName)
                observer.complete()
            } else {
                this.scene.load.once('complete', () => {
                    observer.next(jsonName)
                    observer.complete()
                })
                scene.load.pack(jsonName, jsonPath, jsonName)
                scene.load.json(jsonName, jsonPath)
                this.scene.load.start()
            }
        })
    }

    loadJson(key: string, path: string): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.scene.load.once('complete', () => {
                observer.next(key)
                observer.complete()
            })
            this.scene.load.json(key, path)
            this.scene.load.start()
        })
    }

    loadText(key: string, path: string): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            if (this.scene.cache.text.has(key)) {
                observer.next(key)
                observer.complete()
            } else {
                let loader = new Phaser.Loader.LoaderPlugin(this.scene)
                loader.text(key, path)

                loader.once(Phaser.Loader.Events.COMPLETE, () => {
                    observer.next(key)
                    observer.complete()
                })

                loader.start()
            }
        })
    }

    loadSpine(spinePath: string, spineKey: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            if (this.scene.textures.exists(spineKey + '.png')) {
                observer.next(spineKey)
                observer.complete()
            } else {
                this.scene.load.once('complete', () => {
                    this.clearPath()
                    observer.next(spineKey)
                    observer.complete()
                })

                this.scene.load.setPath(spinePath)

                // @ts-ignore
                this.scene.load.spine(spineKey, spineKey + '.json', spineKey + '.atlas', true)

                this.scene.load.start()
            }
        })
    }

    clearPath(): void {
        this.scene.load.setBaseURL(``)
        this.scene.load.setPath()
    }
}
