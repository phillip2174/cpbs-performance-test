export class MinigameCPGuessChoiceBean {
    public imageUrl: string
    public isAnswer: boolean

    constructor(imageUrl: string, isAnswer: boolean) {
        this.imageUrl = imageUrl
        this.isAnswer = isAnswer
    }
}
