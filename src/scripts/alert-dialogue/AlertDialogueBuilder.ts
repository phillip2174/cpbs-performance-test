import { Scene } from 'phaser'
import { AlertDialogueView } from './AlertDialogueView'
export class AlertDialogueBuilder {
    static alertDialogueView: AlertDialogueView

    static create(scene: Scene, callBackOnShow: Function, callBackOnHide: Function): AlertDialogueBuilder {
        let dialogueBuilder = new AlertDialogueBuilder()
        AlertDialogueBuilder.alertDialogueView = new AlertDialogueView(scene, callBackOnShow, callBackOnHide)
        return dialogueBuilder
    }

    static getAlertDialogue(): AlertDialogueView {
        return this.alertDialogueView
    }

    setDescription(description: string): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createDescriptionText(description)
        return this
    }

    setIcon(isShowIcon: boolean = false): AlertDialogueBuilder {
        if (isShowIcon) AlertDialogueBuilder.alertDialogueView.createIconAlert()
        return this
    }

    handleContentPosition(): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.handleContentPosition()
        return this
    }

    addActionDimButton(onClickCallback?: () => any): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.addActionDimButton(onClickCallback)
        return this
    }

    getIcon() {
        return AlertDialogueBuilder.alertDialogueView.getIcon()
    }

    setDescriptionAlign(align: string) {
        AlertDialogueBuilder.alertDialogueView.descriptionText.setAlign(align)
        return this
    }

    setHeader(header: string): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createHeaderText(header)
        return this
    }

    getHeader() {
        return AlertDialogueBuilder.alertDialogueView.getHeader()
    }

    setYesButton(onClickCallback?: () => any, textInButton: string = ``): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createYesButton(onClickCallback, textInButton)
        return this
    }

    setNoButton(onClickCallback?: () => any, textInButton: string = ``): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createNoButton(onClickCallback, textInButton)
        return this
    }

    setConfirmButton(onClickCallback?: () => any, textInButton: string = ``): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createConfirmButton(onClickCallback, textInButton)
        return this
    }

    setExitButton(onClickCallback?: () => any): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.createExitButton(onClickCallback)
        return this
    }

    show(onShowFinishCallback?: () => any): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.show(onShowFinishCallback)
        return this
    }

    hide(onHideFinishCallback?: () => any): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.hide(onHideFinishCallback)
        return this
    }

    setDepth(depth: number): AlertDialogueBuilder {
        AlertDialogueBuilder.alertDialogueView.setDepth(depth)
        return this
    }
}
