import { GameObjects, Scene } from "phaser";

export function GameObjectConstructor(
    scene: Scene,
    gameObject: GameObjects.GameObject,
    addScene: boolean = true
) {
    if (addScene) scene.add.existing(gameObject);

    scene.events.on("shutdown", () => {
        gameObject.destroy(true);
    });
}
