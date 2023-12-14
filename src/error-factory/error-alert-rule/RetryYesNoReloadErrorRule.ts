import { Scene } from 'phaser'
import { AlertDialogue } from '../../scripts/alert-dialogue/AlertDialogue'
import { ErrorObject } from '../ErrorObject'
import { IErrorAlertRule } from './IErrorAlertRule'

export class RetryYesNoReloadErrorRule implements IErrorAlertRule {
    readonly errorCodeList: string[] = [`9001`]

    readonly header: string = ''

    isMatchErrorCode(error: ErrorObject): boolean {
        return this.errorCodeList.some((x) => x == error.code)
    }

    createAlertDialog(
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any
    ): AlertDialogue {
        const errorAlertDialogue = AlertDialogue.showYesNoPopup(
            errorDialogScene,
            error.header,
            '\n' + error.message,
            () => {
                retryAction()
            },
            () => {
                location.reload()
            },
            'TRY AGAIN',
            'CLOSE',
            true
        )
        errorAlertDialogue.getHeader().setColor('#2B2B2B').setFontSize(22)
        return errorAlertDialogue
    }
}
