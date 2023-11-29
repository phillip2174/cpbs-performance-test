export class IngredientDesc {
    public title: string
    public amount: string
    public unit: string
    public isCPProduct: boolean

    constructor(title: string, amount: string, unit: string, isCPProduct: boolean) {
        this.title = title
        this.amount = amount
        this.unit = unit
        this.isCPProduct = isCPProduct
    }
}
