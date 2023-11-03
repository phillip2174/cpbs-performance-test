export class MinigameBonusBean {
    public isCoin : boolean
    public id: number
    public amount: number

    constructor(isCoin : boolean, id : number,amount : number)
    {   
        this.isCoin = isCoin
        this.id = id
        this.amount = amount
    }
}


