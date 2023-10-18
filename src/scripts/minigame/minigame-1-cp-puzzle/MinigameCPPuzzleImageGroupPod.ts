import { BehaviorSubject } from 'rxjs';
import { Pod } from '../../plugins/objects/Pod'
import { MinigameCPPuzzleImageCellView } from './MinigameCPPuzzleImageCellView';
import { Math } from 'phaser'

export class MinigameCPPuzzleImageGroupPod extends Pod {

    canClick: boolean
    selectImage: MinigameCPPuzzleImageCellView;
    selectImagePositionIndex: BehaviorSubject<number> = new BehaviorSubject(undefined);
    positionIndexMap: Map<number, Phaser.Math.Vector2> = new Map<number, Phaser.Math.Vector2>();
    afterSwap: Function;

    public randomIndex(max: number): number[] {
        var arr = [...Array(max).keys()];
        arr = Math.RND.shuffle(arr);
        console.log(arr);
        return arr;
    }


    checkCorrectAllList(listCellIndex: number[]): boolean {
        var arr = [...Array(listCellIndex.length).keys()];
        if (this.areEqual(listCellIndex, arr)) {
            console.log("Win");
            this.canClick = false;
            return true;

        } else {
            console.log("Wrong" + "//" + listCellIndex)
            return false;
        }
    }

    areEqual(arr1, arr2): boolean {
        for (let index = 0; index < arr1.length; index++) {
            if (arr1[index] !== arr2[index]) {
                return false;
            }
        }
        return true;
    }


}
