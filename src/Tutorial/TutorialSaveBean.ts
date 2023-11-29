export class TutorialSaveBean {
    public currentCheckPointID: number
    public isCompletedTutorial: boolean

    constructor(currentCheckPointID: number, isCompletedTutorial: boolean) {
        this.currentCheckPointID = currentCheckPointID
        this.isCompletedTutorial = isCompletedTutorial
    }
}
