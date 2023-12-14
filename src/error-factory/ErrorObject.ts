export class ErrorObject extends Error {
    code: string
    header: string
    message: string

    constructor(code: string) {
        super(code)
        this.code = code
    }
}
