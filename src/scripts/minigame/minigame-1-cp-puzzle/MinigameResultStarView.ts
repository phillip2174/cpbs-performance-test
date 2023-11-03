import { MinigameResultUIView } from './MinigameResultUIView';
import { ResourceLoader } from '../../plugins/resource-loader/ResourceLoader';
import { GameObjects, Geom, Scene, Textures, Math, Tweens } from 'phaser'
import { GameObjectConstructor } from '../../plugins/objects/GameObjectConstructor'
import { ResourceManager } from '../../plugins/resource-loader/ResourceManager';
import { MinigameCPPuzzleImageGroupView } from './MinigameCPPuzzleImageGroupView';
import { MinigameCPPuzzleImageGroupPod } from './MinigameCPPuzzleImageGroupPod';
import { Observable, Observer, tap } from 'rxjs';


export class MinigameResultStarView extends GameObjects.Container {

    private bg: GameObjects.Image
    private star: GameObjects.Image
    tween: Tweens.Tween;

    constructor(scene: Scene) {
        super(scene)
        GameObjectConstructor(scene, this)
    }

    public doInit(x: number, y: number): void {

        this.setPosition(x, y);
        this.bg = this.scene.add.image(0, 0, 'minigame-result-star-bg');
        this.add(this.bg);
        this.star = this.scene.add.image(0, -77.5, 'minigame-result-star');
        this.add(this.star);
        this.star.setVisible(false);
        this.showStar();

        ;
    }

    public showStar(): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            console.log("Create");
            this.tween = this.scene.tweens.add({
                targets: this.star,
                ease: `Sine.easeInOut`,
                duration: 600,
                props: {
                    scale: { from: 0, to: 1 }
                },
                onStart: (() => {
                    this.star.setVisible(true);
                }), onComplete: (() => {
                    observer.next()
                    observer.complete()

                }),
            })
        })
    }
}