export class TutorialButtonDataBean {
    public buttonText: string
    public buttonColorCode: string
    public buttonWidth: number

    constructor(buttonText: string, buttonColorCode: string, buttonWidth: number, buttonID: number) {
        this.buttonText = buttonText
        this.buttonColorCode = buttonColorCode
        this.buttonWidth = buttonWidth
    }
}
