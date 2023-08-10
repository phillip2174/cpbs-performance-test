import { GameObjects, Scene } from "phaser";
import { GameObjectConstructor } from "../objects/GameObjectConstructor";
import { Pooler } from "./Pooler";

export class PoolManager {
    private static _instance: PoolManager;

    private static getInstance() {
        if (!PoolManager._instance) {
            PoolManager._instance = new PoolManager();
        }

        return PoolManager._instance;
    }

    static get instance(): PoolManager {
        return this.getInstance();
    }

    private poolerList: Pooler[];
    private scene: Phaser.Scene;

    public doInit(scene: Scene): void {
        this.poolerList = [];
        this.scene = scene;
    }

    public isHavePoolerGroupWithName(poolName: string): boolean {
        return this.poolerList.some((pool) => pool.getPoolerName() == poolName);
    }

    public getPoolerGroupWithName(poolName: string): Phaser.GameObjects.Group {
        return this.poolerList
            .find((pool) => pool.getPoolerName() == poolName)
            .getPoolGroup();
    }

    public getPoolerGroupWithUID(poolID: number): Phaser.GameObjects.Group {
        return this.poolerList
            .find((pool) => pool.getPoolerID() == poolID)
            .getPoolGroup();
    }

    public createPooler(poolName: string, poolConfig: object): Pooler {
        var newPool = new Pooler(this.scene, "gameObject");
        newPool.doInit(this.poolerList.length + 1);
        this.poolerList.push(newPool);
        newPool.setPoolProperties(poolName, poolConfig);
        return newPool;
    }
}
