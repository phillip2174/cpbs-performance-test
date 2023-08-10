import { GameObjects } from "phaser";

export class Matrix {
    rotation: number;
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
}


export function getWorldPosition(
    gameObject: any ,
) : Matrix {
    var tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
    var tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
    gameObject.getWorldTransformMatrix(tempMatrix, tempParentMatrix);
    return  tempMatrix.decomposeMatrix() as (Matrix);
}
