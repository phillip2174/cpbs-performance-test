import { MinigameResultUIView } from './MinigameResultUIView'
import { ResourceLoader } from '../plugins/resource-loader/ResourceLoader'
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'
import { MinigameCPPuzzleImageGroupPod } from './minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupPod'
import { Observable, Observer, tap } from 'rxjs'
import { PodProvider } from '../pod/PodProvider'
import { AudioManager } from '../Audio/AudioManager'

export class MinigameResultStarView extends GameObjects.Container {
    private bg: GameObjects.Image
    private star: GameObjects.Image

    private audioManager: AudioManager

    tween: Tweens.Tween

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {
        this.audioManager = PodProvider.instance.audioManager

        this.setPosition(x, y)
        this.bg = this.scene.add.image(0, 0, 'minigame-result-star-bg')
        this.add(this.bg)
        this.star = this.scene.add.image(0, -77.5, 'minigame-result-star')
        this.add(this.star)
        this.star.setVisible(false)
    }

    public showStar(starIndex: number): Observable<void> {
        this.star.setScale(0)
        return new Observable((observer: Observer<void>) => {
            this.tween = this.scene.tweens.add({
                targets: this.star,
                ease: `Sine.easeInOut`,
                duration: 300,
                props: {
                    scale: { from: 0, to: 1 },
                },
                onStart: () => {
                    this.star.setVisible(true)

                    switch(starIndex) {
                        case 0:
                            this.audioManager.playSFXSound('star_01_sfx')
                            break;
                        case 1:
                            this.audioManager.playSFXSound('star_02_sfx')
                            break;
                        case 2:
                            this.audioManager.playSFXSound('star_03_sfx')
                            break;
                        default:
                            this.audioManager.playSFXSound('star_01_sfx')
                            break;
                    }
                },
                onComplete: () => {
                    observer.next()
                    observer.complete()
                },
            })
        })
    }

    public hideStar(): void {
        this.star.setScale(0)
    }
}
