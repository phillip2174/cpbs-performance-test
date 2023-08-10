import { Scene } from 'phaser'
import { AlertDialogue } from '../../scripts/alert-dialogue/AlertDialogue'
import { ErrorObject } from '../ErrorObject'
import { IErrorAlertRule } from './IErrorAlertRule'

export class RetryYesNoErrorRule implements IErrorAlertRule {
    readonly errorCodeList: string[] = []

    readonly header: string = ''

    isMatchErrorCode(error: ErrorObject): boolean {
        return this.errorCodeList.some((x) => x == error.code)
    }

    createAlertDialog(
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any,
    ): AlertDialogue {
        const errorAlertDialogue = AlertDialogue.showYesNoPopup(
            errorDialogScene,
            'Code ' + error.code,
            '\n' + error.message,
            () => {
                retryAction()
            },
            () => {
                cancelAction()
            },
            '',
            '',
        )
        errorAlertDialogue.getHeader().setColor('#AAAAAA').setFontSize(50)
        return errorAlertDialogue
    }
}
