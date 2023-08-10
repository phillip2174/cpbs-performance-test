export class ErrorObject extends Error {
    code: string
    message: string

    constructor(code: string) {
        super(code)
        this.code = code
    }
}
