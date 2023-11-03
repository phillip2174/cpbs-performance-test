import { MinigameBonusBean } from "./MinigameBonusBean";


export class MinigameResultBean {
    public star: number;
    public list: MinigameBonusBean[] = [];

    constructor(star: number, list: MinigameBonusBean[]) {
        this.star = star;
        this.list = list;
    }
}
