import { GameObjects } from "phaser";
import { GameObjectConstructor } from "../objects/GameObjectConstructor";
import { IPoolObject } from "./IPoolObject";

export class ParticlePoolObject extends GameObjects.Rectangle implements IPoolObject {
    public IsSetParameter: boolean = false;

    private emitter: GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        GameObjectConstructor(this.scene, this);
        this.setAlpha(0);
    }

    public setParticleParameter(particleParameter: object, particleEmitterManager: GameObjects.Particles.ParticleEmitterManager): void {
        if(!this.IsSetParameter)
        {
            this.emitter = particleEmitterManager.createEmitter(particleParameter);
            this.stopParticle();
            this.IsSetParameter = true;
        }
    }

    public doInit(): void {
        this.setActive(true);
        this.setVisible(true);
    }

    public startFlow(frequency: number, count: number = 1): void {
        this.emitter.flow(frequency, count);
    }

    public startExplode(count: number, x: number, y: number): void {
        this.emitter.explode(count, x, y);
    }

    public stopParticle(): void {
        this.emitter.stop();
    }

    public followTarget(target: GameObjects.GameObject, offsetX: number = 0, offsetY: number = 0): void {
        this.emitter.startFollow(target, offsetX, offsetY);
    }

    public stopFollowTarget(): void {
        this.emitter.stopFollow();
    }

    public hideObject(): void {
        this.stopParticle();
        this.stopFollowTarget();
        this.setActive(false);
        this.setVisible(false);
    }
}