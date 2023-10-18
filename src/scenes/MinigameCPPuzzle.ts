import { delay, timer, Subscription, timeInterval, interval, take } from 'rxjs';
import { Scene } from 'phaser'
import { ResourceManager } from '../scripts/plugins/resource-loader/ResourceManager'
import { MinigameCPPuzzleImageGroupView } from '../scripts/minigame/minigame-1-cp-puzzle/MinigameCPPuzzleImageGroupView'

export class MinigameCPPuzzleScene extends Scene {
    minigameCPPuzzlePreviewImage: MinigameCPPuzzleImageGroupView


    constructor() {
        super({
            key: 'MinigameCPPuzzle',
        })
    }

    preload(): void {
        console.log('start MinigameCPPuzzle')
        ResourceManager.instance.setResourceLoaderScene(this)
        this.minigameCPPuzzlePreviewImage = new MinigameCPPuzzleImageGroupView(this);

    }

    create(): void {
        this.minigameCPPuzzlePreviewImage.doInit().subscribe(_ => {
            timer(3000).subscribe(_ => {
                this.minigameCPPuzzlePreviewImage.shuffleImage(5);
            });
        });
    }


    update() {
        this.minigameCPPuzzlePreviewImage.onUpdate();
    }
}
