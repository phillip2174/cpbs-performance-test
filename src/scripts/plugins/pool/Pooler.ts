import { GameObjects } from "phaser";
import { GameObjectConstructor } from "../objects/GameObjectConstructor";

export class Pooler extends GameObjects.GameObject {
    private poolerName: string;
    private poolerID: number;

    private poolGroup: Phaser.GameObjects.Group;

    public doInit(poolID: number): void {
        GameObjectConstructor(this.scene, this);
        this.poolerID = poolID;
    }

    public getPoolerName(): string {
        return this.poolerName;
    }

    public getPoolerID(): number {
        return this.poolerID;
    }

    public setPoolProperties(poolName: string, poolConfig: Phaser.Types.GameObjects.Group.GroupConfig ): void {
        this.poolerName = poolName;
        this.poolGroup = this.scene.add.group(poolConfig);
    }

    public getPoolGroup(): Phaser.GameObjects.Group {
        return this.poolGroup;
    }
}
