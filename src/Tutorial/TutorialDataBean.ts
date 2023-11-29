import { TutorialButtonDataBean } from './TutorialButtonDataBean'

export class TutorialDataBean {
    public tutorialID: number
    public characterImageKey: string
    public contentImageKey: string
    public headerText: string[]
    public desc1Text: string[]
    public desc2Text: string[]
    public tutorialButtonDataBean: TutorialButtonDataBean[]
    public tutorialButtonGuestDataBean: TutorialButtonDataBean[]

    constructor(
        tutorialID: number,
        characterImageKey: string,
        contentImageKey: string,
        headerText: string[],
        desc1Text: string[],
        desc2Text: string[],
        tutorialButtonDataBean: TutorialButtonDataBean[],
        tutorialButtonGuestDataBean: TutorialButtonDataBean[]
    ) {
        this.tutorialID = tutorialID
        this.characterImageKey = characterImageKey
        this.contentImageKey = contentImageKey
        this.headerText = headerText
        this.desc1Text = desc1Text
        this.desc2Text = desc2Text
        this.tutorialButtonDataBean = tutorialButtonDataBean
        this.tutorialButtonGuestDataBean = tutorialButtonGuestDataBean
    }
}
